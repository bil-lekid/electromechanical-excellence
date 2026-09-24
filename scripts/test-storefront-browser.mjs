// Isolated browser test: API responses are mocked, never sent to Supabase.
import { chromium } from '../node_modules/.ppp-qa/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
await fs.mkdir('artifacts',{recursive:true});
await build({entryPoints:['src/lib/store.ts'],bundle:true,platform:'node',format:'esm',outfile:'node_modules/.ppp-qa/store-test.mjs'});
const {demoProducts,parseCart,filterProducts}=await import('../node_modules/.ppp-qa/store-test.mjs');
assert.deepEqual(parseCart('{'),[]);assert.deepEqual(parseCart('[{"productId":"a","quantity":-1}]'),[]);
assert.equal(filterProducts(demoProducts,'omron','','',false,'name').length,2);
assert.equal(filterProducts(demoProducts,'not-a-product','','',false,'name').length,0);
const products=demoProducts.map((p,i)=>({...p,id:`aaaaaaaa-aaaa-4aaa-8aaa-${String(i+1).padStart(12,'0')}`,price_idr:i===0?125000:null}));
const env=Object.fromEntries((await fs.readFile('.env','utf8')).split(/\r?\n/).filter(x=>x.includes('=')).map(x=>{const i=x.indexOf('=');return [x.slice(0,i),x.slice(i+1).replace(/^["']|["']$/g,'')]}));
const origin=env.VITE_SUPABASE_URL;
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const context=await browser.newContext({viewport:{width:1440,height:1100}});
// External webfonts must not hold local application navigation open.
await context.route('https://fonts.googleapis.com/**',route=>route.abort());
const errors=[]; const user={id:'22222222-2222-4222-8222-222222222222',email:'buyer@example.test',aud:'authenticated',role:'authenticated',created_at:new Date().toISOString()};
let failSubmit=true, admin=false, submitted;
const quoteId='44444444-4444-4444-8444-444444444444';
const jwt=[{alg:'HS256',typ:'JWT'},{sub:user.id,exp:Math.floor(Date.now()/1000)+3600,role:'authenticated'},'test'].map((v,i)=>i===2?v:Buffer.from(JSON.stringify(v)).toString('base64url')).join('.');
await context.route(`${origin}/**`,async route=>{
  const req=route.request(), url=new URL(req.url());
  const respond=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  if(url.pathname==='/auth/v1/token') return respond({access_token:jwt,refresh_token:'local-test-refresh',expires_in:3600,token_type:'bearer',user});
  if(url.pathname==='/auth/v1/logout') return respond({});
  if(url.pathname==='/rest/v1/rpc/is_admin') return respond(admin);
  if(url.pathname==='/rest/v1/rpc/catalog_facets') return respond({ categories:[...new Set(products.map(p=>p.category))], brands:[...new Set(products.map(p=>p.brand).filter(Boolean))].sort().map(name=>({name,count:products.filter(p=>p.brand===name).length})) });
  if(url.pathname==='/rest/v1/products') {
    let rows=products.filter(p=>p.is_active);
    for(const field of ['category','brand','availability','id']) {
      const filter=url.searchParams.get(field);
      if(filter?.startsWith('eq.')) rows=rows.filter(p=>p[field]===filter.slice(3));
      if(filter?.startsWith('neq.')) rows=rows.filter(p=>p[field]!==filter.slice(4));
      if(filter?.startsWith('in.(')) rows=rows.filter(p=>filter.slice(4,-1).split(',').includes(p[field]));
    }
    for(const filter of url.searchParams.getAll('search_text')) rows=rows.filter(p=>`${p.name_id} ${p.brand??''} ${p.sku??''} ${p.category}`.toLowerCase().includes(filter.slice(7,-1).toLowerCase()));
    const total=rows.length, offset=Number(url.searchParams.get('offset')||0), limit=Number(url.searchParams.get('limit')||1000);
    rows=rows.slice(offset,offset+limit);
    return route.fulfill({status:200,contentType:'application/json',headers:{'Content-Range':`${offset}-${offset+rows.length-1}/${total}`,'Access-Control-Expose-Headers':'Content-Range'},body:JSON.stringify(rows)});
  }
  if(url.pathname==='/rest/v1/rpc/submit_quote'){
    if(failSubmit)return respond({message:'Test connection failure',code:'TEST'},503);
    submitted=req.postDataJSON(); return respond(quoteId);
  }
  if(url.pathname==='/rest/v1/quote_requests')return respond(submitted?[{id:quoteId,user_id:user.id,contact_name:'Buyer Test',company:'Example Company',email:user.email,phone:'081234567890',address:'Test delivery address Jakarta',notes:'',status:'submitted',created_at:new Date().toISOString()}]:[]);
  if(url.pathname==='/rest/v1/quote_items')return respond(submitted?[{id:'item',quote_id:quoteId,product_id:products[0].id,product_name:products[0].name_id,sku:products[0].sku,unit:'pcs',quantity:3,reference_price_idr:125000}]:[]);
  return respond({message:'Unmocked endpoint'},400);
});
const page=await context.newPage();page.setDefaultTimeout(15000);page.setDefaultNavigationTimeout(20000);page.on('pageerror',error=>{errors.push(error.message);console.log('PAGE ERROR',error.message);});
const base=process.env.CATALOG_TEST_BASE || 'http://127.0.0.1:8082';
await page.goto(base,{waitUntil:'domcontentloaded'});await page.getByRole('heading',{name:/Pengadaan elektrikal/}).waitFor();console.log('PASS home loaded');
await page.getByRole('searchbox').fill('Omron');
await page.screenshot({path:'artifacts/search-state.png'});console.log('Search filled',page.url());
await page.getByRole('button',{name:'Cari',exact:true}).click();
try { await page.getByText('2 produk',{exact:true}).waitFor(); } catch(e) { console.log(await page.locator('main').innerText()); console.log(errors); await page.screenshot({path:'artifacts/test-failure.png'}); await browser.close(); throw e; } console.log('PASS search');
await page.getByLabel('Kategori',{exact:true}).selectOption('Komponen Elektrikal');await page.getByRole('heading',{name:'Produk belum ditemukan'}).waitFor();
await page.getByRole('button',{name:'Reset semua filter'}).click();await page.getByText('12 produk',{exact:true}).waitFor();
await page.getByRole('link',{name:`Lihat ${products[0].name_id}`,exact:true}).click();
await page.getByRole('heading',{name:products[0].name_id,exact:true}).waitFor();
await page.getByLabel('Jumlah produk',{exact:true}).fill('3');await page.getByRole('button',{name:'Tambah ke keranjang',exact:true}).click();
await page.goto(base+'/cart');await page.getByLabel('Jumlah produk',{exact:true}).waitFor();assert.equal(await page.getByLabel('Jumlah produk',{exact:true}).inputValue(),'3');
await page.reload();assert.equal(await page.getByLabel('Jumlah produk',{exact:true}).inputValue(),'3');
await page.getByRole('link',{name:'Masuk untuk mengajukan'}).click();
await page.getByLabel('Email',{exact:true}).fill(user.email);await page.getByLabel('Kata sandi',{exact:true}).fill('example-password-123');await page.getByRole('button',{name:'Masuk',exact:true}).click();
await page.waitForURL(base+'/cart');await page.getByLabel('Nama lengkap',{exact:true}).fill('Buyer Test');await page.getByLabel('Perusahaan',{exact:true}).fill('Example Company');await page.getByLabel('Nomor telepon / WhatsApp',{exact:true}).fill('081234567890');await page.getByLabel('Alamat tujuan',{exact:true}).fill('Test delivery address Jakarta');
await page.getByRole('button',{name:'Ajukan penawaran',exact:true}).click();await page.getByText('Permintaan belum dapat dikonfirmasi.',{exact:false}).waitFor();
assert.equal(await page.getByLabel('Jumlah produk',{exact:true}).inputValue(),'3');
failSubmit=false;await page.getByRole('button',{name:'Ajukan penawaran',exact:true}).click();await page.getByRole('heading',{name:'Terima kasih. Mari kami bantu.'}).waitFor();
assert.deepEqual(Object.keys(submitted).sort(),['_contact','_items','_token']);assert.deepEqual(submitted._items,[{product_id:products[0].id,quantity:3}]);
await page.getByRole('link',{name:'Lihat permintaan saya'}).click();await page.getByText('RFQ-44444444',{exact:true}).click();await page.getByText('Miniature Circuit Breaker · 3 pcs',{exact:true}).waitFor();
await page.goto(base+'/admin');await page.waitForURL(base+'/');
await page.goto(base+'/about');await page.getByText('CV. Prima Putra Perkasa adalah perusahaan General Supplier',{exact:false}).waitFor();await page.getByRole('button',{name:'English',exact:true}).click();await page.getByText('CV. Prima Putra Perkasa is a General Supplier company',{exact:false}).waitFor();
if (!process.env.CATALOG_TEST_NO_DEMO) { await page.goto('http://127.0.0.1:8081');await page.getByText('Pratinjau katalog contoh',{exact:false}).waitFor(); }
await page.screenshot({path:'artifacts/storefront-desktop.png',fullPage:true});
await page.goto(base);
await page.setViewportSize({width:390,height:844});await page.reload();await page.getByRole('heading',{name:/Pengadaan elektrikal/}).waitFor();
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);await page.screenshot({path:'artifacts/storefront-mobile.png',fullPage:true});
await page.getByRole('button',{name:'Menu navigasi',exact:true}).click();await page.getByRole('navigation',{name:'Navigasi utama'}).getByRole('link',{name:'Semua produk',exact:true}).click();await page.getByText('12 produk',{exact:true}).waitFor();
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
assert.deepEqual(errors,[]);
await browser.close();console.log('PASS catalog search/filter, detail quantity, persistent cart, login return, failed-submit preservation, successful submission, payload integrity, private history UI, admin guard, bilingual About, mobile navigation and overflow.');
