import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { footerContent } from '../data/footerContent'

gsap.registerPlugin(ScrollTrigger)

const ContactCtaSection = () => {
  const sectionRef = useRef(null)
  const revealRefs = useRef([])

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const items = revealRefs.current.filter(Boolean)
      gsap.set(items, { y: 36, autoAlpha: 0 })

      ScrollTrigger.create({
        trigger: section,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(items, {
            y: 0,
            autoAlpha: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: 'power2.out',
          })
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  const { label, headline, headlineAccent, subtext, primaryCta, secondaryCta, contactEmail, availability } =
    footerContent.cta

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative border-t border-white/10 bg-[#0a0a0a] px-6 py-16 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(47,191,74,0.08),transparent_70%)]" />

      <div className="relative z-[1] mx-auto max-w-2xl text-center">
        <p
          ref={(el) => {
            revealRefs.current[0] = el
          }}
          className="mb-3 text-[11px] tracking-[0.28em] text-white/45 uppercase"
        >
          {label}
        </p>
        <h2
          ref={(el) => {
            revealRefs.current[1] = el
          }}
          className="gallery-serif text-[clamp(1.75rem,5vw,3.25rem)] leading-[0.95] font-semibold tracking-tight text-white"
        >
          {headline}
          <br />
          <span className="hero-gradient-text">{headlineAccent}</span>
        </h2>
        <p
          ref={(el) => {
            revealRefs.current[2] = el
          }}
          className="mt-5 text-[13px] leading-relaxed text-white/60 sm:mt-6 sm:text-[14px]"
        >
          {subtext}
        </p>

        <div
          ref={(el) => {
            revealRefs.current[3] = el
          }}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:mt-10 sm:flex-row sm:gap-5"
        >
          <a
            href="#contact"
            className="inline-flex w-full items-center justify-center border border-[#7cff6b]/40 bg-[#7cff6b]/10 px-6 py-3 text-[11px] tracking-[0.2em] text-[#7cff6b] uppercase transition-colors hover:border-[#7cff6b] hover:bg-[#7cff6b]/15 sm:w-auto"
          >
            {primaryCta}
          </a>
          <a
            href={`mailto:${contactEmail}`}
            className="text-[11px] tracking-[0.18em] text-white/55 uppercase underline underline-offset-4 transition-colors hover:text-[#7cff6b]"
          >
            {secondaryCta}
          </a>
        </div>

        <div
          ref={(el) => {
            revealRefs.current[4] = el
          }}
          className="mt-8 border-t border-white/10 pt-8 sm:mt-10"
        >
          <a
            href={`mailto:${contactEmail}`}
            className="text-[13px] text-white/70 transition-colors hover:text-[#7cff6b]"
          >
            {contactEmail}
          </a>
          <p className="mt-2 text-[11px] tracking-[0.14em] text-white/40 uppercase">
            {availability}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ContactCtaSection
