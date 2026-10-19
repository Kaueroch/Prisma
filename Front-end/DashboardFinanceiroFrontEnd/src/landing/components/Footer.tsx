import { Wallet } from 'lucide-react'
import { footer } from '../content'

export function Footer() {
  return (
    <footer className="border-t border-edge">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="max-w-xs">
            <a href="#inicio" className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-black">
                <Wallet className="h-4 w-4" />
              </span>
              <span className="text-base font-bold tracking-tight">Prisma</span>
            </a>
            <p className="mt-4 text-sm leading-relaxed text-fg-muted">{footer.description}</p>
          </div>

          {footer.columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-sm font-medium text-fg tracking-tight">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label + link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-fg-muted transition-colors duration-200 outline-none hover:text-fg focus-visible:ring-2 focus-visible:ring-ring/50 rounded"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-edge pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-fg-muted">{footer.rights}</p>
          <p className="text-xs text-fg-muted">
            Built for people who believe understanding their money is freedom.
          </p>
        </div>
      </div>
    </footer>
  )
}