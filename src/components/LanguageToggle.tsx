import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "id" ? "en" : "id")}
      className="flex items-center gap-2"
    >
      <Globe className="w-4 h-4" />
      <span className="font-medium">{language.toUpperCase()}</span>
    </Button>
  );
};

export default LanguageToggle;
