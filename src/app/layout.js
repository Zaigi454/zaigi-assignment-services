import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(
    "https://zaigi-assignment-services.vercel.app"
  ),

  title: {
    default: "Zaigi Assignment Services",
    template: "%s | Zaigi Assignment Services",
  },

  description:
    "Professional Assignment Writing Services in Pakistan. BSCS, BBA, MBA, IT, Engineering and University Assignments with quality work, affordable prices and on-time delivery.",

  verification: {
    google: "wBozSb2Y-wWXsaGI_Nu7ylw0kE8beuZzDnViaNjJ0H0",
  },

  keywords: [
    "Assignment Writing",
    "Assignment Services",
    "University Assignments",
    "Pakistan Assignment",
    "BSCS Assignment",
    "BBA Assignment",
    "Programming Assignment",
    "Database Assignment",
    "Zaigi Assignment Services",
    "Academic Writing",
  ],

  authors: [
    {
      name: "Zaigi Assignment Services",
    },
  ],

  creator: "Zaigi Assignment Services",

  publisher: "Zaigi Assignment Services",

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    title: "Zaigi Assignment Services",
    description:
      "Professional Assignment Writing Services in Pakistan.",
    url: "https://zaigi-assignment-services.vercel.app",
    siteName: "Zaigi Assignment Services",
    type: "website",
    locale: "en_PK",
  },

  twitter: {
    card: "summary_large_image",
    title: "Zaigi Assignment Services",
    description:
      "Professional Assignment Writing Services in Pakistan.",
  },

  alternates: {
    canonical:
      "https://zaigi-assignment-services.vercel.app",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}