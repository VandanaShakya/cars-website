import asset1 from '../assets/car1.jpg'
import asset2 from '../assets/car2.jpg'
import asset3 from '../assets/car3.jpg'
import featuredCar from '../assets/car4.jpg'

export const artAssetContent = {
  headline: '3D Art',
  headlineAccent: 'Asset Creation',
  intro:
    'I create high-quality, performance conscious 3D assets spanning a range of art styles for use in WebGL, WebAR, and game engines. From individual assets to full environments, my focus is on balancing visual fidelity with performance constraints across mobile and desktop devices.',
  tags: 'Maya / Blender / Substance Painter / Substance Designer /',
  featuredImage: featuredCar,
  scrollImages: [
    { id: 'asset-1', src: asset1, alt: '3D asset showcase one' },
    { id: 'asset-2', src: asset2, alt: '3D asset showcase two' },
    { id: 'asset-3', src: asset3, alt: '3D asset showcase three' },
  ],
}
