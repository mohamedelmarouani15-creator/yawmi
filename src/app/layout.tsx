import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, Amiri } from "next/font/google";
import RegisterSW from "@/components/RegisterSW";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yawmi — يومي",
  description: "Application familiale musulmane au quotidien",
  applicationName: "Yawmi",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Yawmi",
    startupImage: "/icons/icon-512x512.png",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "Yawmi — يومي",
    description: "Application familiale musulmane au quotidien",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${bricolage.variable} ${dmSans.variable} ${amiri.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#055C3F" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
