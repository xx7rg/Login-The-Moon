import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const siteUrl = "https://xx7g.github.io/Login-The-Moon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "x7rG Login Experience — Uma missão além do login";
const description =
  "Experiência cinematográfica de login em cenário lunar, criada pela x7rG Enterprise.";

export const metadata: Metadata = {
  metadataBase: new URL(`${siteUrl}/`),
  title,
  description,
  icons: {
    icon: `${basePath}/favicon-x7rg.png`,
    shortcut: `${basePath}/favicon-x7rg.png`,
  },
  openGraph: {
    title,
    description,
    url: `${siteUrl}/`,
    siteName: "x7rG Enterprise",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/favicon-x7rg.png",
        width: 512,
        height: 512,
        alt: "x7rG Enterprise",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/favicon-x7rg.png"],
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
