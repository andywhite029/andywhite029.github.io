import { useState } from 'react'
import { Github, Mail } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { translations } from '../../data/translations'

const EMAIL = 'srkang@qq.com'

export default function ContactSection() {
  const currentYear = new Date().getFullYear()
  const { language } = useLanguage()
  const t = translations[language]
  const [copied, setCopied] = useState(false)

  const handleEmailClick = async () => {
    // 本机没有邮件客户端时 mailto 会静默失败，先把地址复制到剪贴板兜底
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 剪贴板不可用时静默失败，mailto 仍会尝试拉起邮件客户端
    }
  }

  return (
    <section
      id="contact"
      className="py-16 lg:py-24 border-t border-border"
    >
      <div className="font-mono text-xs text-accent-red tracking-[0.3em] mb-6 uppercase">
        {t.contact.frame}
      </div>

      <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-6">
        {t.contact.title}
      </h2>

      <p className="text-text-secondary max-w-xl mb-10 leading-relaxed">
        {t.contact.description}
      </p>

      <div className="flex flex-wrap items-center gap-6 mb-16">
        <a
          href="https://github.com/andywhite029"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-sm text-text-secondary hover:text-accent-red transition-colors"
        >
          <Github size={18} />
          GitHub
        </a>
        <a
          href={`mailto:${EMAIL}`}
          onClick={handleEmailClick}
          className="flex items-center gap-2 font-mono text-sm text-text-secondary hover:text-accent-red transition-colors"
        >
          <Mail size={18} />
          {EMAIL}
        </a>
        {copied && (
          <span className="font-mono text-xs text-accent-green">
            {t.contact.copied}
          </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 font-mono text-xs text-text-secondary/60 border-t border-border pt-8">
        <p>© {currentYear} Andy. All rights reserved.</p>
        <p>{t.contact.builtWith}</p>
      </div>
    </section>
  )
}
