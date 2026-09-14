import "@/styles/globals.css";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "Lecturer Portal - Chitepo School of Ideology",
    template: `%s - Lecturer Portal`,
  },
  description: "Lecturer portal for Chitepo School of Ideology",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <head />
      <body className="min-h-screen bg-gray-50 font-sans antialiased text-gray-900">
        {children}
      </body>
    </html>
  );
}
