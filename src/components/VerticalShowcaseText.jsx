const VerticalShowcaseText = ({ leftRef, rightRef }) => {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-5 opacity-0 sm:px-10 lg:px-16">
      <div
        ref={leftRef}
        className="max-w-[14rem] text-left sm:max-w-[16rem] lg:max-w-[18rem]"
      >
        <p className="mb-2 text-[11px] tracking-[0.32em] text-white/45 uppercase">
          Engineered
        </p>
        <h2 className="hero-gradient-text text-4xl leading-none font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Superb
        </h2>
        <p className="mt-4 max-w-[14rem] text-sm leading-relaxed text-white/70 sm:text-[15px]">
          204 PS, 4×4, and a liftback silhouette — flagship comfort for every
          kilometre.
        </p>
      </div>

      <div
        ref={rightRef}
        className="max-w-[14rem] text-right sm:max-w-[16rem] lg:max-w-[18rem]"
      >
        <p className="mb-2 text-[11px] tracking-[0.32em] text-white/45 uppercase">
          Laurin &amp; Klement
        </p>
        <h2 className="text-4xl leading-none font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          L&amp;K
        </h2>
        <p className="mt-4 ml-auto max-w-[14rem] text-sm leading-relaxed text-white/70 sm:text-[15px]">
          Matrix LED, virtual cockpit, and rally-green finish — luxury without
          compromise.
        </p>
      </div>
    </div>
  )
}

export default VerticalShowcaseText
