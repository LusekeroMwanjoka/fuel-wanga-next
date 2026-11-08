import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fuel Wanga — Find fuel nearby",
  description: "Community fuel updates for drivers in Malawi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
