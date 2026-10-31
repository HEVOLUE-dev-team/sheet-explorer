// Vérifie la jointure et la normalisation sur les CSV de /sample-data.
// Usage : npm run test:join

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { parseCsv } from "../lib/csv";
import { buildDataset, findColumnByLabel } from "../lib/dataset";
import { filterRows } from "../lib/filters";
import { joinDatasets, MATCH_FOUND, MATCH_MISSING, suggestKeyColumn } from "../lib/join";
import { phoneKey, textKey } from "../lib/normalize";
import type { Dataset, JoinType, KeyMode } from "../lib/types";

const load = (name: string): Dataset =>
  buildDataset(parseCsv(readFileSync(join(process.cwd(), "sample-data", `${name}.csv`), "utf8")));

const data = {
  recovery: load("recovery"),
  clients: load("clients"),
  residents: load("residents"),
  suivi: load("suivi"),
};

let failures = 0;
function check(label: string, fn: () => void) {
  try {
    fn();
    console.log(`  ok   ${label}`);
  } catch (error) {
    failures++;
    console.log(`  ÉCHEC ${label}\n       ${(error as Error).message}`);
  }
}

console.log("\nNormalisation");
check("téléphones : 4 écritures, une seule clé", () => {
  const forms = ["06 39 98 12 34", "+33639981234", "06.39.98.12.34", "+33 6 39 98 12 34"];
  assert.deepEqual(new Set(forms.map(phoneKey)), new Set(["639981234"]));
});
check("texte : casse, espaces, points et tirets", () => {
  assert.equal(textKey("  Jean-Pierre.DUPONT "), textKey("jeanpierredupont"));
});
check("e-mail en majuscules ou avec espaces", () => {
  assert.equal(textKey("  ROSE.DUPONT@EXAMPLE.COM "), textKey("rose.dupont@example.com"));
});

console.log("\nDétection des types");
check("recovery : Date = date, Montant = nombre, Téléphone = texte", () => {
  const type = (l: string) => findColumnByLabel(data.recovery, l)?.type;
  assert.equal(type("Date"), "date");
  assert.equal(type("Montant"), "number");
  assert.equal(type("Téléphone"), "text");
});
check("residents : Age et Household Size = nombre", () => {
  assert.equal(findColumnByLabel(data.residents, "Age")?.type, "number");
  assert.equal(findColumnByLabel(data.residents, "Household Size")?.type, "number");
});
check("suivi : Date (ISO) et Date de rappel (JJ/MM/AAAA) = date", () => {
  assert.equal(findColumnByLabel(data.suivi, "Date")?.type, "date");
  assert.equal(findColumnByLabel(data.suivi, "Date de rappel")?.type, "date");
});

console.log("\nRecherche");
check("« elodie » trouve « Élodie », « 0639… » trouve « 06 39 … »", () => {
  const withAccent = data.recovery.rows.findIndex((r) => r.some((c) => c.includes("Élodie")));
  if (withAccent >= 0) assert.ok(filterRows(data.recovery, "elodie", []).includes(withAccent));
  const phoneCol = findColumnByLabel(data.recovery, "Téléphone")!;
  const phone = data.recovery.rows[0][phoneCol.index];
  assert.ok(filterRows(data.recovery, phone.replace(/\D/g, ""), []).includes(0));
  assert.ok(filterRows(data.recovery, `+33${phone.replace(/\D/g, "").slice(1)}`, []).includes(0));
});

