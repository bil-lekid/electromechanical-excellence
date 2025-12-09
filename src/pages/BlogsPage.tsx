import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, FileText, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { z } from "zod";

const blogSchema = z.object({
  title_id: z.string().min(1, "Indonesian title is required").max(200, "Title too long"),
  title_en: z.string().min(1, "English title is required").max(200, "Title too long"),
  content_id: z.string().min(1, "Indonesian content is required").max(50000, "Content too long"),
  content_en: z.string().min(1, "English content is required").max(50000, "Content too long"),
  excerpt_id: z.string().max(500, "Excerpt too long").nullable().optional(),
  excerpt_en: z.string().max(500, "Excerpt too long").nullable().optional(),
  image_url: z.union([z.string().url("Invalid URL format"), z.literal("")]).nullable().optional(),
  author: z.string().max(100, "Author name too long").nullable().optional(),
  is_published: z.boolean().optional(),
});

interface Blog {
  id: string;
  title_id: string;
  title_en: string;
  content_id: string;
  content_en: string;
  excerpt_id: string | null;
  excerpt_en: string | null;
  image_url: string | null;
  author: string | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string;
}

const BlogsPage = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState({
    title_id: "",
    title_en: "",
    content_id: "",
    content_en: "",
    excerpt_id: "",
    excerpt_en: "",
    image_url: "",
    author: "",
    is_published: false,
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    // For admin view, fetch all blogs including unpublished
    const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      setBlogs(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = blogSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast({ title: t("error"), description: firstError.message, variant: "destructive" });
      return;
    }

    const validatedData = {
      title_id: result.data.title_id,
      title_en: result.data.title_en,
      content_id: result.data.content_id,
      content_en: result.data.content_en,
      excerpt_id: result.data.excerpt_id || null,
      excerpt_en: result.data.excerpt_en || null,
      image_url: result.data.image_url || null,
      author: result.data.author || null,
      is_published: result.data.is_published ?? false,
      published_at: result.data.is_published ? new Date().toISOString() : null,
    };

    if (editingBlog) {
      const { error } = await supabase.from("blogs").update(validatedData).eq("id", editingBlog.id);
      if (error) {
        toast({ title: t("error"), description: error.message, variant: "destructive" });
      } else {
        toast({ title: t("success"), description: "Blog updated" });
        fetchBlogs();
        setIsDialogOpen(false);
        resetForm();
      }
    } else {
      const { error } = await supabase.from("blogs").insert([validatedData]);
      if (error) {
        toast({ title: t("error"), description: error.message, variant: "destructive" });
      } else {
        toast({ title: t("success"), description: "Blog created" });
        fetchBlogs();
        setIsDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirm") + "?")) return;
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) {
      toast({ title: t("error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("success"), description: "Blog deleted" });
      fetchBlogs();
    }
  };

  const openEditDialog = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title_id: blog.title_id,
      title_en: blog.title_en,
      content_id: blog.content_id,
      content_en: blog.content_en,
      excerpt_id: blog.excerpt_id || "",
      excerpt_en: blog.excerpt_en || "",
      image_url: blog.image_url || "",
      author: blog.author || "",
      is_published: blog.is_published || false,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingBlog(null);
    setFormData({
      title_id: "",
      title_en: "",
      content_id: "",
      content_en: "",
      excerpt_id: "",
      excerpt_en: "",
      image_url: "",
      author: "",
      is_published: false,
    });
  };

  const filteredBlogs = blogs.filter((b) => {
    const title = language === "id" ? b.title_id : b.title_en;
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t("allBlogs")}</h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("searchBlogs")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    {t("addBlog")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingBlog ? t("editBlog") : t("addBlog")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">{t("blogTitle")} (ID)</label>
                        <Input value={formData.title_id} onChange={(e) => setFormData({ ...formData, title_id: e.target.value })} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t("blogTitle")} (EN)</label>
                        <Input value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">{t("excerpt")} (ID)</label>
                        <Textarea value={formData.excerpt_id} onChange={(e) => setFormData({ ...formData, excerpt_id: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t("excerpt")} (EN)</label>
                        <Textarea value={formData.excerpt_en} onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">{t("content")} (ID)</label>
                        <Textarea rows={6} value={formData.content_id} onChange={(e) => setFormData({ ...formData, content_id: e.target.value })} required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t("content")} (EN)</label>
                        <Textarea rows={6} value={formData.content_en} onChange={(e) => setFormData({ ...formData, content_en: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">{t("imageUrl")}</label>
                        <Input value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-sm font-medium">{t("author")}</label>
                        <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="published" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} />
                      <label htmlFor="published" className="text-sm font-medium">{t("published")}</label>
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
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{t("noBlogs")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <div key={blog.id} className="bg-card border border-border overflow-hidden hover:border-primary transition-colors">
                  {blog.image_url && (
                    <img src={blog.image_url} alt={language === "id" ? blog.title_id : blog.title_en} className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(blog.created_at)}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(blog)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {!blog.is_published && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-1">Draft</span>
                      )}
                      {blog.author && <span className="text-xs text-muted-foreground">{blog.author}</span>}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{language === "id" ? blog.title_id : blog.title_en}</h3>
                    <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
                      {language === "id" ? (blog.excerpt_id || blog.content_id) : (blog.excerpt_en || blog.content_en)}
                    </p>
                    <Button variant="link" className="px-0 mt-3 text-primary">
                      {t("readMore")} →
                    </Button>
                  </div>
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

export default BlogsPage;
