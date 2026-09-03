import Navbar from './components/Navbar'
import CarExperience from './components/CarExperience'
import DriveSection from './components/DriveSection'
import CarGallerySection from './components/CarGallerySection'
import ArtAssetSection from './components/ArtAssetSection'
import AboutSection from './components/AboutSection'
import ContactCtaSection from './components/ContactCtaSection'
import SiteFooter from './components/SiteFooter'

const App = () => {
  return (
    <div id="top" className="min-h-svh bg-[#050505]">
      <Navbar />
      <CarExperience />
      <DriveSection />
      <CarGallerySection />
      <ArtAssetSection />
      <AboutSection />
      <ContactCtaSection />
      <SiteFooter />
    </div>
  )
}

export default App
