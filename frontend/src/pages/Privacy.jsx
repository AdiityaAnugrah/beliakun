import React from "react";
import { useTranslation } from "react-i18next";

const Privacy = () => {
  const { t } = useTranslation();

  const collectedItems = t("privacy.collected.items", { returnObjects: true });
  const usageItems = t("privacy.usage.items", { returnObjects: true });
  const rightsItems = t("privacy.rights.items", { returnObjects: true });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-[var(--hitam)] dark:text-[var(--hitam)]">
      <h1 className="text-4xl font-extrabold mb-2 text-[var(--merah)] dark:text-[var(--merah)]">
        {t("privacy.title")}
      </h1>
      <p className="text-sm mb-6 text-[var(--abu-abu-gelap)] dark:text-[var(--abu2)] italic">
        {t("privacy.last_updated")}
      </p>

      <section className="mb-8 bg-[var(--hitam)] dark:bg-[var(--abu2)] border border-[var(--abu-abu-gelap)] dark:border-[var(--abu)] p-5 rounded-lg shadow-sm">
        <p className="text-base leading-relaxed text-[var(--hitam)] dark:text-[var(--hitam)]">
          {t("privacy.intro")}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--merah)] mb-4">{t("privacy.collected.title")}</h2>
        <ul className="list-disc ml-6 space-y-2">
          {Array.isArray(collectedItems) &&
            collectedItems.map((item, index) => (
              <li key={index} className="hover:pl-2 transition-all">{item}</li>
            ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--merah)] mb-4">{t("privacy.usage.title")}</h2>
        <ul className="list-disc ml-6 space-y-2">
          {Array.isArray(usageItems) &&
            usageItems.map((item, index) => (
              <li key={index} className="hover:pl-2 transition-all">{item}</li>
            ))}
        </ul>
        <p className="mt-3 text-[var(--hitam)] dark:text-[var(--hitam)]">{t("privacy.usage.note")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--merah)] mb-4">{t("privacy.security.title")}</h2>
        <p>{t("privacy.security.description")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--merah)] mb-4">{t("privacy.rights.title")}</h2>
        <ul className="list-disc ml-6 space-y-2">
          {Array.isArray(rightsItems) &&
            rightsItems.map((item, index) => (
              <li key={index} className="hover:pl-2 transition-all">{item}</li>
            ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--merah)] mb-4">{t("privacy.cookies.title")}</h2>
        <p>{t("privacy.cookies.description")}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--merah)] mb-4">{t("privacy.changes.title")}</h2>
        <p>{t("privacy.changes.description")}</p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3 text-[var(--merah)]">
          {t("privacy.contact.title")}
        </h2>
        <ul className="list-none space-y-2 text-base">
          <li className="flex items-center gap-2">📧 {t("privacy.contact.email")}</li>
          <li className="flex items-center gap-2">📱 {t("privacy.contact.whatsapp")}</li>
          <li className="flex items-center gap-2">🌐 {t("privacy.contact.website")}</li>
        </ul>
      </section>
    </div>
  );
};

export default Privacy;
