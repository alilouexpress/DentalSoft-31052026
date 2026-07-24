import * as React from "react";
import { type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageContext } from "@/i18n/language-context";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <LanguageContext.Consumer>
          {(ctx) => {
            const t = ctx?.t ?? ((key: string) => key);
            return (
            <div className="flex items-center justify-center min-h-[300px] p-6">
              <Card className="max-w-md w-full card-hover overflow-hidden">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="h-7 w-7 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{t("error-boundary.title")}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {this.state.error?.message || t("error-boundary.description")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => this.setState({ hasError: false, error: undefined })}
                  >
                    <RefreshCw className="h-4 w-4" /> {t("error-boundary.retry")}
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
          }}
        </LanguageContext.Consumer>
      );
    }
    return this.props.children;
  }
}
