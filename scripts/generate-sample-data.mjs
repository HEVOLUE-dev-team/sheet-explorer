// Génère 4 fichiers CSV 100 % fictifs dans /sample-data.
//
// - Téléphones : plages réservées à la fiction par l'ARCEP (06 39 98 xx xx, 01 99 00 xx xx)
//   et numéros nord-américains fictifs 555-01xx.
// - E-mails : uniquement @example.com.
// - 75 personnes « communes » (15 % de 500) apparaissent dans les 4 fichiers, avec des
//   formats de téléphone / e-mail volontairement différents pour tester la normalisation.
//
// Usage : node scripts/generate-sample-data.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROWS = 500;
const SHARED = 75;
const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "sample-data");

// Générateur pseudo-aléatoire à graine fixe (mulberry32) : les fichiers sont reproductibles.
let seed = 20261031;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (list) => list[Math.floor(rand() * list.length)];
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
const chance = (p) => rand() < p;

const FIRST = [
  "Camille", "Léa", "Manon", "Chloé", "Inès", "Jade", "Zoé", "Emma", "Louise", "Alice",
  "Lina", "Rose", "Anaïs", "Élodie", "Margaux", "Noémie", "Clémence", "Océane", "Maëlle", "Salomé",
  "Hugo", "Lucas", "Nathan", "Louis", "Adam", "Yanis", "Théo", "Arthur", "Jules", "Noé",
  "Gabriel", "Raphaël", "Mathis", "Ethan", "Léo", "Sacha", "Bastien", "Jérôme", "Grégoire", "Loïc",
];
const LAST = [
  "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau",
  "Simon", "Laurent", "Lefèvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent", "Fournier",
  "Morel", "Girard", "André", "Lefebvre", "Mercier", "Dupont", "Lambert", "Bonnet", "François", "Martinez",
  "Legrand", "Garnier", "Faure", "Rousseau", "Blanc", "Guérin", "Muller", "Henry", "Roussel", "Nicolas",
  "Perrin", "Morin", "Mathieu", "Clément", "Gauthier", "Dumont", "Lopez", "Fontaine", "Chevalier", "Robin",
  "Masson", "Sanchez", "Gérard", "Nguyen", "Boyer", "Denis", "Lemaire", "Duval", "Joly", "Gautier",
];
const FR_CITIES = [
  ["Paris", "75011"], ["Paris", "75018"], ["Lyon", "69003"], ["Marseille", "13001"],
  ["Bordeaux", "33000"], ["Toulouse", "31000"], ["Nantes", "44000"], ["Lille", "59000"],
  ["Strasbourg", "67000"], ["Rennes", "35000"], ["Montpellier", "34000"], ["Grenoble", "38000"],
];
const STREETS = [
  "rue de la République", "avenue Victor Hugo", "boulevard Voltaire", "rue des Lilas",
  "rue du Moulin", "place de la Mairie", "chemin des Écoliers", "allée des Tilleuls",
  "rue Pasteur", "avenue Jean Jaurès", "impasse des Acacias", "quai des Brumes",
];
const CA_CITIES = [
  ["Montréal", "QC", "514"], ["Québec", "QC", "418"], ["Laval", "QC", "450"], ["Gatineau", "QC", "819"],
  ["Toronto", "ON", "416"], ["Ottawa", "ON", "613"], ["Vancouver", "BC", "604"], ["Calgary", "AB", "403"],
  ["Moncton", "NB", "506"], ["Winnipeg", "MB", "204"],
];
const CA_STREETS = ["rue Sainte-Catherine", "boulevard Saint-Laurent", "Maple Street", "King Street", "avenue du Parc", "Main Street", "Oak Avenue", "rue Principale"];

// --- Identités fictives --------------------------------------------------------------

