import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/components/providers/ThemeRegistry";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Prompt Engineering Tool",
  description: "チームのプロンプトエンジニアリングを効率化するツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
