import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Calculadora Distribuída · A3",
  description:
    "Calculadora distribuída com microserviços independentes em Docker. Se um serviço cair, os demais continuam funcionando.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
