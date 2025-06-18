import React from "react";
import { useTranslation } from "react-i18next";

const Terms = () => {
  const { t } = useTranslation();
  const transactionPoints = t("terms.transaction.points", { returnObjects: true });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-[var(--hitam)] dark:text-[var(--hitam)]">
      <h1 className="text-4xl font-extrabold mb-2 text-[var(--merah)] dark:text-[var(--merah)]">
        {t("terms.title")}
      </h1>
      <p className="text-sm mb-6 text-[var(--abu-abu-gelap)] dark:text-[var(--abu2)] italic">
        {t("terms.last_updated")}
      </p>

      <section className="mb-8 bg-[var(--hitam)] dark:bg-[var(--abu2)] border border-[var(--abu-abu-gelap)] dark:border-[var(--abu)] p-5 rounded-lg shadow-sm">
        <p className="text-base leading-relaxed text-[var(--hitam)] dark:text-[var(--hitam)] font-medium">
          {t("terms.acceptance")}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold text-[var(--merah)] mb-4">
          {t("terms.transaction.title")}
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-base text-[var(--hitam)] dark:text-[var(--hitam)]">
          {Array.isArray(transactionPoints) &&
            transactionPoints.map((item, index) => (
              <li key={index} className="transition-all hover:pl-2 hover:text-[var(--merah)]">{item}</li>
            ))}
        </ul>
      </section>

      <section className="mb-10 grid md:grid-cols-2 gap-6">
        <div className="bg-[var(--hitam)] dark:bg-[var(--abu)] p-6 rounded-xl shadow-md border border-[var(--abu-abu-gelap)] transition-transform hover:scale-[1.02]">
          <h3 className="text-lg font-bold text-[var(--merah)] mb-2">
            {t("terms.services")}
          </h3>
          <p className="text-[var(--hitam)] dark:text-[var(--hitam)] leading-relaxed">
            {t("terms.user_data")}
          </p>
        </div>

        <div className="bg-[var(--hitam)] dark:bg-[var(--abu)] p-6 rounded-xl shadow-md border border-[var(--abu-abu-gelap)] transition-transform hover:scale-[1.02]">
          <h3 className="text-lg font-bold text-[var(--merah)] mb-2">
            {t("terms.user_responsibility")}
          </h3>
          <p className="text-[var(--hitam)] dark:text-[var(--hitam)] leading-relaxed">
            {t("terms.modification")}
          </p>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3 text-[var(--merah)]">
          {t("terms.contact")}
        </h2>
        <ul className="list-none space-y-2 text-[var(--hitam)] dark:text-[var(--hitam)] text-base">
          <li className="flex items-center gap-2"><span className="text-xl">📧</span> {t("terms.contact_info.email")}</li>
          <li className="flex items-center gap-2"><span className="text-xl">📱</span> {t("terms.contact_info.whatsapp")}</li>
          <li className="flex items-center gap-2"><span className="text-xl">🌐</span> {t("terms.contact_info.website")}</li>
        </ul>
      </section>
    </div>
  );
};

export default Terms;