console.log("\nJointures (75 personnes communes sur 500, soit 15 %)");
function run(a: Dataset, aKey: string, b: Dataset, bKey: string, type: JoinType, mode: KeyMode = "auto") {
  const keyA = findColumnByLabel(a, aKey)!;
  const keyB = findColumnByLabel(b, bKey)!;
  return joinDatasets({ a, b, keyA, keyB, type, mode });
}
const cases: [string, Dataset, string, Dataset, string][] = [
  ["recovery.Téléphone ⇄ clients.phone", data.recovery, "Téléphone", data.clients, "phone"],
  ["recovery.Téléphone ⇄ residents.Phone", data.recovery, "Téléphone", data.residents, "Phone"],
  ["recovery.Téléphone ⇄ suivi.Phone", data.recovery, "Téléphone", data.suivi, "Phone"],
  ["clients.Email ⇄ suivi.Email", data.clients, "Email", data.suivi, "Email"],
];
for (const [label, a, ka, b, kb] of cases) {
  check(`${label} : intersection = 75 lignes`, () => {
    const { stats } = run(a, ka, b, kb, "inner");
    assert.equal(stats.resultRows, 75, `obtenu ${stats.resultRows} (mode ${stats.mode})`);
  });
}
check("mode auto : téléphones détectés, e-mails comparés en texte", () => {
  assert.equal(run(data.recovery, "Téléphone", data.clients, "phone", "inner").stats.mode, "phone");
  assert.equal(run(data.clients, "Email", data.suivi, "Email", "inner").stats.mode, "text");
});
check("tout A : 500 lignes, 75 « Trouvé », 425 « Absent »", () => {
  const { dataset } = run(data.recovery, "Téléphone", data.clients, "phone", "left");
  assert.equal(dataset.rows.length, 500);
  assert.equal(dataset.rows.filter((r) => r[0] === MATCH_FOUND).length, 75);
  assert.equal(dataset.rows.filter((r) => r[0] === MATCH_MISSING).length, 425);
});
check("différence : 425 lignes, colonnes A seulement", () => {
  const { dataset } = run(data.recovery, "Téléphone", data.clients, "phone", "anti");
  assert.equal(dataset.rows.length, 425);
  assert.ok(dataset.columns.every((c) => c.id === "key" || c.label.startsWith("A.")));
});
check("colonnes préfixées A. / B. et rubriques A·06 / B·01", () => {
  const { dataset } = run(data.recovery, "Téléphone", data.clients, "phone", "inner");
  const labels = dataset.columns.map((c) => `${c.rubric} ${c.label}`);
  assert.ok(labels.includes("A·06 A.Téléphone"), labels.join(", "));
  assert.ok(labels.includes("B·01 B.phone"), labels.join(", "));
});
check("le résultat se filtre comme une base : recherche « example.com »", () => {
  const { dataset } = run(data.recovery, "Téléphone", data.clients, "phone", "inner");
  assert.ok(filterRows(dataset, "example.com", []).length > 0);
});
check("suggestion de clé : Téléphone → phone, Email → Email, Prénom → Prenom", () => {
  assert.equal(suggestKeyColumn(findColumnByLabel(data.recovery, "Téléphone")!, data.clients, data.recovery)?.label, "phone");
  assert.equal(suggestKeyColumn(findColumnByLabel(data.clients, "Email")!, data.suivi)?.label, "Email");
  assert.equal(suggestKeyColumn(findColumnByLabel(data.recovery, "Prénom")!, data.clients)?.label, "Prenom");
});

console.log("\nPerformance (20 000 lignes)");
check("filtre + jointure sous 1 s", () => {
  const big: Dataset = { columns: data.recovery.columns, rows: Array.from({ length: 40 }, () => data.recovery.rows).flat() };
  const t0 = performance.now();
  filterRows(big, "dubois", []);
  const t1 = performance.now();
  run(big, "Téléphone", data.clients, "phone", "left");
  const t2 = performance.now();
  console.log(`       recherche ${(t1 - t0).toFixed(0)} ms (index compris), jointure ${(t2 - t1).toFixed(0)} ms`);
  assert.ok(t2 - t0 < 1000);
});

console.log(failures ? `\n${failures} vérification(s) en échec.` : "\nToutes les vérifications passent.");
process.exit(failures ? 1 : 0);
