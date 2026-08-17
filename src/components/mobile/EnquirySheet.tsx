"use client";

import { useEffect, useState } from "react";
import { Painting } from "@/data/paintings";
import { priceLabel } from "@/lib/mobile";
import { useSite } from "@/components/site/context";
import Sheet from "./Sheet";

interface EnquirySheetProps {
  open: boolean;
  /** null means a general enquiry (the commission entry point). */
  painting: Painting | null;
  onClose: () => void;
}

/** The mobile counterpart of ContactModal: same /api/contact relay, sheet form. */
export default function EnquirySheet({ open, painting, onClose }: EnquirySheetProps) {
  const { lang, t, say } = useSite();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) setError(false);
  }, [open]);

  const defaultMessage = painting
    ? `Bonjour Manon,\n\nJe suis intéressé(e) par votre œuvre « ${painting.title} » (${priceLabel(painting, "fr")}).\n\nMerci de me contacter pour plus d'informations.`
    : "Bonjour Manon,\n\nJ'aimerais discuter d'une commande.\n\nMerci de me contacter.";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone.trim(),
          message: message || defaultMessage,
          painting: painting?.title,
        }),
      });
      const data = await res.json();
      if (data.success === true) {
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        onClose();
        say(t("Demande envoyée à Manon.", "Inquiry sent to Manon."));
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <form onSubmit={submit} className="px-6 pb-[30px] pt-3">
        <div className="text-[10px] uppercase tracking-[.2em] text-m-sage">
          {painting ? t("Demande", "Enquiry") : t("Commande", "Commission")}
        </div>
        <h3 className="mt-2 font-editorial text-[26px] font-light italic">
          {painting ? painting.title : t("Une toile pour votre mur", "A painting for your wall")}
        </h3>
        {painting && (
          <div className="mt-1.5 text-[13px] text-m-stone">{priceLabel(painting, lang)}</div>
        )}

        <Field label={t("Nom complet", "Full name")}>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            className="w-full rounded-[12px] border border-m-line-strong bg-white px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
          />
        </Field>
        <Field label={t("Courriel", "Email")}>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-[12px] border border-m-line-strong bg-white px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
          />
        </Field>
        <Field label={t("Téléphone (optionnel)", "Phone (optional)")}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
            className="w-full rounded-[12px] border border-m-line-strong bg-white px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
          />
        </Field>
        <Field label={t("Message", "Message")}>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={defaultMessage}
            className="w-full resize-none rounded-[12px] border border-m-line-strong bg-white px-4 py-3.5 text-[14px] outline-none placeholder:text-m-stone-soft focus:border-m-sage"
          />
        </Field>

        <div className="mt-4 flex gap-2.5">
          <button
            type="submit"
            disabled={sending}
            className="flex-1 rounded-full bg-m-ink py-4 text-[14px] text-m-paper disabled:opacity-60"
          >
            {sending ? t("Envoi…", "Sending…") : t("Envoyer", "Send")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-m-line-strong px-5 py-4 text-[14px]"
          >
            {t("Fermer", "Close")}
          </button>
        </div>
        {error && (
          <p className="mt-3 text-center text-[13px] text-red-600">
            {t("Une erreur est survenue. Réessayez.", "Something went wrong. Please try again.")}
          </p>
        )}
      </form>
    </Sheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="text-[10px] uppercase tracking-[.16em] text-m-stone">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
