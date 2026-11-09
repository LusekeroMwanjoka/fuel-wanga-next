/**
 * Fuel Wanga — English / Chichewa translations.
 *
 * ⚠ TRANSLATION NOTE: Chichewa strings have been composed with care but should
 * be reviewed by a native speaker before production use, especially:
 *   - Technical fuel-status labels ("Low" → "Yotsika")
 *   - Admin UI strings (marked [NEEDS REVIEW] below)
 *   - Error and validation messages
 */

export type Lang = "en" | "ny";

export const t = {
  // ── Site chrome ──────────────────────────────────────────────────────────
  siteTitle: {
    en: "Fuel Wanga",
    ny: "Fuel Wanga",
  },
  tagline: {
    en: "Community fuel updates",
    ny: "Malipoti a mafuta a anthu",
  },
  langToggle: {
    en: "Chichewa",
    ny: "English",
  },

  // ── Public home ──────────────────────────────────────────────────────────
  heroEyebrow: {
    en: "Fuel information for Malawi",
    ny: "Uthenga wa mafuta wa a Malawi",
  },
  heroHeading: {
    en: "Find fuel near you.",
    ny: "Pezani mafuta pafupi ndi inu.",
  },
  heroHeadingSub: {
    en: "Help others find it too.",
    ny: "Thandizani ena kupeza nawo.",
  },
  heroBody: {
    en: "See what drivers have reported. Share what you see at the station.",
    ny: "Onani zomwe anzannu anenapo. Uzani ena zomwe mwaona ku siteshoni.",
  },
  chooseDistrict: {
    en: "Choose your district",
    ny: "Sankhani dera lanu",
  },
  districtsCount: {
    en: (n: number) => `${n} districts covered`,
    ny: (n: number) => `Madera ${n} apangidwa cover`,
  },
  searchPlaceholder: {
    en: "Search station or area",
    ny: "Sakani siteshoni kapena malo",
  },
  fillingStations: {
    en: "Filling stations",
    ny: "Masiteshoni a mafuta",
  },
  refresh: {
    en: "Refresh",
    ny: "pangani refresh",
  },
  allFuel: {
    en: "All fuel",
    ny: "Mafuta onse",
  },
  petrol: {
    en: "Petrol",
    ny: "Petulo",
  },
  diesel: {
    en: "Diesel",
    ny: "Dizelo",
  },
  showAvailableOnly: {
    en: "Show fuel available only",
    ny: "sonyezani fuel opezeka yekha basi",
  },
  truthNote: {
    en: "A missing or old report does not mean the station is out of fuel.",
    ny: "Malipoti kusowa or akale, sikutanthauza kuti siteshoni palibe mafuta.", // [NEEDS REVIEW]
  },
  updateFuelStatus: {
    en: "Update fuel status",
    ny: "sinthani sitetasi ya mafuta",
  },
  openDirections: {
    en: "Open directions",
    ny: "Tsegulani njira",
  },
  viewMore: {
    en: "View more stations",
    ny: "Onani masiteshoni ena",
  },
  showingCount: {
    en: (shown: number, total: number, unit: string) =>
      `Showing ${shown} of ${total} ${unit}${total === 1 ? "" : "s"} · Updates expire after 3 hours`,
    ny: (shown: number, total: number, unit: string) =>
      `Kusonyeza ${shown} mwa ${total} ${unit} · Malipoti amatheratu patapita maola 3`, // [NEEDS REVIEW]
  },
  station: {
    en: "station",
    ny: "siteshoni",
  },
  loadingStations: {
    en: "Loading stations…",
    ny: "Kusanthula masiteshoni…",
  },
  tryAgain: {
    en: "Try again",
    ny: "Yesaninso",
  },
  connectionError: {
    en: "We could not connect to the shared station list. Check your connection and try again.",
    ny: "Sitinathe kulumikizana ndi mndandanda wa masiteshoni. Onani netweki yanu ndikuyesaso.", // [NEEDS REVIEW]
  },
  noMatchingStations: {
    en: "No matching stations",
    ny: "Palibe masiteshoni oyenerana",
  },
  tryChangingFilters: {
    en: "Try changing your search or filters.",
    ny: "Yesani kusintha kusaka kapena chosankha.", // [NEEDS REVIEW]
  },
  noStationsDistrict: {
    en: (district: string) => `No stations listed in ${district} yet`,
    ny: (district: string) => `Palibe masiteshoni olembedwa ku ${district} kuchokera`, // [NEEDS REVIEW]
  },
  buildingList: {
    en: "We are still building the station list for this district.",
    ny: "Tikutha kumanga mndandanda wa masiteshoni ku dera ili.", // [NEEDS REVIEW]
  },

  // ── Status labels ─────────────────────────────────────────────────────────
  statusAvailable: {
    en: "Fuel available",
    ny: "Mafuta alipo",
  },
  statusLow: {
    en: "Running low",
    ny: "Otsika", // [NEEDS REVIEW]
  },
  statusNoFuel: {
    en: "No fuel",
    ny: "Palibe mafuta",
  },
  statusUnknown: {
    en: "No fuel update",
    ny: "Palibe uthenga wa mafuta",
  },
  reportsDisagree: {
    en: "Reports disagree",
    ny: "Malipoti siogwirizana", // [NEEDS REVIEW]
  },
  checkBeforeTravelling: {
    en: "Check before travelling",
    ny: "Onani musanayende", // [NEEDS REVIEW]
  },
  queueLabel: {
    en: (q: string) => `Queue: ${q}`,
    ny: (q: string) => `Mzere: ${q}`,
  },
  confirmations: {
    en: (n: number) => `${n} recent report${n === 1 ? "" : "s"}`,
    ny: (n: number) => `Malipoti ${n} amakono`,
  },
  noRecentUpdate: {
    en: "No recent update",
    ny: "Palibe uthenga watsopano",
  },
  justNow: {
    en: "Just now",
    ny: "Panopa",
  },
  minsAgo: {
    en: (m: number) => `${m} min ago`,
    ny: (m: number) => `Maola ${m} apita`, // [NEEDS REVIEW — minutes vs hours]
  },
  hoursAgo: {
    en: (h: number) => `${h} hr ago`,
    ny: (h: number) => `Maola ${h} apita`,
  },

  // ── Admin update source labels ────────────────────────────────────────────
  stationUpdated: {
    en: (time: string) => `Station updated · ${time}`,
    ny: (time: string) => `Siteshoni yapangidwa update · ${time}`, // [NEEDS REVIEW]
  },

  // ── Queue values ──────────────────────────────────────────────────────────
  queueValues: {
    en: {
      "No queue update": "No queue update",
      "No queue": "No queue",
      "Short queue": "Short queue",
      "Medium queue": "Medium queue",
      "Long queue": "Long queue",
    },
    ny: {
      "No queue update": "Palibe uthenga wa mzere",
      "No queue": "Palibe mzere",
      "Short queue": "Mzere wafupi",
      "Medium queue": "Mzere wapakati",
      "Long queue": "Mzere wautali",
    },
  },

  // ── Report modal ──────────────────────────────────────────────────────────
  reportModalEyebrow: {
    en: "Community fuel update",
    ny: "Uthenga wa mafuta wa anthu",
  },
  reportModalHeading: {
    en: "What did you see?",
    ny: "Munaonaoni chiyani?",
  },
  fuelSituation: {
    en: "Fuel situation",
    ny: "Mkhalidwe wa mafuta",
  },
  fuelType: {
    en: "Fuel type",
    ny: "Mtundu wa mafuta",
  },
  queue: {
    en: "Queue",
    ny: "Mzere",
  },
  honestyCheck: {
    en: "I checked this station in person.",
    ny: "Ndaona pandekha ku siteshoni imeneyi.",
  },
  sharing: {
    en: "Sharing…",
    ny: "Kugawana…",
  },
  shareUpdate: {
    en: "Share update",
    ny: "Gawanani uthenga",
  },
  reportSmallNote: {
    en: "No name, phone number or account needed. One update per station every 15 minutes on this device.",
    ny: "Mulibe dzina, nambala ya foni kapena akaunti yofunikira. Uthenga umodzi pa siteshoni iliyonse nthawi iliyonse maminiti 15 pa chida ichi.", // [NEEDS REVIEW]
  },
  thankYouReport: {
    en: (n: number) =>
      `Thank you. Your update is recorded (${n} recent matching report${n === 1 ? "" : "s"}).`,
    ny: (n: number) =>
      `Zikomo. Uthenga wanu walembedwa (malipoti ${n} oyenerana amakono).`, // [NEEDS REVIEW]
  },

  // ── How it works ──────────────────────────────────────────────────────────
  howEyebrow: {
    en: "Simple for everyone",
    ny: "Yophweka kwa onse",
  },
  howHeading: {
    en: "How Fuel Wanga works",
    ny: "M'mene Fuel Wanga amagwirira ntchito",
  },
  howStep1Title: {
    en: "Choose your district",
    ny: "Sankhani dera lanu",
  },
  howStep1Body: {
    en: "See stations in your area. No map or account needed.",
    ny: "Onani masiteshoni m'dera lanu. palibe mapu kapena akaunti ikufunikira.",
  },
  howStep2Title: {
    en: "Check the update time",
    ny: "Onani nthawi ya uthenga",
  },
  howStep2Body: {
    en: "Fuel reports are recent for up to 3 hours. Old reports are hidden.",
    ny: "Malipoti a mafuta amakono ndi mpaka maola 3. Malipoti akale achotsedwa.",
  },
  howStep3Title: {
    en: "Share what you saw",
    ny: "Uzani ena chimene mwaona",
  },
  howStep3Body: {
    en: "Report fuel and queue after visiting a station in person.",
    ny: "nenani za mafuta ndi mzere mutaona panokha ku siteshoni.",
  },

  // ── Footer ────────────────────────────────────────────────────────────────
  footerTagline: {
    en: "Built for drivers in Malawi.",
    ny: "Yapangidwa kwa oyendesa a mu Malawi.",
  },
  footerDisclaimer: {
    en: "Fuel reports are community updates, not guarantees.",
    ny: "Malipoti a mafuta ndi uthenga wa anthu, osati chitsimikizo.", // [NEEDS REVIEW]
  },
  stationAdminSignIn: {
    en: "Station sign in",
    ny: "Lowani siteshoni",
  },
  superAdminSignIn: {
    en: "Super admin sign in",
    ny: "Lowani super admin",
  },

  // ── Station admin sign in ─────────────────────────────────────────────────
  adminSignInHeading: {
    en: "Station admin sign in",
    ny: "Lowani ngati oyang'anira siteshoni", // [NEEDS REVIEW]
  },
  emailLabel: {
    en: "Email address",
    ny: "Imelo",
  },
  passwordLabel: {
    en: "Password",
    ny: "Achinsinsi",
  },
  signIn: {
    en: "Sign in",
    ny: "Lowani",
  },
  signingIn: {
    en: "Signing in…",
    ny: "Kulowa…",
  },
  signOut: {
    en: "Sign out",
    ny: "Tululani",
  },
  invalidCredentials: {
    en: "Incorrect email or password.",
    ny: "Imelo kapena achinsinsi sioyenera.",
  },
  accountDisabled: {
    en: "This account has been disabled. Contact the super admin.",
    ny: "Akaunti iyi yachotsedwa. Lumikizanani ndi super admin.", // [NEEDS REVIEW]
  },

  // ── Station admin dashboard ────────────────────────────────────────────────
  adminDashHeading: {
    en: (name: string) => `${name}`,
    ny: (name: string) => `${name}`,
  },
  adminDashSubheading: {
    en: "Update fuel availability for your station",
    ny: "Zakomunera za mafuta ku siteshoni yanu", // [NEEDS REVIEW]
  },
  currentStatus: {
    en: "Current status",
    ny: "Mkhalidwe wa tsiku lino",
  },
  adminUpdateHeading: {
    en: "Post an update",
    ny: "Tumizani uthenga", // [NEEDS REVIEW]
  },
  adminUpdateNote: {
    en: "Your update takes priority over community reports and expires after 3 hours.",
    ny: "Uthenga wanu udzachitika patsogolo pa malipoti a anthu ndikuthera patapita maola 3.", // [NEEDS REVIEW]
  },
  saving: {
    en: "Saving…",
    ny: "Kusungiratu…",
  },
  saveUpdate: {
    en: "Save update",
    ny: "Sunga uthenga",
  },
  updateSaved: {
    en: "Update saved.",
    ny: "Uthenga wasungidwa.",
  },
  activeUntil: {
    en: (time: string) => `Active until ${time}`,
    ny: (time: string) => `Yogwira ntchito mpaka ${time}`, // [NEEDS REVIEW]
  },
  noActiveUpdate: {
    en: "No active admin update",
    ny: "Palibe uthenga wa oyang'anira tsiku lino", // [NEEDS REVIEW]
  },
  communityReportsBelow: {
    en: "Community reports are shown to the public when no admin update is active.",
    ny: "Malipoti a anthu asonkhezedwa kwa anthu pamene palibe uthenga wa oyang'anira.", // [NEEDS REVIEW]
  },

  // ── Super admin dashboard ──────────────────────────────────────────────────
  superAdminDashHeading: {
    en: "Super admin",
    ny: "Super admin",
  },
  stations: {
    en: "Stations",
    ny: "Masiteshoni",
  },
  stationAdmins: {
    en: "Station admins",
    ny: "Oyang'anira masiteshoni",
  },
  createAdmin: {
    en: "Create admin account",
    ny: "Pangani akaunti ya woyang'anira", // [NEEDS REVIEW]
  },
  editAdmin: {
    en: "Edit",
    ny: "Sinthani",
  },
  disableAdmin: {
    en: "Disable",
    ny: "Chotsani",
  },
  enableAdmin: {
    en: "Enable",
    ny: "Yambitsaninso",
  },
  resetPassword: {
    en: "Reset password",
    ny: "Sinthani achinsinsi",
  },
  adminCreated: {
    en: "Admin account created.",
    ny: "Akaunti ya woyang'anira yapangidwa.", // [NEEDS REVIEW]
  },
  adminUpdated: {
    en: "Admin account updated.",
    ny: "Akaunti ya woyang'anira yassinthidwa.", // [NEEDS REVIEW]
  },

  // ── Errors ────────────────────────────────────────────────────────────────
  genericError: {
    en: "Something went wrong. Please try again.",
    ny: "Chinachake chinalephera. Yesaninso.", // [NEEDS REVIEW]
  },
} as const;

/** Resolve a translation. Handles string and function overloads. */
export function tx<
  K extends keyof typeof t,
  V extends (typeof t)[K][Lang],
>(key: K, lang: Lang, ...args: V extends (...a: infer A) => unknown ? A : []): string {
  const entry = t[key][lang] as unknown;
  if (typeof entry === "function") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (entry as (...a: any[]) => string)(...args);
  }
  return entry as string;
}
