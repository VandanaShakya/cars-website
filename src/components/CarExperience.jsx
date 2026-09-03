import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  assembleProgress,
  resetCarExperienceProgress,
  verticalProgress,
} from '../scroll/carExperienceProgress'
import HeroScene from './hero/HeroScene'
import VerticalShowcaseText from './VerticalShowcaseText'

gsap.registerPlugin(ScrollTrigger)

const HERO_SCROLL_VH = 280
const VERTICAL_SCROLL_VH = 220
const TOTAL_SCROLL_VH = HERO_SCROLL_VH + VERTICAL_SCROLL_VH

const CarExperience = () => {
  const rootRef = useRef(null)
  const heroLeftTextRef = useRef(null)
  const heroRightTextRef = useRef(null)
  const verticalLeftTextRef = useRef(null)
  const verticalRightTextRef = useRef(null)
  const verticalTextWrapRef = useRef(null)
  const hintRef = useRef(null)

  useLayoutEffect(() => {
    resetCarExperienceProgress()

    const ctx = gsap.context(() => {
      gsap.set(heroLeftTextRef.current, { autoAlpha: 1, y: 0 })
      gsap.set(heroRightTextRef.current, { autoAlpha: 0, y: 8 })
      gsap.set(verticalTextWrapRef.current, { autoAlpha: 0 })
      gsap.set(verticalLeftTextRef.current, { autoAlpha: 0, y: 18 })
      gsap.set(verticalRightTextRef.current, { autoAlpha: 0, y: 18 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress

            if (p < 0.5) {
              hintRef.current.textContent =
                window.innerWidth >= 640
                  ? 'Scroll to assemble · Drag to turn'
                  : 'Swipe to assemble · Drag to turn'
            } else if (p < 0.65) {
              hintRef.current.textContent =
                window.innerWidth >= 640
                  ? 'Scroll to explore · Drag to turn'
                  : 'Swipe to explore · Drag to turn'
            } else {
              hintRef.current.textContent =
                window.innerWidth >= 640
                  ? 'Design revealed'
                  : 'Design revealed'
            }
          },  
        },
      })

      tl.to(assembleProgress, { value: 1, duration: 0.48, ease: 'none' }, 0)

      tl.to(
        heroLeftTextRef.current,
        { autoAlpha: 0, y: -12, duration: 0.12, ease: 'power2.in' },
        0.22, 
      )
      tl.to(
        heroRightTextRef.current,
        { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' },
        0.28,
      )
      tl.to(
        heroRightTextRef.current,
        { autoAlpha: 0, y: -10, duration: 0.1, ease: 'power2.in' },
        0.52,
      )

      tl.to(verticalProgress, { value: 0.35, duration: 0.15, ease: 'power2.inOut' }, 0.52)
      tl.to(verticalProgress, { value: 1, duration: 0.35, ease: 'power2.inOut' }, 0.67)

      tl.to(
        verticalTextWrapRef.current,
        { autoAlpha: 1, duration: 0.12, ease: 'power1.out' },
        0.72,
      )
      tl.to(
        verticalLeftTextRef.current,
        { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' },
        0.74,
      )
      tl.to(
        verticalRightTextRef.current,
        { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out' },
        0.78,
      )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={rootRef}
      className="relative bg-[#050505]"
      style={{ height: `${TOTAL_SCROLL_VH}vh` }}
    >
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <div className="absolute inset-0 z-[1]">
          <HeroScene />
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-between px-6 pb-16 sm:items-center sm:px-10 sm:pb-0 lg:px-16">
          <div
            ref={heroLeftTextRef}
            className="max-w-[16rem] text-left sm:max-w-[18rem] lg:max-w-[20rem]"
          >
            <p className="mb-2 text-[11px] tracking-[0.32em] text-white/45 uppercase">
              Škoda
            </p>
            <h1 className="hero-gradient-text text-5xl leading-none font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Superb
            </h1>
            <p className="mt-4 max-w-[15rem] text-sm leading-relaxed text-white/70 sm:text-[15px]">
              The flagship liftback. Quiet at speed, generous in space — built
              for the long road.
            </p>
          </div>

          <div
            ref={heroRightTextRef}
            className="max-w-[16rem] text-right opacity-0 sm:max-w-[18rem] lg:max-w-[20rem]"
          >
            <p className="mb-2 text-[11px] tracking-[0.32em] text-white/45 uppercase">
              Finished body
            </p>
            <h2 className="text-5xl leading-none font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              L&amp;K
            </h2>
            <p className="mt-4 ml-auto max-w-[15rem] text-sm leading-relaxed text-white/70 sm:text-[15px]">
              From chassis skeleton to rally-green panels. A composed drive,
              revealed roof to road.
            </p>
          </div>
        </div>

        <div ref={verticalTextWrapRef} className="opacity-0">
          <VerticalShowcaseText
            leftRef={verticalLeftTextRef}
            rightRef={verticalRightTextRef}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center pb-5 text-[11px] tracking-[0.28em] text-white/35 uppercase">
          <span ref={hintRef}>Scroll to assemble · Drag to turn</span>
        </div>
      </div>

      <section
        id="hero"
        aria-label="Hero"
        className="pointer-events-none absolute top-0 h-[280vh] w-full"
      />
      <section
        id="vertical-showcase"
        aria-label="Design showcase"
        className="pointer-events-none absolute top-[280vh] h-[220vh] w-full"
      />
    </div>
  )
}

export default CarExperience
