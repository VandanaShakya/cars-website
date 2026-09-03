import { ContactShadows, Environment, Html, useProgress } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import CarModel from '../hero/CarModel'

function SceneLoader() {
  const { active, progress } = useProgress()
  if (!active) return null

  return (
    <Html center>
      <div className="rounded-full border border-[#7cff6b]/40 bg-black/70 px-4 py-2 text-xs tracking-[0.2em] text-[#7cff6b] uppercase">
        Model {Math.round(progress)}%
      </div>
    </Html>
  )
}

const DriveScene = ({ carDisplayProgress }) => {
  return (
    <Canvas
      className="h-full w-full touch-pan-y"
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [2.1, 1.05, 3.8], fov: 32, near: 0.1, far: 40 }}
      style={{ touchAction: 'pan-y' }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
      }}
      gl={{
        antialias: true,
        localClippingEnabled: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.28} />
      <hemisphereLight args={['#c8d6e5', '#0c0c0c', 0.35]} />
      <spotLight
        position={[4, 6, 3]}
        angle={0.42}
        penumbra={0.55}
        intensity={2}
        color="#f2fff4"
        castShadow
      />
      <pointLight position={[-3, 2, 2]} intensity={1.1} color="#7cff6b" />

      <Suspense fallback={<SceneLoader />}>
        <Environment preset="city" environmentIntensity={0.38} />
        <CarModel progress={carDisplayProgress} />
      </Suspense>

      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.4}
        scale={8}
        blur={2.4}
        far={3.5}
      />
    </Canvas>
  )
}

export default DriveScene
