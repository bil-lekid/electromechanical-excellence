import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const authSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Password must be less than 100 characters"),
});

const AuthPage = () => {
  const { t } = useLanguage();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    if (mode === "login") {
      const { error } = await signIn(email, password);
      if (error) {
        let message = error.message;
        if (error.message.includes("Invalid login credentials")) {
          message = t("invalidCredentials") || "Invalid email or password";
        }
        toast({ title: t("error"), description: message, variant: "destructive" });
      } else {
        toast({ title: t("success"), description: t("loginSuccess") || "Logged in successfully" });
        navigate("/");
      }
    } else {
      const { error } = await signUp(email, password);
      if (error) {
        let message = error.message;
        if (error.message.includes("User already registered")) {
          message = t("userExists") || "This email is already registered";
        }
        toast({ title: t("error"), description: message, variant: "destructive" });
      } else {
        toast({ 
          title: t("success"), 
          description: t("signupSuccess") || "Account created! Check your email to confirm." 
        });
      }
    }
    
    setLoading(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-16 flex items-center justify-center">
        <div className="w-full max-w-md px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToHome") || "Back to Home"}
          </Button>
          
          <div className="bg-card border border-border p-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {mode === "login" ? (t("login") || "Login") : (t("signup") || "Sign Up")}
            </h1>
            <p className="text-muted-foreground mb-6">
              {mode === "login" 
                ? (t("loginDescription") || "Sign in to access admin features")
                : (t("signupDescription") || "Create an account to get started")
              }
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  {t("email") || "Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    placeholder="admin@example.com"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground block mb-1">
                  {t("password") || "Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {mode === "login" ? (t("login") || "Login") : (t("signup") || "Sign Up")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                {mode === "login" 
                  ? (t("noAccount") || "Don't have an account?")
                  : (t("hasAccount") || "Already have an account?")
                }
                <button
                  type="button"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="text-primary ml-1 hover:underline"
                >
                  {mode === "login" ? (t("signup") || "Sign Up") : (t("login") || "Login")}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;
