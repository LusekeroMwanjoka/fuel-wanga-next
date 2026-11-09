import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "How Fuel Wanga works",
  description: "How to find stations, read fuel availability reports, and use directions in Fuel Wanga.",
};

export default function HowItWorksPage() {
  return <InfoPage title="How to use the station finder" eyebrow="HOW IT WORKS">
    <p className="info-lead">Fuel Wanga separates the station directory from short-lived reports about what drivers recently saw.</p>
    <h2>Find a station</h2>
    <p>Select a district and search for a station name or nearby area. The list starts with six results; choose “View more stations” to continue through the list. Petrol and Diesel tabs show reports for the selected fuel. Stations remain listed even when no fuel report is available.</p>
    <h2>Understand the status</h2>
    <p>“No fuel update” means there is no recent report for that fuel. It does not mean the station has no fuel. “Fuel available,” “Running low,” and “No fuel” describe what visitors reported, not a live stock check performed by Fuel Wanga.</p>
    <p>Reports stop appearing as current after three hours. If recent visitors report different conditions, Fuel Wanga marks that station as having conflicting reports.</p>
    <h2>Share an observation</h2>
    <p>Use “Update fuel status” only after checking the station in person. Choose the fuel, availability, and queue options that match what you saw. The report form does not ask for your name or phone number. A browser identifier is used to limit repeat reports from the same browser at a station.</p>
    <h2>Open directions</h2>
    <p>Choose “Open directions” on a station card. Fuel Wanga uses a matched station pin when one is available; otherwise, the map searches for the station name and area. Review the destination shown by the map before travelling.</p>
    <p className="info-callout">Fuel Wanga does not independently confirm live stock levels. Reports are community observations and may be incomplete, mistaken, or out of date.</p>
  </InfoPage>;
}
