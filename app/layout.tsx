import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Latte Soul — The Art of the Pour",
  description:
    "A cinematic scrollytelling experience for Latte Soul Coffee Shop, Hamden CT. Single-origin espresso, slow-melting ice, golden finish.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='black' stroke='%23D4AF37' stroke-width='3'/%3E%3Ctext x='32' y='41' font-family='sans-serif' font-size='24' font-weight='bold' fill='%23D4AF37' text-anchor='middle'%3ELS%3C/text%3E%3C/svg%3E"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,200;14..32,300;14..32,400;14..32,500;14..32,600;14..32,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
