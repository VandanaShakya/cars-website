import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { driveContent } from '../data/driveFeatures'
import AboutCarScene from './about/AboutCarScene'

gsap.registerPlugin(ScrollTrigger)

const SECTION_SCROLL_DESKTOP = 3
const SECTION_SCROLL_MOBILE = 2.5
const SCRUB_SMOOTH = 1.1
const CARD_COUNT = driveContent.features.length
const CARD_STAGGER = 0.12

function getSectionHeight() {
  const mobile = window.innerWidth < 1024
  return mobile ? SECTION_SCROLL_MOBILE : SECTION_SCROLL_DESKTOP
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

const AboutSection = () => {
  const sectionRef = useRef(null)
  const carLayerRef = useRef(null)
  const cardRefs = useRef([])

  const carEnterProgress = useRef({ value: 0 })
  const cardsProgress = useRef({ value: 0 })

  useLayoutEffect(() => {
    const section = sectionRef.current
    const carLayer = carLayerRef.current
    if (!section) return

    cardRefs.current = cardRefs.current.slice(0, CARD_COUNT)
    section.style.height = `${getSectionHeight() * 100}vh`

    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card) => {
        if (card) {
          gsap.set(card, {
            scale: 0.15,
            autoAlpha: 0,
            x: -24,
            transformOrigin: 'left center',
          })
        }
      })

      const applyVisuals = () => {
        const carT = carEnterProgress.current.value
        const cardsT = cardsProgress.current.value

        if (carLayer) {
          const enterX = (1 - carT) * 120
          const settleScale = 0.92 + Math.min(carT, 1) * 0.08
          carLayer.style.transform = `translate3d(${enterX}%, 0, 0) scale(${settleScale})`
        }

        cardRefs.current.forEach((card, i) => {
          if (!card) return
          const start = i * CARD_STAGGER
          const localT = clamp((cardsT - start) / 0.22, 0, 1)
          gsap.set(card, {
            scale: 0.15 + localT * 0.85,
            autoAlpha: localT,
            x: -24 + localT * 24,
          })
        })
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB_SMOOTH,
          invalidateOnRefresh: true,
          onUpdate: applyVisuals,
        },
      })

      tl.to(
        carEnterProgress.current,
        { value: 1, duration: 0.45, ease: 'power2.out' },
        0,
      )
      tl.to(
        cardsProgress.current,
        { value: 1, duration: 0.55, ease: 'power2.inOut' },
        0.45,
      )

      applyVisuals()
    }, section)

    const onResize = () => {
      section.style.height = `${getSectionHeight() * 100}vh`
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      ctx.revert()
    }
  }, [])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-[#050505] text-white"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <div className="relative flex h-full flex-col lg:flex-row">
          <div className="relative h-[42vh] w-full shrink-0 overflow-hidden lg:h-full lg:w-1/3">
            <div
              ref={carLayerRef}
              className="absolute inset-0 origin-center will-change-transform"
              style={{ transform: 'translate3d(120%, 0, 0)' }}
            >
              <AboutCarScene enterProgress={carEnterProgress} />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_62%_48%,rgba(47,191,74,0.12),transparent_68%)]" />
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-black/40 to-transparent px-4 py-3 lg:hidden">
              <p className="text-[10px] tracking-[0.2em] text-white/50 uppercase">
                Scroll for specialties
              </p>
            </div>
          </div>

          <div className="relative flex h-[58vh] w-full flex-col overflow-y-auto border-t border-white/10 px-5 py-6 sm:px-8 sm:py-8 lg:h-full lg:w-2/3 lg:border-t-0 lg:border-l lg:border-white/10 lg:px-10 lg:py-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,rgba(47,191,74,0.07),transparent_72%)]" />

            <div className="relative z-[1] mx-auto flex w-full max-w-xl flex-1 flex-col justify-center lg:max-w-2xl">
              <p className="mb-2 text-[10px] tracking-[0.28em] text-white/45 uppercase sm:mb-3 sm:text-[11px]">
                {driveContent.label}
              </p>
              <h2 className="gallery-serif hero-gradient-text text-[clamp(1.75rem,5vw,3.5rem)] leading-[0.95] font-semibold tracking-tight">
                {driveContent.headline}
                <br />
                {driveContent.headlineAccent}
              </h2>
              <p className="mt-4 text-[12px] leading-relaxed text-white/65 sm:mt-5 sm:text-[13px]">
                {driveContent.intro}
              </p>

              <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
                {driveContent.features.map((feature, i) => (
                  <div
                    key={feature.title}
                    ref={(el) => {
                      cardRefs.current[i] = el
                    }}
                    className="border border-[#7cff6b]/15 bg-[#7cff6b]/[0.03] px-3 py-2.5 ring-1 ring-white/[0.04] will-change-transform sm:px-4 sm:py-3"
                    style={{
                      transform: 'scale(0.15) translate3d(-24px, 0, 0)',
                      opacity: 0,
                      transformOrigin: 'left center',
                    }}
                  >
                    <p className="text-[11px] font-medium tracking-[0.05em] text-[#7cff6b] sm:text-[12px]">
                      {feature.title}
                    </p>
                    <p className="mt-1 text-[11px] leading-relaxed text-white/55 sm:text-[12px]">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-[9px] tracking-[0.2em] text-white/35 uppercase sm:mt-6 sm:text-[10px]">
                {driveContent.footer}
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-4 text-[10px] tracking-[0.24em] text-white/30 uppercase sm:pb-5 sm:text-[11px]">
          <span className="hidden lg:inline">
            Scroll to enter · Keep scrolling for features
          </span>
          <span className="lg:hidden">Scroll to explore features</span>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
