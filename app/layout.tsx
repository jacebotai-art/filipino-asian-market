import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./mobile-optimizations.css";
import { CartProvider } from "./components/CartContext";
import { ChatWidget } from "./components/ChatWidget";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Filipino Asian Market | Filipino Grocery Store Oklahoma City",
  description: "Best Filipino grocery store in Oklahoma City. Fresh Filipino food, seafood, produce, pancit, lumpia, sinigang ingredients. Family-owned Filipino supermarket since 1995. Order online for pickup!",
  keywords: "Filipino grocery store Oklahoma City, Filipino supermarket OKC, Filipino food market Oklahoma, Asian grocery OKC, buy Filipino food online Oklahoma, Filipino ingredients Oklahoma City, pancit, lumpia, sinigang, fresh seafood Filipino",
  authors: [{ name: "Filipino Asian Market" }],
  creator: "Filipino Asian Market",
  publisher: "Filipino Asian Market",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://filipinoasianmarket.com",
    siteName: "Filipino Asian Market",
    title: "Filipino Asian Market | Filipino Grocery Store Oklahoma City",
    description: "Best Filipino grocery store in Oklahoma City. Fresh Filipino food, seafood, produce. Family-owned since 1995. Order online for pickup!",
    images: [
      {
        url: "https://filipinoasianmarket.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Filipino Asian Market - Fresh Filipino Groceries Oklahoma City",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Filipino Asian Market | Filipino Grocery Store Oklahoma City",
    description: "Best Filipino grocery store in Oklahoma City. Fresh Filipino food, seafood, produce. Order online for pickup!",
    images: ["https://filipinoasianmarket.com/og-image.jpg"],
  },
  alternates: {
    canonical: "https://filipinoasianmarket.com",
  },
  verification: {
    google: "AM2kmDQQr_A7QipjRpOvXO2IdWHHx4BbS8Sl4mDgY6s",
  },
};

// Local Business Schema JSON-LD
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "GroceryStore",
  "name": "Filipino Asian Market",
  "alternateName": "Manila Mart",
  "description": "Family-owned Filipino grocery store in Oklahoma City offering fresh produce, seafood, and authentic Filipino ingredients since 1995.",
  "url": "https://filipinoasianmarket.com",
  "telephone": "+1-405-555-6278",
  "email": "hello@filipinoasianmarket.com",
  "priceRange": "$",
  "openingHours": [
    "Mo-Fr 08:00-21:00",
    "Sa 07:00-22:00",
    "Su 08:00-20:00"
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "1234 Mabuhay Street",
    "addressLocality": "Oklahoma City",
    "addressRegion": "OK",
    "postalCode": "73102",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "35.4676",
    "longitude": "-97.5164"
  },
  "image": "https://filipinoasianmarket.com/og-image.jpg",
  "foundingDate": "1995",
  "paymentAccepted": "Cash, Credit Card, Debit Card, Apple Pay, Google Pay",
  "currenciesAccepted": "USD",
  "areaServed": {
    "@type": "City",
    "name": "Oklahoma City",
    "containedInPlace": {
      "@type": "State",
      "name": "Oklahoma"
    }
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Filipino Grocery Products",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Fresh Produce"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Filipino Seafood"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Product",
          "name": "Filipino Pantry Staples"
        }
      }
    ]
  },
  "sameAs": [
    "https://www.facebook.com/filipinoasianmarket",
    "https://www.instagram.com/filipinoasianmarket"
  ]
};

// Website Schema
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Filipino Asian Market",
  "url": "https://filipinoasianmarket.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://filipinoasianmarket.com/products?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
            <ChatWidget />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}