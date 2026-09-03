import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { footerContent } from '../data/footerContent'
import FooterCarScene from './footer/FooterCarScene'

gsap.registerPlugin(ScrollTrigger)

const SiteFooter = () => {
  const footerRef = useRef(null)
  const overlayRef = useRef(null)
  const revealRefs = useRef([])
  const animProgress = useRef({ value: 0 })

  useLayoutEffect(() => {
    const footer = footerRef.current
    const overlay = overlayRef.current
    if (!footer) return

    const resetVisuals = () => {
      animProgress.current.value = 0
      const items = revealRefs.current.filter(Boolean)
      if (overlay) gsap.set(overlay, { autoAlpha: 0 })
      gsap.set(items, { y: 28, autoAlpha: 0 })
    }

    const ctx = gsap.context(() => {
      const items = revealRefs.current.filter(Boolean)
      resetVisuals()

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.inOut' },
      })

      tl.to(animProgress.current, { value: 1, duration: 4.2, ease: 'none' }, 0)

      if (overlay) {
        tl.to(overlay, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 3.85)
      }

      tl.to(
        items,
        { y: 0, autoAlpha: 1, duration: 0.65, stagger: 0.08, ease: 'power2.out' },
        4.0,
      )

      ScrollTrigger.create({
        trigger: footer,
        start: 'top 90%',
        onEnter: () => {
          resetVisuals()
          tl.restart()
        },
        onLeaveBack: () => {
          tl.pause(0)
          resetVisuals()
        },
      })
    }, footer)

    return () => ctx.revert()
  }, [])

  const { brand, tagline, copyright, mainLinks, legalLinks } = footerContent.footer

  return (
    <footer
      ref={footerRef}
      className="relative min-h-svh w-full max-w-none overflow-hidden bg-[#050505] text-white"
    >
      <div className="absolute inset-0 z-0 h-full w-full min-w-full">
        <FooterCarScene animProgress={animProgress} />
        <div className="pointer-events-none absolute inset-0 z-[1] w-full bg-gradient-to-b from-[#050505]/50 via-[#050505]/20 to-[#050505]/85" />
      </div>

      <div
        ref={overlayRef}
        className="relative z-[2] flex min-h-svh w-full max-w-none flex-col justify-center opacity-0"
      >
        <div className="w-full border-y border-white/10 bg-black/65 px-6 py-12 backdrop-blur-md sm:px-10 sm:py-14 lg:px-16 lg:py-16">
          <div className="mx-auto grid w-full max-w-none gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            <div
              ref={(el) => {
                revealRefs.current[0] = el
              }}
              className="text-center sm:text-left"
            >
              <p className="gallery-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {brand}
              </p>
              <p className="mt-2 text-[11px] tracking-[0.2em] text-white/45 uppercase">
                {tagline}
              </p>
              <div className="mx-auto mt-4 h-px w-full max-w-[3rem] bg-[#7cff6b]/40 sm:mx-0" />
            </div>

            <div
              ref={(el) => {
                revealRefs.current[1] = el
              }}
              className="text-center sm:text-left"
            >
              <p className="mb-4 text-[10px] tracking-[0.24em] text-white/40 uppercase">
                Menu
              </p>
              <ul className="flex flex-col gap-3">
                {mainLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs tracking-widest text-white/55 uppercase transition-colors hover:text-[#7cff6b]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div
              ref={(el) => {
                revealRefs.current[2] = el
              }}
              className="text-center sm:col-span-2 sm:text-left lg:col-span-1"
            >
              <p className="mb-4 text-[10px] tracking-[0.24em] text-white/40 uppercase">
                Legal
              </p>
              <ul className="flex flex-col gap-3">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-xs tracking-widest text-white/55 uppercase transition-colors hover:text-[#7cff6b]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p
            ref={(el) => {
              revealRefs.current[3] = el
            }}
            className="mt-10 w-full border-t border-white/10 pt-8 text-center text-[11px] tracking-[0.12em] text-white/35 sm:mt-12"
          >
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
