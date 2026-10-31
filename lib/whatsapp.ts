// Lien d'aide WhatsApp, construit côté serveur à partir de WHATSAPP_NUMBER (.env.local).
// Le message de salutation est pré-rempli dans la conversation.

const GREETING = "Bonjour Hevolue, j'ai besoin d'aide avec Sheet Explorer.";

/** https://wa.me/<numéro>?text=…, ou null si le numéro n'est pas configuré. */
export function whatsappUrl(): string | null {
  const digits = (process.env.WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(GREETING)}`;
}
