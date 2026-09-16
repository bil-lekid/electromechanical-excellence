// Run after installing @electric-sql/pglite in node_modules/.ppp-qa.
import { PGlite } from '../node_modules/.ppp-qa/node_modules/@electric-sql/pglite/dist/index.js';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const db = new PGlite();
const admin='11111111-1111-4111-8111-111111111111', user='22222222-2222-4222-8222-222222222222', other='33333333-3333-4333-8333-333333333333';
await db.exec(`create role anon; create role authenticated; create schema auth;
create table auth.users(id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
grant usage on schema public, auth to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;`);
for(const file of (await fs.readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort()) await db.exec(await fs.readFile(`supabase/migrations/${file}`,'utf8'));
await db.query('insert into auth.users values ($1,$2),($3,$4),($5,$6)',[admin,'admin@example.test',user,'user@example.test',other,'other@example.test']);
await db.query("insert into public.user_roles(user_id,role) values ($1,'admin')",[admin]);
const product=(await db.query("insert into public.products(name_id,name_en,category,price_idr,availability) values ('Test component','Test component','Test',10000,'ready') returning id")).rows[0].id;
const hidden=(await db.query("insert into public.products(name_id,name_en,category,is_active) values ('Hidden','Hidden','Test',false) returning id")).rows[0].id;
async function as(role,uid,sql,args=[]) {
  await db.exec('begin');
  try { await db.exec(`set local role ${role}`); await db.query("select set_config('request.jwt.claim.sub',$1,true)",[uid||'']); const result=await db.query(sql,args); await db.exec('commit'); return result.rows; }
  catch(e){await db.exec('rollback');throw e;}
}
let count=0;
async function check(name,fn){await fn();console.log('PASS '+name);count++;}
const contact={name:'Test User',company:'Example Company',phone:'081234567890',address:'Test delivery address',notes:''};
const token='44444444-4444-4444-8444-444444444444';
const submit=(role,uid,t=token,items=[{product_id:product,quantity:2}],extra={})=>as(role,uid,'select public.submit_quote($1,$2,$3) as id',[t,{...contact,...extra},items]);
await check('anonymous sees active products only',async()=>assert.equal((await as('anon',null,'select * from public.products')).length,1));
await check('ordinary account cannot create products or self-assign admin',async()=>{await assert.rejects(as('authenticated',user,"insert into public.products(name_id,name_en,category) values ('bad','bad','bad')"));await assert.rejects(as('authenticated',user,"insert into public.user_roles(user_id,role) values ($1,'admin')",[user]));});
await check('admin can read hidden products',async()=>assert.equal((await as('authenticated',admin,'select * from public.products')).length,2));
await check('anonymous cannot invoke privileged role helpers or submit',async()=>{await assert.rejects(as('anon',null,'select public.is_admin()'));await assert.rejects(submit('anon',null));});
await check('role helper only checks caller',async()=>{assert.equal((await as('authenticated',user,"select public.has_role($1,'admin') as allowed",[admin]))[0].allowed,false);assert.equal((await as('authenticated',admin,'select public.is_admin() as allowed'))[0].allowed,true);});
await check('invalid products and quantities roll back entire request',async()=>{for(const items of [[{product_id:product,quantity:0}],[{product_id:product,quantity:1.5}],[{product_id:hidden,quantity:1}],[{product_id:product,quantity:1},{product_id:product,quantity:2}],[]])await assert.rejects(submit('authenticated',user,token,items));assert.equal((await db.query('select * from public.quote_requests')).rows.length,0);});
let quoteId;
await check('authenticated submission snapshots authoritative product price and email',async()=>{quoteId=(await submit('authenticated',user,token,[{product_id:product,quantity:2,price_idr:1}],{email:'attacker@example.test'}))[0].id;const row=(await db.query('select * from public.quote_items')).rows[0];assert.equal(Number(row.reference_price_idr),10000);assert.equal((await db.query('select email from public.quote_requests')).rows[0].email,'user@example.test');});
await check('retry returns same request instead of duplicating it',async()=>{assert.equal((await submit('authenticated',user))[0].id,quoteId);assert.equal((await db.query('select * from public.quote_requests')).rows.length,1);});
await check('submission is rate limited per account',async()=>await assert.rejects(submit('authenticated',user,'55555555-5555-4555-8555-555555555555')));
await check('other account cannot see private contact or quote items',async()=>{assert.equal((await as('authenticated',other,'select * from public.quote_requests')).length,0);assert.equal((await as('authenticated',other,'select * from public.quote_items')).length,0);assert.equal((await as('authenticated',user,'select * from public.quote_requests')).length,1);});
await check('customer cannot alter status or item snapshots',async()=>{await as('authenticated',user,"update public.quote_requests set status='closed' where id=$1",[quoteId]);assert.equal((await db.query('select status from public.quote_requests')).rows[0].status,'submitted');await assert.rejects(as('authenticated',user,'update public.quote_items set reference_price_idr=1'));});
await check('admin can update status but cannot rewrite contact or item snapshots',async()=>{await as('authenticated',admin,"update public.quote_requests set status='reviewing' where id=$1",[quoteId]);assert.equal((await db.query('select status from public.quote_requests')).rows[0].status,'reviewing');await assert.rejects(as('authenticated',admin,"update public.quote_requests set company='tampered'"));await assert.rejects(as('authenticated',admin,'update public.quote_items set quantity=99'));});
await db.close();console.log(`${count} database security checks passed.`);
