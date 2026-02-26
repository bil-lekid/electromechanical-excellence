import { MessageCircle, Phone, FileText } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const FloatingCTA = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  const actions = [
    {
      icon: FileText,
      label: t("quickQuote"),
      href: "#contact",
      color: "bg-primary hover:bg-primary/90",
    },
    {
      icon: Phone,
      label: t("callNow"),
      href: "tel:+62216246441",
      color: "bg-secondary hover:bg-secondary/90",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded actions */}
      <div className={`flex flex-col gap-2 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className={`${action.color} text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-lg transition-all duration-300 hover:scale-105`}
            onClick={() => setIsOpen(false)}
          >
            <action.icon className="w-5 h-5" />
            <span className="font-medium text-sm whitespace-nowrap">{action.label}</span>
          </a>
        ))}
      </div>

      {/* Main WhatsApp button */}
      <a
        href="https://wa.me/6287885572522"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-primary-foreground p-4 shadow-lg transition-all duration-300 hover:scale-110 animate-pulse hover:animate-none group"
        aria-label="WhatsApp"
      >
        <MessageCircle className={`w-7 h-7 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
      </a>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-2 bg-card text-card-foreground px-3 py-2 text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-border">
        {t("chatWithUs")}
      </div>
    </div>
  );
};

export default FloatingCTA;
