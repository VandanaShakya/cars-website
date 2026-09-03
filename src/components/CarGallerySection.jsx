import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gallerySlides } from '../data/gallerySlides'

gsap.registerPlugin(ScrollTrigger)

const SLIDE_COUNT = gallerySlides.length
const SLIDE_SCROLL = 0.92
const SCRUB_SMOOTH = 1.35
const SWEEP_DURATION = 0.88

const GallerySlideText = forwardRef(function GallerySlideText({ slide, index }, ref) {
  return (
    <div
      ref={ref}
      className="absolute inset-0 flex flex-col justify-center"
      aria-hidden={index !== 0}
    >
      <p className="mb-3 text-[11px] tracking-[0.28em] text-white/45 uppercase sm:mb-4">
        Škoda · {slide.subtitle}
      </p>
      <h2 className="gallery-serif hero-gradient-text text-[clamp(2.75rem,9vw,6.5rem)] leading-[0.92] font-semibold tracking-tight">
        {slide.title}
      </h2>

      <div className="mt-8 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 text-[11px] sm:mt-10 sm:grid-cols-3 sm:gap-x-8 sm:text-[12px] lg:mt-12">
        <div>
          <p className="mb-1 tracking-[0.18em] text-white/40 uppercase">Body</p>
          <p className="text-white/75">{slide.specs.body}</p>
        </div>
        <div>
          <p className="mb-1 tracking-[0.18em] text-white/40 uppercase">Power</p>
          <p className="text-white/75">{slide.specs.power}</p>
        </div>
        <div>
          <p className="mb-1 tracking-[0.18em] text-white/40 uppercase">Drive</p>
          <p className="text-white/75">{slide.specs.drive}</p>
        </div>
        <div>
          <p className="mb-1 tracking-[0.18em] text-white/40 uppercase">Range</p>
          <p className="text-white/75">{slide.specs.range}</p>
        </div>
        <div>
          <p className="mb-1 tracking-[0.18em] text-white/40 uppercase">Seats</p>
          <p className="text-white/75">{slide.specs.rooms}</p>
        </div>
        <div>
          <p className="mb-1 tracking-[0.18em] text-white/40 uppercase">Boot</p>
          <p className="text-white/75">{slide.specs.bathrooms}</p>
        </div>
      </div>

      <div className="mt-6 hidden max-w-md flex-wrap gap-2 sm:flex lg:mt-8">
        {slide.amenities.map((item) => (
          <span
            key={item}
            className="border border-[#7cff6b]/20 px-2.5 py-1 text-[10px] tracking-[0.14em] text-[#7cff6b]/70 uppercase"
          >
            {item}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4 sm:mt-8">
        <span className="inline-flex items-center gap-2 border border-[#7cff6b]/25 px-3 py-1.5 text-[10px] tracking-[0.16em] text-white/70 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7cff6b]" />
          {slide.status}
        </span>
        <span className="text-[11px] tracking-[0.14em] text-[#7cff6b]/80 uppercase underline underline-offset-4">
          More info
        </span>
      </div>
    </div>
  )
})

function getSweepBounds(stickyEl, imageEl) {
  const viewW = stickyEl?.offsetWidth ?? window.innerWidth
  const imageW = imageEl?.offsetWidth ?? viewW * 0.42
  return {
    startX: viewW + 24,
    endX: -(imageW + viewW * 0.12),
  }
}

function getSlideVertical(index, stickyEl) {
  const viewH = stickyEl?.offsetHeight ?? window.innerHeight
  const isUpper = index % 2 === 1

  if (isUpper) {
    const upperY = viewH < 768 ? -64 : viewH < 1024 ? -96 : -128
    return { y: upperY, enterY: upperY - 32 }
  }

  const lowerY = viewH < 768 ? 44 : viewH < 1024 ? 68 : 92
  return { y: lowerY, enterY: lowerY + 28 }
}

const CarGallerySection = () => {
  const sectionRef = useRef(null)
  const stickyRef = useRef(null)
  const textRefs = useRef([])
  const imageRefs = useRef([])
  const iconRefs = useRef([])
  const dotRefs = useRef([])
  const scrollTriggerRef = useRef(null)
  const expandedIndexRef = useRef(null)
  const activeIndexRef = useRef(0)
  const scrollProgressRef = useRef(0)
  const scrollYRef = useRef(0)
  const timelineRef = useRef(null)

  const [activeIndex, setActiveIndex] = useState(0)
  const [expandedIndex, setExpandedIndex] = useState(null)
  const [, setHoveredIndex] = useState(null)

  const showIcon = useCallback((index, visible) => {
    const icon = iconRefs.current[index]
    if (!icon) return
    gsap.to(icon, {
      autoAlpha: visible ? 1 : 0,
      scale: visible ? 1 : 0.85,
      duration: 0.28,
      ease: 'power2.out',
    })
  }, [])

  const restoreGalleryLayout = useCallback(() => {
    const progress = scrollProgressRef.current

    imageRefs.current.forEach((img) => {
      if (!img) return
      gsap.set(img, {
        clearProps:
          'transform,top,left,right,bottom,width,height,maxWidth,margin,padding,zIndex,position',
      })
    })

    const st = scrollTriggerRef.current
    const tl = timelineRef.current

    st?.enable(false)
    if (tl) tl.progress(progress, false)
    st?.update()
    ScrollTrigger.update()

    const idx = Math.min(SLIDE_COUNT - 1, Math.floor(progress * SLIDE_COUNT))
    activeIndexRef.current = idx
    setActiveIndex(idx)
  }, [])

  const lockScroll = useCallback(() => {
    scrollYRef.current = window.scrollY
    if (scrollTriggerRef.current) {
      scrollProgressRef.current = scrollTriggerRef.current.progress
      scrollTriggerRef.current.disable(false)
    }
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollYRef.current}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.width = '100%'
    document.body.style.overflow = 'hidden'
  }, [])

  const unlockScroll = useCallback(() => {
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.right = ''
    document.body.style.width = ''
    document.body.style.overflow = ''
    window.scrollTo(0, scrollYRef.current)
    restoreGalleryLayout()
  }, [restoreGalleryLayout])

  const expandImage = useCallback(
    (index) => {
      const el = imageRefs.current[index]
      if (!el || expandedIndexRef.current !== null) return
      if (index !== activeIndexRef.current) return

      const opacity = gsap.getProperty(el, 'opacity')
      if (opacity < 0.35) return

      expandedIndexRef.current = index
      lockScroll()
      setExpandedIndex(index)
    },
    [lockScroll],
  )

  const collapseImage = useCallback(
    (index) => {
      if (expandedIndexRef.current !== index) return

      showIcon(index, false)

      expandedIndexRef.current = null
      setExpandedIndex(null)

      requestAnimationFrame(() => {
        unlockScroll()
      })
    },
    [showIcon, unlockScroll],
  )

  const handleMinusClick = useCallback(
    (e, index) => {
      e.stopPropagation()
      collapseImage(index)
    },
    [collapseImage],
  )

  useLayoutEffect(() => {
    iconRefs.current.forEach((icon) => {
      if (icon) gsap.set(icon, { autoAlpha: 0, scale: 0.85 })
    })
  }, [])

  useLayoutEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  useLayoutEffect(() => {
    if (expandedIndex !== null) {
      showIcon(expandedIndex, true)
    }
  }, [expandedIndex, showIcon])

  useLayoutEffect(() => {
    const section = sectionRef.current
    const sticky = stickyRef.current
    if (!section || !sticky) return

    textRefs.current = textRefs.current.slice(0, SLIDE_COUNT)
    imageRefs.current = imageRefs.current.slice(0, SLIDE_COUNT)

    const ctx = gsap.context(() => {
      gsap.set(textRefs.current[0], { autoAlpha: 1, y: 0 })
      gsap.set(textRefs.current.slice(1), { autoAlpha: 0, y: 22 })

      imageRefs.current.forEach((image, i) => {
        const { startX } = getSweepBounds(sticky, image)
        gsap.set(image, {
          x: startX,
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
            if (expandedIndexRef.current !== null) return
            const idx = Math.min(
              SLIDE_COUNT - 1,
              Math.floor(self.progress * SLIDE_COUNT),
            )
            setActiveIndex(idx)
          },
        },
      })

      scrollTriggerRef.current = tl.scrollTrigger
      timelineRef.current = tl

      gallerySlides.forEach((_, i) => {
        const text = textRefs.current[i]
        const image = imageRefs.current[i]
        const prevText = i > 0 ? textRefs.current[i - 1] : null
        const prevImage = i > 0 ? imageRefs.current[i - 1] : null
        const { y: yOffset, enterY } = getSlideVertical(i, sticky)
        const start = i * SLIDE_SCROLL

        tl.fromTo(
          image,
          {
            x: () => getSweepBounds(sticky, image).startX,
            y: enterY,
            autoAlpha: 0,
            scale: 0.97,
            zIndex: 20 + i,
          },
          {
            x: () => getSweepBounds(sticky, image).endX,
            y: yOffset,
            scale: 1,
            zIndex: 40 + i,
            duration: SWEEP_DURATION,
            ease: 'none',
          },
          start,
        )

        tl.to(
          image,
          { autoAlpha: 1, duration: 0.18, ease: 'power1.out' },
          start,
        )

        tl.to(
          image,
          { autoAlpha: 0, scale: 0.98, duration: 0.2, ease: 'power1.in' },
          start + SWEEP_DURATION - 0.2,
        )

        if (prevText) {
          tl.to(
            prevText,
            { autoAlpha: 0, y: -18, duration: 0.28, ease: 'power2.inOut' },
            start + 0.28,
          )
        }
        if (i > 0) {
          tl.fromTo(
            text,
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.inOut' },
            start + 0.28,
          )
        }

        if (prevImage) {
          tl.to(
            prevImage,
            { autoAlpha: 0, scale: 0.96, duration: 0.28, ease: 'power2.inOut' },
            start + 0.1,
          )
        }
      })
    }, section)

    const onResize = () => ScrollTrigger.refresh()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      scrollTriggerRef.current = null
      timelineRef.current = null
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      ctx.revert()
    }
  }, [])

  return (
    <section
      id="design"
      ref={sectionRef}
      className="relative bg-[#050505] text-white"
      style={{ height: `${SLIDE_COUNT * SLIDE_SCROLL * 100}vh` }}
    >
      {expandedIndex !== null ? (
        <figure className="fixed inset-0 z-[500] h-svh w-screen bg-black">
          <img
            src={gallerySlides[expandedIndex].image}
            alt={`Škoda ${gallerySlides[expandedIndex].title}`}
            className="h-full w-full object-cover object-center"
            draggable={false}
          />
          <span
            ref={(el) => {
              iconRefs.current[expandedIndex] = el
            }}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
          >
            <button
              type="button"
              onClick={(e) => handleMinusClick(e, expandedIndex)}
              className="pointer-events-auto flex h-14 w-14 cursor-pointer items-center justify-center border border-[#7cff6b]/50 bg-[#050505]/60 text-3xl font-light text-[#7cff6b] backdrop-blur-sm transition-colors hover:border-[#7cff6b] hover:bg-[#050505]/80"
              aria-label="Close image"
            >
              −
            </button>
          </span>
        </figure>
      ) : null}

      <div ref={stickyRef} className="sticky top-0 h-svh w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_50%,rgba(47,191,74,0.08),transparent_70%)]" />

        <div className="absolute inset-0 z-[2]">
          {gallerySlides.map((slide, i) => {
            const canInteract = expandedIndex === null && i === activeIndex

            return (
              <figure
                key={slide.id}
                ref={(el) => {
                  imageRefs.current[i] = el
                }}
                role="button"
                tabIndex={canInteract ? 0 : -1}
                aria-label={`Expand Škoda ${slide.title} image`}
                onClick={() => {
                  if (canInteract) expandImage(i)
                }}
                onMouseEnter={() => {
                  if (expandedIndexRef.current !== null) return
                  setHoveredIndex(i)
                  showIcon(i, true)
                }}
                onMouseLeave={() => {
                  if (expandedIndexRef.current !== null) return
                  setHoveredIndex(null)
                  showIcon(i, false)
                }}
                className={`absolute top-1/2 left-0 h-[38vh] w-[min(88vw,22rem)] -translate-y-1/2 transform-gpu will-change-[transform,opacity] sm:h-[44vh] sm:w-[min(72vw,26rem)] lg:h-[min(72vh,36rem)] lg:w-[min(46vw,34rem)] ${
                  canInteract ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'
                }`}
              >
                <div className="absolute inset-0 ring-1 ring-[#7cff6b]/25" />
                <img
                  src={slide.image}
                  alt={`Škoda ${slide.title}`}
                  className="h-full w-full bg-[#0a0a0a] object-cover object-center"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />

                <span
                  ref={(el) => {
                    iconRefs.current[i] = el
                  }}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  aria-hidden
                >
                  <span className="flex h-14 w-14 items-center justify-center border border-[#7cff6b]/50 bg-[#050505]/60 text-3xl font-light text-[#7cff6b] backdrop-blur-sm">
                    +
                  </span>
                </span>
              </figure>
            )
          })}
        </div>

        <div
          className={`relative mx-auto flex h-full w-full max-w-[1400px] items-center px-5 py-16 transition-opacity duration-300 sm:px-8 sm:py-20 lg:px-12 ${
            expandedIndex !== null ? 'pointer-events-none opacity-0' : ''
          }`}
        >
          <div className="absolute top-16 left-5 z-[5] text-[11px] tracking-[0.24em] text-white/40 uppercase sm:left-8 sm:top-20 lg:left-12">
            {activeIndex + 1} / {SLIDE_COUNT}
          </div>

          <div className="absolute top-1/2 left-4 z-[5] hidden -translate-y-1/2 flex-col gap-3 lg:flex xl:left-6">
            {gallerySlides.map((slide, i) => (
              <button
                key={slide.id}
                ref={(el) => {
                  dotRefs.current[i] = el
                }}
                type="button"
                aria-label={`Slide ${i + 1}: ${slide.title}`}
                className={`h-2 w-2 rounded-full transition-all duration-500 ease-out ${
                  activeIndex === i
                    ? 'scale-125 bg-[#7cff6b]'
                    : 'bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          <div className="relative z-[1] w-full lg:w-[58%] lg:pr-8 xl:w-[55%]">
            <div className="relative min-h-[260px] sm:min-h-[300px] lg:min-h-[340px]">
              {gallerySlides.map((slide, i) => (
                <GallerySlideText
                  key={slide.id}
                  ref={(el) => {
                    textRefs.current[i] = el
                  }}
                  slide={slide}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className={`absolute bottom-6 left-1/2 z-[5] flex -translate-x-1/2 gap-2 lg:hidden ${
            expandedIndex !== null ? 'opacity-0' : ''
          }`}
        >
          {gallerySlides.map((slide, i) => (
            <span
              key={slide.id}
              className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ease-out ${
                activeIndex === i ? 'bg-[#7cff6b]' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default CarGallerySection