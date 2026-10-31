// La landing : une barre, une hero (titre, actions, vidéo de démonstration) et un pied de page.
// Les couleurs viennent des variables --l-* (app/globals.css).

import { ConnectActions } from "@/components/landing/connect-actions";
import { CurrentYear } from "@/components/landing/current-year";
import { DemoVideo } from "@/components/landing/demo-video";
import { NavBasesLink, ResumeBases } from "@/components/landing/resume-bases";
import { Wordmark } from "@/components/logo";
import { WhatsAppFloat } from "@/components/whatsapp";
import { whatsappUrl } from "@/lib/whatsapp";

const NAV = [{ href: "#demo", label: "Voir la démo" }];

export function LandingPage() {
  const whatsapp = whatsappUrl();
  return (
    <div className="landing flex min-h-svh flex-col">
      {/* Barre */}
      <header className="border-t-4 border-t-[var(--l-rule)]">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-[1fr_auto] items-center gap-6 px-5 md:grid-cols-[1fr_auto_1fr] md:px-8">
          <a href="#" aria-label="Sheet Explorer, accueil" className="w-fit text-[var(--l-ink)]">
            <Wordmark />
          </a>
          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex gap-7 text-[13px] font-medium text-[var(--l-ink)]">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="rounded-sm opacity-80 hover:opacity-100">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-2 justify-self-end">
            <NavBasesLink className="hidden sm:inline-flex" />
            <ConnectActions compact />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Titre et actions */}
        <section className="mx-auto max-w-4xl px-5 pt-20 pb-12 text-center md:pt-28">
          <h1 className="landing-serif text-[2.75rem] leading-[1.05] tracking-[-0.02em] text-balance text-[var(--l-ink)] sm:text-6xl md:text-[4.25rem]">
            Collez un lien de Sheet,
            <br />
            trouvez les <em className="italic">bonnes</em> données
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[17px] text-[var(--l-muted)]">
            Collez le lien de votre fichier et retrouvez en quelques secondes le contact que vous cherchez, même si son
            nom est écrit sans accent ou son numéro dans un autre format. Vous pouvez aussi rapprocher deux fichiers et
            repartir avec un export propre, sans rien configurer.
          </p>
          <div className="mt-8">
            <ConnectActions />
          </div>
          <ResumeBases />
          <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
            <div className="flex -space-x-1.5" aria-hidden>
              {["A", "B", "C", "D"].map((l) => (
                <span
                  key={l}
                  className="landing-mono grid size-7 place-items-center rounded-full border-2 border-[var(--l-bg)] bg-[var(--l-tag)] text-[11px] text-[var(--l-ink)]"
                >
                  {l}
                </span>
              ))}
            </div>
            <p className="text-[13px] text-balance text-[var(--l-muted)]">N&apos;importe quelles colonnes, lues depuis la ligne 1</p>
          </div>
        </section>

        {/* Vidéo de démonstration */}
        <section id="demo" aria-label="Démonstration" className="mx-auto max-w-6xl scroll-mt-6 px-3 pb-16 md:px-4">
          <figure className="overflow-hidden rounded-lg bg-[var(--l-card)] ring-1 ring-[var(--l-line)] shadow-[0_30px_60px_-40px_rgb(40_30_20/0.45)]">
            <DemoVideo />
            <figcaption className="flex flex-col gap-1 border-t border-[var(--l-line)] px-4 py-3 text-[13px] text-[var(--l-muted)] sm:flex-row sm:items-center sm:justify-between">
              <span>Coller un lien, chercher une personne, ouvrir sa fiche, croiser deux bases.</span>
              <span className="landing-mono text-[11px] tracking-wider uppercase">Données fictives</span>
            </figcaption>
          </figure>
        </section>
      </main>

      {/* Pied de page */}
      <footer className="border-t border-[var(--l-line)]">
        {/* Marges réservées au bouton WhatsApp : il ne couvre jamais « Hevolue ». */}
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-5 pt-6 pb-24 text-[13px] text-[var(--l-muted)] sm:flex-row sm:justify-between sm:pr-24 sm:pb-6 md:pl-8">
          <p>
            © <CurrentYear /> Sheet Explorer
          </p>
          <p>
            Un produit{" "}
            <a
              href="https://hevolue.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[var(--l-ink)] underline decoration-[var(--l-line)] underline-offset-4 hover:decoration-[var(--l-ink)]"
            >
              Hevolue
            </a>
          </p>
        </div>
      </footer>
      {whatsapp && <WhatsAppFloat href={whatsapp} />}
    </div>
  );
}
