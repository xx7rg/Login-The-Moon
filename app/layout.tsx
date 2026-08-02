import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "x7rG Login Experience — Uma missão além do login",
  description:
    "Experiência cinematográfica de login em cenário lunar, criada pela x7rG Enterprise.",
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var q=new URLSearchParams(location.search);var u=navigator.userAgent||"";if(q.get("expo")==="1"||/\\bwv\\b|ReactNativeWebView|x7rg-native-webview/i.test(u)){document.documentElement.classList.add("x7rg-native-webview");}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{
          "--asset-landscape": `url("${basePath}/x7rg-lunar-landscape.png")`,
          "--asset-caravan": `url("${basePath}/camel-caravan-realistic.png")`,
          "--asset-rover": `url("${basePath}/opportunity-rover.png")`,
          "--asset-lander": `url("${basePath}/lunar-lander-right-ridge.png")`,
          "--asset-bicycle": `url("${basePath}/assets/et-bicycle-reference.png")`,
        } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