const usedPhones = new Set();
/** Numéro français fictif : 10 chiffres sans séparateur, ex. "0639981234". */
function fictionalFrPhone() {
  for (;;) {
    const base = chance(0.8) ? "063998" : "019900";
    const n = base + String(int(0, 9999)).padStart(4, "0");
    if (!usedPhones.has(n)) {
      usedPhones.add(n);
      return n;
    }
  }
}
/** Numéro nord-américain fictif (555-0100 à 555-0199), ex. "+1 514 555 0142". */
function fictionalCaPhone(area) {
  for (;;) {
    const n = `+1 ${area} 555 01${String(int(0, 99)).padStart(2, "0")}`;
    if (!usedPhones.has(n)) {
      usedPhones.add(n);
      return n;
    }
  }
}

const usedEmails = new Set();
function slug(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
}
function emailFor(first, last) {
  let email = `${slug(first)}.${slug(last)}@example.com`;
  let i = 2;
  while (usedEmails.has(email)) email = `${slug(first)}.${slug(last)}${i++}@example.com`;
  usedEmails.add(email);
  return email;
}
function person(kind = "fr") {
  const first = pick(FIRST);
  const last = pick(LAST);
  const city = kind === "ca" ? pick(CA_CITIES) : null;
  return {
    first,
    last,
    email: emailFor(first, last),
    phone: kind === "ca" ? fictionalCaPhone(city[2]) : fictionalFrPhone(),
    city,
  };
}

// --- Formats de téléphone (même numéro, écritures différentes) ------------------------

const digitsOf = (p) => p.replace(/\D/g, "");
/** "0639981234" → "06 39 98 12 34" */
const frSpaced = (p) => (p.startsWith("+") ? p : p.replace(/(\d{2})(?=\d)/g, "$1 "));
/** "0639981234" → "+33639981234" */
const frIntl = (p) => (p.startsWith("+") ? digitsOf(p) : `+33${p.slice(1)}`);
/** "0639981234" → "06.39.98.12.34" */
const frDotted = (p) => (p.startsWith("+") ? p.replace(/ /g, "-") : p.replace(/(\d{2})(?=\d)/g, "$1."));
/** "0639981234" → "+33 6 39 98 12 34" */
const frIntlSpaced = (p) =>
  p.startsWith("+") ? p : `+33 ${p[1]} ${p.slice(2).replace(/(\d{2})(?=\d)/g, "$1 ")}`;

// --- Valeurs métier ----------------------------------------------------------------

