import { useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'

/** 联系：真实邮箱（复制有反馈）+ GitHub，不出现占位社交链接。 */
export default function ContactSection() {
  const { language } = useLanguage()
  const t = translations[language]
  const c = t.contact
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(c.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // 剪贴板不可用时不打断用户，mailto 仍然可用
    }
  }

  return (
    <section id="contact" className="bg-ink text-paper">
      <div className="mx-auto w-full max-w-content px-5 py-24 md:px-8 md:py-32">
        <p className="eyebrow text-paper/50">
          {t.common.chapter} {c.index}
        </p>
        <h2 className="chapter-title mt-3 text-paper">{c.title}</h2>
        <p className="mt-6 max-w-xl leading-relaxed text-paper/70">{c.desc}</p>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <a
            href={`mailto:${c.email}`}
            onClick={copyEmail}
            className="inline-flex items-center justify-center gap-3 rounded-full bg-paper px-7 py-4 text-[16px] font-semibold text-ink transition-transform hover:scale-[1.02]"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
              <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {c.email}
          </a>
          <button
            type="button"
            onClick={copyEmail}
            className="inline-flex items-center justify-center rounded-full border border-paper/30 px-6 py-4 text-[15px] font-semibold text-paper transition-colors hover:border-paper/70"
          >
            {copied ? c.copied : c.copy}
          </button>
          <a
            href="https://github.com/andywhite029"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-paper/30 px-6 py-4 text-[15px] font-semibold text-paper transition-colors hover:border-paper/70"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.5 0-.24 0-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.9-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.06 10.06 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
            </svg>
            {c.github}
          </a>
        </div>

        <p className="mt-10 text-[13px] font-medium uppercase tracking-[0.18em] text-paper/40">{c.directions}</p>
      </div>

      <footer className="border-t border-paper/10">
        <div className="mx-auto flex w-full max-w-content flex-col gap-2 px-5 py-8 text-[13px] text-paper/45 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>© {new Date().getFullYear()} Andy — {t.footer.tagline}</p>
          <p>{t.footer.rights}</p>
        </div>
      </footer>
    </section>
  )
}
