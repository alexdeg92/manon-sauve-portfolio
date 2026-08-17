"use client";

import { useEffect, useState } from "react";
import { useSite } from "@/components/site/context";
import Reveal from "@/components/site/Reveal";

type Status = { tone: "ok" | "error"; text: string } | null;

const SUBJECTS = [
  { key: "Portrait", fr: "Portrait", en: "Portrait" },
  { key: "Silhouette", fr: "Silhouette", en: "Silhouette" },
  { key: "Danse", fr: "Danse", en: "Dance" },
  { key: "Abstrait", fr: "Abstrait", en: "Abstract" },
];

const FORMATS = [
  { key: "Petit", fr: "Petit", en: "Small", size: '16" × 20"' },
  { key: "Moyen", fr: "Moyen", en: "Medium", size: '24" × 36"' },
  { key: "Grand", fr: "Grand", en: "Large", size: '40" × 40"' },
];

const BUDGETS = ["150–250 $", "250–400 $", "400 $ +"];

interface CommissionProps {
  /** Set when the visitor arrives here from a work's "enquire" button. */
  aboutWork: string | null;
  onConsumeWork: () => void;
}

export default function Commission({ aboutWork, onConsumeWork }: CommissionProps) {
  const { lang, t } = useSite();
  const [step, setStep] = useState(1);
  const [subject, setSubject] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [brief, setBrief] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const [sending, setSending] = useState(false);

  // Arriving from a work overlay pre-fills the brief and jumps to the contact step.
  useEffect(() => {
    if (!aboutWork) return;
    setBrief((current) =>
      current
        ? current
        : `Je vous écris au sujet de « ${aboutWork} ».`
    );
    setStep(3);
    onConsumeWork();
  }, [aboutWork, onConsumeWork]);

  const dash = "—";

  const send = async () => {
    if (!email.trim()) {
      return setStatus({
        tone: "error",
        text: t("Un courriel est nécessaire.", "An email address is needed."),
      });
    }
    if (!name.trim()) {
      return setStatus({ tone: "error", text: t("Votre nom, s'il vous plaît.", "Your name, please.") });
    }

    setSending(true);
    setStatus(null);
    const lines = [
      `Sujet : ${subject ?? dash}`,
      `Format : ${format ?? dash}`,
      `Budget : ${budget ?? dash}`,
      brief.trim() ? `\n${brief.trim()}` : "",
    ].join("\n");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: "Non fourni",
          message: `Demande de commande.\n\n${lines}`,
          painting: aboutWork ?? "Commande",
        }),
      });
      const data = await res.json();
      if (data.success === true) {
        setStatus({
          tone: "ok",
          text: t(
            "Demande envoyée. Manon répond sous deux jours ouvrables.",
            "Request sent. Manon replies within two business days."
          ),
        });
        setName("");
        setEmail("");
        setBrief("");
        setSubject(null);
        setFormat(null);
        setBudget(null);
        setStep(1);
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

  const tabs = [
    { n: 1, fr: "Sujet", en: "Subject" },
    { n: 2, fr: "Format et budget", en: "Format & budget" },
    { n: 3, fr: "Coordonnées", en: "Contact" },
  ];

  return (
    <section id="commande" className="px-14 pt-[150px]">
      <Reveal>
        <div className="mx-auto max-w-[900px] text-center">
          <span className="text-[12px] uppercase tracking-[.2em] text-m-sage">
            {t("Commande", "Commission")}
          </span>
          <h2 className="m-0 mt-5 text-[60px] font-normal leading-[1.02] tracking-[-.035em]">
            {t("Une toile pensée pour votre mur", "A painting made for your wall")}
          </h2>
          <p className="mx-auto mt-[22px] max-w-[520px] font-editorial text-[18px] leading-[1.65] text-m-stone-deep">
            {t(
              "Trois questions, puis Manon répond en deux jours avec une piste d'esquisse, un prix et un échéancier.",
              "Three questions, then Manon replies within two days with a sketch direction, a price and a timeline."
            )}
          </p>
        </div>
      </Reveal>

      <Reveal index={2}>
        <div className="mx-auto mt-[50px] max-w-[900px] overflow-hidden rounded border border-m-line bg-white">
          <div className="flex border-b border-m-line">
            {tabs.map((tab) => (
              <div
                key={tab.n}
                className={`flex-1 px-[22px] py-[18px] text-[13px] tracking-[.02em] transition-colors duration-500 ${
                  step === tab.n ? "bg-m-sand-soft text-m-ink" : "text-m-stone-soft"
                }`}
              >
                <span className={step === tab.n ? "text-m-sage" : ""}>
                  0{tab.n}
                </span>{" "}
                <span>{lang === "en" ? tab.en : tab.fr}</span>
              </div>
            ))}
          </div>

          <div className="p-10">
            {step === 1 && (
              <div className="animate-mFade">
                <div className="mb-5 text-[20px]">
                  {t("Que doit montrer la toile ?", "What should the painting show?")}
                </div>
                <div className="grid grid-cols-4 gap-2.5">
                  {SUBJECTS.map((s) => (
                    <Choice key={s.key} active={subject === s.key} onClick={() => setSubject(s.key)}>
                      {lang === "en" ? s.en : s.fr}
                    </Choice>
                  ))}
                </div>
                <textarea
                  rows={3}
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder={t(
                    "Décrivez la pièce en quelques mots (optionnel)",
                    "Describe the piece in a few words (optional)"
                  )}
                  className="mt-4 w-full resize-y rounded border border-[#D8D3C8] bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
                />
              </div>
            )}

            {step === 2 && (
              <div className="animate-mFade">
                <div className="mb-5 text-[20px]">{t("Format et budget", "Format and budget")}</div>
                <div className="grid grid-cols-3 gap-2.5">
                  {FORMATS.map((f) => (
                    <Choice key={f.key} active={format === f.key} onClick={() => setFormat(f.key)}>
                      <span className="block text-[15px]">{lang === "en" ? f.en : f.fr}</span>
                      <span className="mt-[5px] block text-[13px] opacity-70">{f.size}</span>
                    </Choice>
                  ))}
                </div>
                <div className="mt-[26px] text-[12px] uppercase tracking-[.16em] text-m-quiet">
                  {t("Budget", "Budget")}
                </div>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {BUDGETS.map((b) => (
                    <Choice key={b} active={budget === b} onClick={() => setBudget(b)} pill>
                      {b}
                    </Choice>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-mFade">
                <div className="mb-5 text-[20px]">
                  {t("Où Manon peut-elle vous répondre ?", "Where can Manon reach you?")}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("Nom", "Name")}
                    autoComplete="name"
                    className="rounded border border-[#D8D3C8] bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
                  />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("Courriel", "Email")}
                    type="email"
                    autoComplete="email"
                    className="rounded border border-[#D8D3C8] bg-transparent px-4 py-3.5 text-[14px] outline-none focus:border-m-sage"
                  />
                </div>
                <div className="mt-5 rounded bg-m-sand-soft px-5 py-[18px] text-[14px] leading-[1.7] text-m-stone-deep">
                  <div>
                    {t("Sujet", "Subject")} : {subject ?? dash}
                  </div>
                  <div>
                    {t("Format", "Format")} : {format ?? dash}
                  </div>
                  <div>
                    {t("Budget", "Budget")} : {budget ?? dash}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between gap-5 border-t border-m-line pt-[26px]">
              <button
                onClick={() => setStep(Math.max(1, step - 1))}
                className={`text-[14px] text-m-quiet ${step === 1 ? "invisible" : ""}`}
              >
                {t("Retour", "Back")}
              </button>
              <button
                onClick={() => (step < 3 ? setStep(step + 1) : send())}
                disabled={sending}
                className="rounded-full bg-m-ink px-[30px] py-[15px] text-[14px] text-m-paper transition-all duration-500 hover:-translate-y-0.5 hover:bg-m-sage disabled:opacity-60"
                style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }}
              >
                {step === 3
                  ? sending
                    ? t("Envoi…", "Sending…")
                    : t("Envoyer la demande", "Send the request")
                  : t("Continuer", "Continue")}
              </button>
            </div>

            {status && (
              <div
                className={`mt-4 text-[14px] ${
                  status.tone === "ok" ? "text-m-sage" : "text-red-600"
                }`}
              >
                {status.text}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Choice({
  active,
  onClick,
  children,
  pill,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  pill?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`border text-left transition-all duration-300 ${
        pill ? "rounded-full px-5 py-3 text-[14px]" : "rounded px-4 py-5 text-[14px]"
      } ${active ? "border-m-ink bg-m-ink text-m-paper" : "border-[#D8D3C8] bg-transparent hover:border-m-ink"}`}
    >
      {children}
    </button>
  );
}
