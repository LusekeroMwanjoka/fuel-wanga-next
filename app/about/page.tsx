import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "About Fuel Wanga",
  description: "What Fuel Wanga does and how its station directory and community fuel reports work in Malawi.",
};

export default function AboutPage() {
  return <InfoPage title="Fuel information for Malawi drivers" eyebrow="ABOUT FUEL WANGA">
    <p className="info-lead">Fuel Wanga brings station listings and recent driver observations together in one district-based finder.</p>
    <h2>What you can do here</h2>
    <p>Choose from Malawi’s 28 districts, search by station or area, and check recent reports about petrol, diesel, and queues. When you have checked a station in person, you can share what you observed.</p>
    <h2>Two kinds of information</h2>
    <p>The directory identifies station locations from published registers, operator directories, and other mapped sources. Fuel availability and queue information comes from visitor reports. A station listing does not mean fuel is currently available there.</p>
    <p>Reports are time-sensitive: Fuel Wanga shows reports as current for up to three hours. If recent reports disagree, the page flags the disagreement instead of treating availability as certain.</p>
    <h2>Designed for practical trips</h2>
    <p>Station cards include directions when a matched map pin is available. Otherwise, directions open a map search using the station name and area. Check that the destination looks right before starting a long journey.</p>
    <p className="info-callout">Fuel Wanga is an information tool. Station records and community reports can be incomplete or out of date, so use your judgement when planning a trip.</p>
  </InfoPage>;
}
