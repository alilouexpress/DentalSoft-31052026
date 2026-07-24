import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/language-context";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="h-20 w-20 rounded-2xl bg-muted/60 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>
        <p className="text-lg font-semibold text-foreground mb-1">{t("not-found.title")}</p>
        <p className="text-sm text-muted-foreground mb-6">{t("not-found.desc")}</p>
        <Link href="/">
          <Button className="gap-2">
            <ArrowLeft className="h-4 w-4" /> {t("not-found.back")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
