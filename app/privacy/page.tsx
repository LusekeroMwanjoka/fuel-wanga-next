import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Fuel Wanga",
  description: "How Fuel Wanga collects, uses, and protects your information.",
};

const LAST_UPDATED = "November 2026";
const CONTACT_EMAIL = "hisofttechnologies@gmail.com";
const SITE_URL = "https://fuelwanga.mw"; // update when domain is live

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacy Policy" eyebrow="LEGAL">
      <p className="info-lead">
        This Privacy Policy explains what information Fuel Wanga collects, how it is used,
        and your rights regarding that information. Last updated: {LAST_UPDATED}.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Fuel Wanga is a community fuel-status finder for drivers in Malawi, developed and
        operated by <strong>HiSoft Technologies</strong>. Our website is available at{" "}
        <a href={SITE_URL}>{SITE_URL}</a>. You can contact us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. Information we collect</h2>
      <h3>a) Anonymous visitor identifier</h3>
      <p>
        When you submit a fuel report, Fuel Wanga creates a random unique identifier (UUID)
        and stores it in your browser&apos;s <code>localStorage</code>. This identifier is not
        linked to your name, email address, phone number, or any other personal information.
        It is used only to enforce a per-device report rate limit (one update per station
        every 15 minutes) and to count how many unique visitors confirmed a report.
      </p>
      <h3>b) Language preference</h3>
      <p>
        Your language choice (English or Chichewa) is saved in <code>localStorage</code> so
        the site remembers it across visits. No server record is created.
      </p>
      <h3>c) Usage data</h3>
      <p>
        Our hosting provider and Cloudflare may collect standard server log data including
        your IP address, browser type, referring page, and pages visited. This data is used
        for security, performance monitoring, and aggregate analytics. It is not sold or
        shared with third parties for marketing purposes.
      </p>
      <h3>d) Station admin accounts</h3>
      <p>
        If you hold a station-admin account, Fuel Wanga stores your email address and
        account details. Passwords are managed by Supabase Auth and are not stored by Fuel
        Wanga in its application tables. This information is used to authenticate you to
        your station dashboard.
      </p>

      <h2>3. Cookies and similar technologies</h2>
      <p>
        Fuel Wanga uses the following cookies and browser storage:
      </p>
      <ul>
        <li>
          <strong>fw_admin_session</strong> — an HttpOnly, SameSite=Lax session cookie set
          when a station admin signs in. It expires after 8 hours. It is never accessible to
          JavaScript on the page.
        </li>
        <li>
          <strong>fw_super_session</strong> — the same type of session cookie for super-admin
          accounts, expiring after 4 hours.
        </li>
        <li>
          <strong>localStorage: fuel-wanga-visitor</strong> — anonymous UUID stored in your
          browser, described in section 2(a) above.
        </li>
        <li>
          <strong>localStorage: fw-lang</strong> — your language preference (en or ny).
        </li>
      </ul>
      <p>
        We do not use tracking cookies for advertising profiling. However, if Google AdSense
        is active on this site (see section 4), Google will set its own cookies as described
        in Google&apos;s Privacy Policy.
      </p>

      <h2>4. Advertising — Google AdSense</h2>
      <p>
        Fuel Wanga uses Google AdSense to display advertisements. Google AdSense may use
        cookies and web beacons to serve ads based on your prior visits to this website and
        other sites on the internet. Google&apos;s use of advertising cookies enables it and its
        partners to serve ads based on your visits to Fuel Wanga and other sites.
      </p>
      <p>
        You can opt out of personalised advertising by visiting{" "}
        <a
          href="https://www.google.com/settings/ads"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google&apos;s Ads Settings
        </a>
        . Alternatively, you can opt out of a third-party vendor&apos;s use of cookies for
        personalised advertising by visiting{" "}
        <a
          href="https://www.aboutads.info/choices/"
          target="_blank"
          rel="noopener noreferrer"
        >
          aboutads.info
        </a>
        .
      </p>
      <p>
        Google&apos;s use of your data is governed by the{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Privacy Policy
        </a>
        .
      </p>

      <h2>5. How we use your information</h2>
      <ul>
        <li>To operate the fuel-report rate-limiting system</li>
        <li>To authenticate station-admin and super-admin accounts</li>
        <li>To remember your language preference</li>
        <li>To monitor and improve site security and performance</li>
        <li>To display relevant advertising via Google AdSense</li>
      </ul>
      <p>We do not sell, rent, or trade your information to any third party.</p>

      <h2>6. Data storage and security</h2>
      <p>
        Station and report data is stored in a Supabase PostgreSQL database with row-level
        security enabled. Only the server-side API can read or write data — no database
        credentials are exposed to the browser. Admin passwords are managed by Supabase Auth.
      </p>

      <h2>7. Data retention</h2>
      <p>
        Fuel reports are retained for historical reference but are only shown as current for
        three hours. Anonymous visitor identifiers persist in your browser&apos;s localStorage
        until you clear it. Admin accounts are retained until deleted by a super admin.
      </p>

      <h2>8. Your rights</h2>
      <p>
        You may request deletion of any personal data associated with your account by
        contacting us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Because
        public-facing fuel reports are stored anonymously (linked only to a UUID you can
        delete by clearing your browser storage), we cannot identify or delete individual
        community reports on request.
      </p>

      <h2>9. Children&apos;s privacy</h2>
      <p>
        Fuel Wanga is not directed at children under 13. We do not knowingly collect personal
        information from children.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the
        top of this page will reflect any changes. Continued use of the site after changes
        are posted constitutes your acceptance of the revised policy.
      </p>

      <h2>11. Contact</h2>
      <p>
        For any privacy-related questions, contact HiSoft Technologies at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or call{" "}
        <a href="tel:+265882861462">0882 861 462</a>.
      </p>

      <p className="info-callout">
        This policy applies to the Fuel Wanga website only. It does not apply to any
        third-party websites linked from this site, including Google&apos;s advertising network.
      </p>
    </InfoPage>
  );
}
