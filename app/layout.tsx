import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fuel Wanga - Find fuel nearby",
  description: "Community fuel updates for drivers in Malawi.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
