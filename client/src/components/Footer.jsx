import { Github, Twitter, Mail, Linkedin } from 'lucide-react'

const socialLinks = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:hello@example.com', label: 'Email' },
]

export default function Footer() {
  return (
    <footer className="py-6">
      <div className="container mx-auto px-6">
        <div className="bg-bg-primary/70 backdrop-blur-md rounded-3xl border border-border/50 shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-serif text-lg text-text-primary">Andy</p>
              <p className="text-sm text-text-secondary mt-1">
                用文字和代码记录思考
              </p>
            </div>

            <div className="flex items-center gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-text-secondary hover:text-accent hover:scale-110 transition-all"
                  aria-label={label}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <p className="text-xs text-text-secondary">
              &copy; {new Date().getFullYear()} Andy. 用热爱铸造.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
