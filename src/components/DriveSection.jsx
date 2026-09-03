import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { driveContent, drivePanelContent } from '../data/driveFeatures'
import DriveScene from './drive/DriveScene'
import SpinCarScene from '../components/drive/SpinCar'

gsap.registerPlugin(ScrollTrigger)

const SECTION_SCROLL_DESKTOP = 2.5
const SECTION_SCROLL_MOBILE = 2
const SCRUB_SMOOTH = 1.1

function getSectionHeight() {
  const mobile = window.innerWidth < 1024
  return mobile ? SECTION_SCROLL_MOBILE : SECTION_SCROLL_DESKTOP
}

function getPanelWidthPercent() {
  if (window.innerWidth < 640) return 84
  if (window.innerWidth < 1024) return 74
  return 58
}

const DriveSection = () => {
  const sectionRef = useRef(null)
  const panelRef = useRef(null)
  const carLayerRef = useRef(null)
  const carPeekRef = useRef(null)

  const spinProgress = useRef({ value: 0 })
  const panelProgress = useRef({ value: 0 })
  const carDisplayProgress = useRef({ value: 0.5 })

  useLayoutEffect(() => {
    const section = sectionRef.current
    const panel = panelRef.current
    const carLayer = carLayerRef.current
    const carPeek = carPeekRef.current
    if (!section || !panel) return

    section.style.height = `${getSectionHeight() * 100}vh`

    const ctx = gsap.context(() => {
      const applyVisuals = () => {
        const panelT = panelProgress.current.value
        const panelWidth = getPanelWidthPercent()
        const mobile = window.innerWidth < 1024

        panel.style.width = `${panelWidth}%`
        panel.style.transform = `translate3d(${(1 - panelT) * -100}%, 0, 0)`
        panel.style.setProperty('--panel-reveal', String(panelT))

        if (carLayer) {
          const shift = panelT * (mobile ? 5 : 8)
          const scale = 1 - panelT * (mobile ? 0.06 : 0.04)
          carLayer.style.transform = `translate3d(${shift}%, 0, 0) scale(${scale})`
        }

        if (carPeek) {
          carPeek.style.width = `${100 - panelWidth}%`
          carPeek.style.opacity = String(0.35 + panelT * 0.65)
        }
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
        spinProgress.current,
        { value: 1, duration: 0.55, ease: 'none' },
        0,
      )
      tl.to(
        panelProgress.current,
        { value: 1, duration: 0.45, ease: 'power2.inOut' },
        0.55,
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
      id="drive"
      ref={sectionRef}
      className="relative bg-[#050505] text-white"
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <div className="relative flex h-full flex-col lg:flex-row">
          <div className="relative h-[45vh] w-full shrink-0 overflow-hidden lg:h-full lg:w-1/2">
            <div
              ref={carLayerRef}
              className="absolute inset-0 z-0 origin-center will-change-transform"
            >
              <SpinCarScene spinProgress={spinProgress} />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_62%_48%,rgba(47,191,74,0.12),transparent_68%)]" />
            </div>

            <div
              ref={carPeekRef}
              className="pointer-events-none absolute inset-y-0 right-0 z-[1] border-l border-[#7cff6b]/25 bg-[radial-gradient(ellipse_80%_90%_at_72%_50%,rgba(124,255,107,0.06),transparent_72%)] opacity-0"
              aria-hidden
            >
              <div className="absolute inset-3 border border-[#7cff6b]/15 sm:inset-4" />
              <p className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-[9px] tracking-[0.22em] text-[#7cff6b]/50 uppercase sm:block sm:bottom-5 sm:text-[10px]">
                Live spin
              </p>
            </div>

            <div
              ref={panelRef}
              className="drive-panel-slide drive-panel-bg absolute top-0 bottom-0 left-0 z-20 flex flex-col overflow-y-auto border-r border-[#7cff6b]/30 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10"
              style={{ transform: 'translate3d(-100%, 0, 0)', '--panel-reveal': 0, width: '58%' }}
            >
              <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center">
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
                  {driveContent.features.map((feature) => (
                    <div
                      key={feature.title}
                      className="border border-[#7cff6b]/15 bg-[#7cff6b]/[0.03] px-3 py-2.5 ring-1 ring-white/[0.04] sm:px-4 sm:py-3"
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

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-black/30 to-transparent px-4 py-3 lg:hidden">
              <p className="text-[10px] tracking-[0.2em] text-white/50 uppercase">
                Scroll to spin
              </p>
            </div>
          </div>

          <div className="relative flex h-[55vh] w-full flex-col bg-[#050505] lg:h-full lg:w-1/2">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,rgba(47,191,74,0.07),transparent_72%)]" />

            <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-5 pt-5 pb-3 sm:px-8 sm:pt-6 lg:px-10 lg:pt-8">
              <p className="mb-2 text-[10px] tracking-[0.26em] text-white/45 uppercase sm:text-[11px]">
                {drivePanelContent.label}
              </p>
              <h3 className="gallery-serif hero-gradient-text text-center text-[clamp(1.75rem,5vw,3.25rem)] leading-[0.95] font-semibold tracking-tight">
                {drivePanelContent.headline}
                <br />
                {drivePanelContent.headlineAccent}
              </h3>

              <div className="relative mt-5 w-full max-w-[min(92vw,420px)] sm:mt-6">
                <div
                  className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border border-[#7cff6b]/20 bg-[#7cff6b]/[0.04]"
                  aria-hidden
                />
                <div className="drive-scene-frame relative overflow-hidden border border-white/10 bg-[#0a0a0a] ring-1 ring-[#7cff6b]/25">
                  <div className="h-[min(40vh,280px)] w-full sm:h-[min(38vh,300px)] lg:h-[min(42vh,320px)]">
                    <DriveScene carDisplayProgress={carDisplayProgress} />
                  </div>
                </div>
              </div>

              <p className="mt-5 max-w-md text-center text-[12px] leading-relaxed text-white/60 sm:mt-6 sm:text-[13px] lg:max-w-sm">
                {drivePanelContent.intro}
              </p>
              <p className="mt-2 hidden text-[10px] tracking-[0.18em] text-white/35 uppercase sm:block">
                Drag to rotate
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-4 text-[10px] tracking-[0.24em] text-white/30 uppercase sm:pb-5 sm:text-[11px]">
          <span className="hidden lg:inline">
            Scroll to spin · Keep scrolling for features
          </span>
          <span className="lg:hidden">Scroll to spin · Reveal features</span>
        </div>
      </div>
    </section>
  )
}

export default DriveSection
