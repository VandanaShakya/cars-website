import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { artAssetContent } from '../data/artAssetContent'

gsap.registerPlugin(ScrollTrigger)

const SLIDE_COUNT = artAssetContent.scrollImages.length
const SLIDE_SCROLL = 1
const SCRUB_SMOOTH = 1.1
const SLIDE_DURATION = 0.85

const ArtAssetSection = () => {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const imageRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    if (!section || !sticky) return

    imageRefs.current = imageRefs.current.slice(0, SLIDE_COUNT)

    const ctx = gsap.context(() => {
      imageRefs.current.forEach((image, i) => {
        gsap.set(image, {
          x: '-105%',
          autoAlpha: 0,
          zIndex: 10 + i,
        })
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB_SMOOTH,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(
              SLIDE_COUNT - 1,
              Math.floor(self.progress * SLIDE_COUNT),
            )
            setActiveIndex(idx)
          },
        },
      })

      artAssetContent.scrollImages.forEach((_, i) => {
        const image = imageRefs.current[i]
        const prev = i > 0 ? imageRefs.current[i - 1] : null
        const start = i * SLIDE_SCROLL

        tl.fromTo(
          image,
          { x: '-105%', autoAlpha: 0, scale: 0.98 },
          {
            x: '0%',
            autoAlpha: 1,
            scale: 1,
            duration: SLIDE_DURATION,
            ease: 'none',
            zIndex: 20 + i,
          },
          start,
        )

        if (prev) {
          tl.to(
            prev,
            {
              x: '105%',
              autoAlpha: 0,
              scale: 0.98,
              duration: SLIDE_DURATION,
              ease: 'none',
            },
            start,
          )
        }
      })
    }, section)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      ctx.revert()
    }
  }, [])

  const { headline, headlineAccent, intro, tags, featuredImage, scrollImages } =
    artAssetContent

  return (
    <section
      id="art-assets"
      ref={sectionRef}
      className="relative bg-[#050505] text-white"
      style={{ height: `${SLIDE_COUNT * SLIDE_SCROLL * 100}vh` }}
    >
      <div ref={stickyRef} className="sticky top-0 h-svh w-full overflow-hidden">
        <div className="relative flex h-full flex-col lg:flex-row">
          <div className="relative order-2 h-[42vh] w-full shrink-0 overflow-hidden bg-[#050505] lg:order-1 lg:h-full lg:w-1/2">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_30%_50%,rgba(47,191,74,0.08),transparent_70%)]" />

            <div className="absolute inset-0 z-[2] flex items-center justify-center px-5 sm:px-8 lg:px-10">
              {scrollImages.map((item, i) => (
                <figure
                  key={item.id}
                  ref={(el) => {
                    imageRefs.current[i] = el
                  }}
                  className="absolute h-[min(34vh,280px)] w-[min(88vw,22rem)] will-change-transform sm:h-[min(36vh,300px)] sm:w-[min(72vw,26rem)] lg:h-[min(68vh,520px)] lg:w-[min(40vw,34rem)]"
                  style={{ transform: 'translate3d(-105%, 0, 0)', opacity: 0 }}
                >
                  <div className="absolute inset-0 rounded-xl ring-1 ring-[#7cff6b]/25 lg:rounded-2xl" />
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-full w-full rounded-xl bg-[#0a0a0a] object-cover object-center lg:rounded-2xl"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                </figure>
              ))}
            </div>

            <div className="absolute bottom-4 left-1/2 z-[5] flex -translate-x-1/2 gap-2 lg:bottom-6">
              {scrollImages.map((item, i) => (
                <span
                  key={item.id}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ease-out ${
                    activeIndex === i ? 'scale-125 bg-[#7cff6b]' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative order-1 flex h-[58vh] w-full flex-col items-center justify-center border-b border-white/10 bg-[#121212] px-5 py-6 sm:px-8 sm:py-8 lg:order-2 lg:h-full lg:w-1/2 lg:border-b-0 lg:border-l">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_42%,rgba(47,191,74,0.06),transparent_72%)]" />

            <div className="relative z-[1] flex max-w-md flex-col items-center text-center">
              <h2 className="gallery-serif text-[clamp(1.75rem,5vw,3rem)] leading-[0.95] font-semibold tracking-tight text-white">
                {headline}
                <br />
                {headlineAccent}
              </h2>

              <div className="relative mt-5 w-full max-w-[min(72vw,280px)] sm:mt-6 sm:max-w-[320px]">
                <div
                  className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border border-[#7cff6b]/15 bg-[#7cff6b]/[0.03]"
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-2xl bg-[#1a1a1a] ring-1 ring-[#7cff6b]/25">
                  <img
                    src={featuredImage}
                    alt="Featured 3D asset"
                    className="aspect-square w-full object-cover object-center"
                    draggable={false}
                  />
                </div>
              </div>

              <p className="mt-5 text-[12px] leading-relaxed text-white/60 sm:mt-6 sm:text-[13px]">
                {intro}
              </p>

              <p className="mt-4 text-[10px] tracking-[0.12em] text-white/35 sm:mt-5 sm:text-[11px]">
                {tags}
              </p>
            </div>

            <div className="absolute top-4 right-5 z-[5] text-[10px] tracking-[0.24em] text-white/40 uppercase sm:top-5 sm:right-8 lg:top-6 lg:right-10">
              {activeIndex + 1} / {SLIDE_COUNT}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden justify-center pb-4 text-[10px] tracking-[0.24em] text-white/30 uppercase lg:flex sm:pb-5 sm:text-[11px]">
          Scroll to explore assets
        </div>
      </div>
    </section>
  )
}

export default ArtAssetSection