const pad = (n) => String(n).padStart(2, "0");
function randomDate(from, to) {
  const t = from.getTime() + rand() * (to.getTime() - from.getTime());
  return new Date(t);
}
const frDate = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
/** Montant au format français : "1 150,00" */
function frAmount(n) {
  const [int, dec] = n.toFixed(2).split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${dec}`;
}
function frPostalAddress() {
  return `${int(1, 180)} ${pick(STREETS)}`;
}
function caPostcode() {
  const L = "ABCEGHJKLMNPRSTVXY";
  const l = () => L[int(0, L.length - 1)];
  return `${l()}${int(0, 9)}${l()} ${int(0, 9)}${l()}${int(0, 9)}`;
}

// --- Écriture CSV --------------------------------------------------------------------

function csvCell(v) {
  const s = v == null ? "" : String(v);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function writeCsv(name, headers, rows) {
  const lines = [headers, ...rows].map((r) => r.map(csvCell).join(","));
  writeFileSync(join(OUT_DIR, name), lines.join("\n") + "\n", "utf8");
  console.log(`${name.padEnd(14)} ${rows.length} lignes`);
}
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Génération ----------------------------------------------------------------------

mkdirSync(OUT_DIR, { recursive: true });

// Les personnes présentes dans les 4 fichiers.
const shared = Array.from({ length: SHARED }, () => person("fr"));
const uniques = (kind = "fr") => Array.from({ length: ROWS - SHARED }, () => person(kind));

// 1. recovery.csv : téléphone « 06 39 98 12 34 », e-mail en minuscules.
{
  const people = shuffle([...shared, ...uniques()]);
  const rows = people.map((p) => [
    pick(["France", "France", "France", "Belgique", "Suisse", "Canada"]),
    pick(["Web", "Mobile", "Agence", "Partenaire"]),
    frDate(randomDate(new Date(2025, 0, 1), new Date(2026, 9, 30))),
    p.first,
    p.last,
    frSpaced(p.phone),
    pick(["Appel", "SMS", "E-mail", "Courrier"]),
    chance(0.03) ? "" : p.email,
    pick(["Relance", "Échéancier", "Litige", "Premier contact", "Mise en demeure"]),
    frAmount(Math.round(rand() * rand() * 500000) / 100 + 15),
  ]);
  writeCsv("recovery.csv", ["Pays", "Plateforme", "Date", "Prénom", "Nom", "Téléphone", "Canal", "Email", "Type", "Montant"], rows);
}

// 2. clients.csv : colonne « phone » au format international, e-mails parfois en MAJUSCULES.
{
  const people = shuffle([...shared, ...uniques()]);
  const rows = people.map((p, i) => {
    const [city, cp] = pick(FR_CITIES);
    return [
      frIntl(p.phone),
      p.last,
      p.first,
      frPostalAddress(),
      city,
      cp,
      i % 7 === 0 ? p.email.toUpperCase() : p.email,
      pick(["Propriétaire", "Locataire", "Hébergé", "Logement social", ""]),
    ];
  });
  writeCsv("clients.csv", ["phone", "Nom", "Prenom", "Adresse", "Ville", "Code Postal", "Email", "Statut logement"], rows);
}

// 3. residents.csv : en-têtes anglais, résidents canadiens + personnes communes au format « +33 6 … ».
{
  const people = shuffle([...shared, ...uniques("ca")]);
  const rows = people.map((p) => {
    const [city, province] = p.city ?? pick(CA_CITIES);
    return [
      p.first,
      p.last,
      `${int(10, 9800)} ${pick(CA_STREETS)}`,
      city,
      province,
      caPostcode(),
      p.city ? p.phone : frIntlSpaced(p.phone),
      int(18, 92),
      pick(["Français", "Français", "English", "English", "Español", "العربية"]),
      int(1, 7),
    ];
  });
  writeCsv("residents.csv", ["First Name", "Last Name", "Street Address", "City", "Province", "Postcode", "Phone", "Age", "Language", "Household Size"], rows);
}

// 4. suivi.csv : nom complet, téléphone « 06.39.98.12.34 », e-mail avec espaces parasites.
{
  const people = shuffle([...shared, ...uniques()]);
  const comments = [
    "Rappeler en fin de journée", "Dossier transmis au service juridique", "A promis un virement",
    "Ne répond pas", "Demande un échéancier sur 3 mois", "Adresse à vérifier", "", "", "",
  ];
  const rows = people.map((p, i) => {
    const date = randomDate(new Date(2026, 0, 1), new Date(2026, 9, 30));
    const statut = pick(["À rappeler", "En cours", "Clôturé", "Injoignable", "Promesse de paiement"]);
    const rappel = statut === "Clôturé" ? "" : frDate(new Date(date.getTime() + int(1, 30) * 86400000));
    return [
      `${p.first} ${p.last}`,
      i % 5 === 0 ? `  ${p.email} ` : p.email,
      frDotted(p.phone),
      pick(["France", "France", "Belgique", "Suisse", "Canada"]),
      isoDate(date),
      statut,
      pick(comments),
      rappel,
    ];
  });
  writeCsv("suivi.csv", ["Name", "Email", "Phone", "Country", "Date", "Statut", "Commentaire", "Date de rappel"], rows);
}

console.log(`\n${SHARED} personnes communes aux 4 fichiers (${Math.round((SHARED / ROWS) * 100)} %).`);
