import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Product {
  id: string;
  name_id: string;
  name_en: string;
  description_id: string | null;
  description_en: string | null;
  category: string;
  brand: string | null;
  image_url: string | null;
  is_featured: boolean | null;
}

const ProductsPage = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name_id: "",
    name_en: "",
    description_id: "",
    description_en: "",
    category: "",
    brand: "",
    image_url: "",
    is_featured: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const { error } = await supabase.from("products").update(formData).eq("id", editingProduct.id);
      if (error) {
        toast({ title: t("error"), description: error.message, variant: "destructive" });
      } else {
        toast({ title: t("success"), description: "Product updated" });
        fetchProducts();
        setIsDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase.from("products").insert([formData]);
      if (error) {
        toast({ title: t("error"), description: error.message, variant: "destructive" });
      } else {
        toast({ title: t("success"), description: "Product created" });
        fetchProducts();
        setIsDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirm") + "?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("success"), description: "Product deleted" });
      fetchProducts();
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name_id: product.name_id,
      name_en: product.name_en,
      description_id: product.description_id || "",
      description_en: product.description_en || "",
      category: product.category,
      brand: product.brand || "",
      image_url: product.image_url || "",
      is_featured: product.is_featured || false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name_id: "",
      name_en: "",
      description_id: "",
      description_en: "",
      category: "",
      brand: "",
      image_url: "",
      is_featured: false,
    });
  };

  const filteredProducts = products.filter((p) => {
    const name = language === "id" ? p.name_id : p.name_en;
    return name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("allProducts")}</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchProducts")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("addProduct")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? t("editProduct") : t("addProduct")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">{t("productName")} (ID)</label>
                        <Input value={formData.name_id} onChange={(e) => setFormData({ ...formData, name_id: e.target.value })} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t("productName")} (EN)</label>
                        <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">{t("description")} (ID)</label>
                        <Textarea value={formData.description_id} onChange={(e) => setFormData({ ...formData, description_id: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t("description")} (EN)</label>
                        <Textarea value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">{t("category")}</label>
                        <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t("brand")}</label>
                        <Input value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">{t("imageUrl")}</label>
                      <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="featured" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} />
                      <label htmlFor="featured" className="text-sm font-medium">{t("featured")}</label>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t("cancel")}</Button>
                      <Button type="submit" className="bg-primary text-primary-foreground">{t("save")}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">{t("loading")}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noProducts")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-card border border-border p-6 hover:border-primary transition-colors">
                  {product.image_url && (
                    <img src={product.image_url} alt={language === "id" ? product.name_id : product.name_en} className="w-full h-48 object-cover mb-4" />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1">{product.category}</span>
                      {product.brand && <span className="text-xs bg-muted text-muted-foreground px-2 py-1 ml-2">{product.brand}</span>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-3">{language === "id" ? product.name_id : product.name_en}</h3>
                  <p className="text-muted-foreground text-sm mt-2">{language === "id" ? product.description_id : product.description_en}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;
