import { Inter, Playfair_Display } from "next/font/google";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  weight: ["600", "700"],
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  title: "WedPlan | Plan Your Perfect Wedding",
  description:
    "Discover trusted wedding professionals and plan a celebration that feels like you.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster
          position="top-center"
          offset={80}
          mobileOffset={72}
          duration={3000}
          richColors
          closeButton
          toastOptions={{ className: "rounded-xl border-border shadow-lg" }}
        />
      </body>
    </html>
  );
}
