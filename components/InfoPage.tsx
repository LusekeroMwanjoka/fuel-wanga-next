import Link from "next/link";
import { BrandIcon } from "@/components/PumpIcon";

export function InfoPage({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <main className="info-shell">
      <header className="info-header">
        <Link className="brand" href="/">
          <BrandIcon size={32} />
          <span>Fuel Wanga</span>
        </Link>
        <Link className="back-link" href="/">
          ← Back to station finder
        </Link>
      </header>

      <article className="info-content">
        <p className="kicker">{eyebrow}</p>
        <h1>{title}</h1>
        {children}
      </article>

      <footer className="info-footer">
        <Link href="/about">About</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <span style={{ marginLeft: "auto" }}>Fuel Wanga · Malawi</span>
      </footer>
    </main>
  );
}
