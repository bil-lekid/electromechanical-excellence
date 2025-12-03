-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_id TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_id TEXT,
  description_en TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_id TEXT NOT NULL,
  title_en TEXT NOT NULL,
  content_id TEXT NOT NULL,
  content_en TEXT NOT NULL,
  excerpt_id TEXT,
  excerpt_en TEXT,
  image_url TEXT,
  author TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Public read policies (anyone can view)
CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Published blogs are viewable by everyone" 
ON public.blogs FOR SELECT USING (is_published = true);

-- Public insert/update/delete for now (admin auth can be added later)
CREATE POLICY "Anyone can insert products" 
ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update products" 
ON public.products FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete products" 
ON public.products FOR DELETE USING (true);

CREATE POLICY "Anyone can insert blogs" 
ON public.blogs FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update blogs" 
ON public.blogs FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete blogs" 
ON public.blogs FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();