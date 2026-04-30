import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteChrome } from "@/components/layout/site-chrome";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const stripExtensionHydrationAttributes = `
(function () {
  var blockedAttributePrefixes = ["bis_", "__processed_"];

  function shouldRemoveAttribute(name) {
    for (var index = 0; index < blockedAttributePrefixes.length; index += 1) {
      if (name.indexOf(blockedAttributePrefixes[index]) === 0) {
        return true;
      }
    }

    return false;
  }

  function cleanElement(element) {
    if (!element || !element.attributes) {
      return;
    }

    var removableAttributes = [];

    for (var index = 0; index < element.attributes.length; index += 1) {
      var attributeName = element.attributes[index].name;

      if (shouldRemoveAttribute(attributeName)) {
        removableAttributes.push(attributeName);
      }
    }

    for (var removeIndex = 0; removeIndex < removableAttributes.length; removeIndex += 1) {
      element.removeAttribute(removableAttributes[removeIndex]);
    }
  }

  function cleanTree(root) {
    cleanElement(root);

    if (!root || !root.querySelectorAll) {
      return;
    }

    var elements = root.querySelectorAll("*");

    for (var index = 0; index < elements.length; index += 1) {
      cleanElement(elements[index]);
    }
  }

  cleanTree(document.documentElement);

  if (window.MutationObserver) {
    new MutationObserver(function (mutations) {
      for (var index = 0; index < mutations.length; index += 1) {
        var mutation = mutations[index];

        if (
          mutation.type === "attributes" &&
          shouldRemoveAttribute(mutation.attributeName || "")
        ) {
          cleanElement(mutation.target);
        }

        for (var nodeIndex = 0; nodeIndex < mutation.addedNodes.length; nodeIndex += 1) {
          var node = mutation.addedNodes[nodeIndex];

          if (node.nodeType === 1) {
            cleanTree(node);
          }
        }
      }
    }).observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true
    });
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://nearfix.in"),
  title: "NearFix",
  description: "Find and book trusted local service professionals with NearFix.",
  applicationName: "NearFix",
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    title: "NearFix",
    description: "Find and book trusted local service professionals with NearFix.",
    url: "/",
    siteName: "NearFix",
    images: [
      {
        url: "/nearfix-og.png",
        width: 1200,
        height: 630,
        alt: "NearFix logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NearFix",
    description: "Find and book trusted local service professionals with NearFix.",
    images: ["/nearfix-og.png"],
  },
  appleWebApp: {
    capable: true,
    title: "NearFix",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full" suppressHydrationWarning>
        <Script
          dangerouslySetInnerHTML={{
            __html: stripExtensionHydrationAttributes,
          }}
          id="strip-extension-hydration-attributes"
          strategy="beforeInteractive"
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
