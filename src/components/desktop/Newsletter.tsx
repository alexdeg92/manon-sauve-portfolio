"use client";

import { useState } from "react";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";

type Status = { tone: "ok" | "error"; text: string } | null;

/**
 * There is no mailing-list service yet, so a signup is relayed to Manon through
 * the contact endpoint. Swap the fetch when a list provider is added.
 */
export default function Newsletter() {
  const { t } = useSite();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!email.includes("@")) {
      return setStatus({
        tone: "error",
        text: t("Entrez une adresse courriel valide.", "Enter a valid email address."),
      });
    }
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: email.trim(),
          email: email.trim(),
          phone: "Non fourni",
          message: "Inscription à l'infolettre depuis le site.",
          painting: "Infolettre",
        }),
      });
      const data = await res.json();
      if (data.success === true) {
        setEmail("");
        setStatus({
          tone: "ok",
          text: t("Inscription confirmée. Merci.", "Subscribed. Thank you."),
        });
      } else {
        setStatus({
          tone: "error",
          text: t("Une erreur est survenue. Réessayez.", "Something went wrong. Please try again."),
        });
      }
    } catch {
      setStatus({
        tone: "error",
        text: t("Une erreur est survenue. Réessayez.", "Something went wrong. Please try again."),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="mt-[150px] bg-m-sand-soft px-14 py-[100px]">
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-[60px]">
          <div>
            <h2 className="m-0 text-[40px] font-normal tracking-[-.03em]">
              {t("Les nouvelles toiles, quatre fois par an", "New works, four times a year")}
            </h2>
            <p className="mt-3.5 font-editorial text-[17px] text-m-stone-deep">
              {t(
                "Aucune promotion. Seulement les nouvelles pièces, les dates d'exposition et les portes ouvertes.",
                "No promotions. Only new work, exhibition dates and open studio days."
              )}
            </p>
          </div>

          <div className="flex min-w-[400px] gap-2.5">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              type="email"
              autoComplete="email"
              placeholder={t("votre@courriel.ca", "you@email.com")}
              className="flex-1 rounded-full border border-[#D8D3C8] bg-white px-[22px] py-4 text-[14px] outline-none focus:border-m-sage"
            />
            <button
              onClick={submit}
              disabled={sending}
              className="rounded-full bg-m-ink px-7 py-4 text-[14px] text-m-paper transition-colors duration-500 hover:bg-m-sage disabled:opacity-60"
            >
              {sending ? t("Envoi…", "Sending…") : t("S'abonner", "Subscribe")}
            </button>
          </div>

          {status && (
            <div
              className={`w-full text-[13px] ${
                status.tone === "ok" ? "text-m-sage" : "text-red-600"
              }`}
            >
              {status.text}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}
