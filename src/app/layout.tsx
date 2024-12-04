import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

/*
Driveline is a car-based social media plaform that allows users to connect to other people in their community with similar automotive interests.
*/

export const metadata: Metadata = {
  title: "Driveline | Drive Together",
  description:
    "Driveline is a car-based social media plaform that allows users to connect to other people in their community with similar automotive interests.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.className} dark antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="mx-auto flex min-h-screen max-w-[120rem] flex-nowrap border-l border-r bg-background">
            {children}
          </div>
        </Providers>
        <Toaster richColors />
      </body>
    </html>
  );
}
