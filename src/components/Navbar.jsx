import { footerContent } from '../data/footerContent'

const Navbar = () => {
  const { mainLinks } = footerContent.footer

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30">
      <nav className="pointer-events-auto mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 text-white/70 sm:px-10">
        <a
          href="#top"
          className="text-sm font-semibold tracking-[0.28em] text-white uppercase"
        >
          Cars Explore
        </a>

        <ul className="flex items-center gap-6 text-xs tracking-widest uppercase">
          {mainLinks.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
