import { ContactShadows, Environment, Grid, Html, useProgress } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { verticalLayout, verticalProgress } from '../../scroll/carExperienceProgress'
import CarModel from './CarModel'

function CameraRig() {
  const lookAt = useMemo(() => new THREE.Vector3(), [])
  const target = useMemo(() => new THREE.Vector3(), [])
  const portraitLookAt = useMemo(() => new THREE.Vector3(), [])
  const assembleLookAt = useMemo(() => new THREE.Vector3(0, 0.5, 0), [])

  useFrame((state) => {
    const vertical = verticalProgress.value
    const mobile = state.size.width < 768

    const assembleX = 0
    const assembleY = mobile ? 1.08 : 1.15
    const assembleZ = mobile ? 7.2 : 6.8
    const assembleFov = 34

    const carHeight = Math.max(verticalLayout.height, 2)
    const fovRad = THREE.MathUtils.degToRad(mobile ? 28 : 26)
    const fitDistance = (carHeight / 2 / Math.tan(fovRad / 2)) * 1.18

    const portraitX = fitDistance
    const portraitY = verticalLayout.centerY
    const portraitZ = mobile ? 0.35 : 0.55
    const portraitFov = mobile ? 28 : 26

    const tx = THREE.MathUtils.lerp(assembleX, portraitX, vertical)
    const ty = THREE.MathUtils.lerp(assembleY, portraitY, vertical)
    const tz = THREE.MathUtils.lerp(assembleZ, portraitZ, vertical)

    target.set(tx, ty, tz)
    state.camera.position.lerp(target, 0.12)

    portraitLookAt.set(0, verticalLayout.centerY - carHeight * 0.08, 0)
    lookAt.copy(assembleLookAt).lerp(portraitLookAt, vertical)
    state.camera.lookAt(lookAt)
    state.camera.lookAt(lookAt)

    if ('fov' in state.camera) {
      const nextFov = THREE.MathUtils.lerp(assembleFov, portraitFov, vertical)
      if (Math.abs(state.camera.fov - nextFov) > 0.01) {
        state.camera.fov = nextFov
        state.camera.updateProjectionMatrix()
      }
    }
  })

  return null
}

function GridFloor() {
  const groupRef = useMemo(() => ({ current: null }), [])

  useFrame(() => {
    if (!groupRef.current) return
    const vertical = verticalProgress.value
    groupRef.current.visible = vertical < 0.15
    groupRef.current.children.forEach((child) => {
      if (child.material) {
        child.material.opacity = THREE.MathUtils.lerp(1, 0, vertical * 4)
        child.material.transparent = vertical > 0
      }
    })
  })

  return (
    <group ref={(el) => { groupRef.current = el }}>
      <Grid
        position={[0, 0, 0]}
        args={[30, 30]}
        cellSize={0.5}
        cellThickness={0.55}
        cellColor="#16301c"
        sectionSize={2}
        sectionThickness={1.15}
        sectionColor="#2f6b3c"
        fadeDistance={16}
        fadeStrength={1.35}
        infiniteGrid
      />
    </group>
  )
}

function SceneFog() {
  const fogRef = useRef(null)

  useFrame((state) => {
    const vertical = verticalProgress.value
    if (!fogRef.current) return
    fogRef.current.near = THREE.MathUtils.lerp(9, 18, vertical)
    fogRef.current.far = THREE.MathUtils.lerp(22, 42, vertical)
  })

  return <fog ref={fogRef} attach="fog" args={['#050505', 9, 22]} />
}

function SceneLoader() {
  const { active, progress } = useProgress()
  if (!active) return null

  return (
    <Html center>
      <div className="rounded-full border border-[#7cff6b]/40 bg-black/70 px-4 py-2 text-xs tracking-[0.2em] text-[#7cff6b] uppercase">
        Chassis {Math.round(progress)}%
      </div>
    </Html>
  )
}

function VerticalShadows() {
  const groupRef = useRef(null)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.visible = verticalProgress.value < 0.2
    }
  })

  return (
    <group ref={groupRef}>
      <ContactShadows
        position={[0, 0.01, 0]}
        opacity={0.45}
        scale={12}
        blur={2.6}
        far={4}
      />
    </group>
  )
}

const HeroScene = () => {
  return (
    <Canvas
      className="h-full w-full touch-pan-y"
      shadows
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.15, 6.8], fov: 34, near: 0.1, far: 60 }}
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
      <color attach="background" args={['#050505']} />
      <SceneFog />
      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#c8d6e5', '#0c0c0c', 0.35]} />
      <spotLight
        position={[6, 8, 4]}
        angle={0.45}
        penumbra={0.6}
        intensity={2.1}
        color="#f2fff4"
        castShadow
      />
      <pointLight position={[-4, 2.4, -2]} intensity={1.4} color="#7cff6b" />
      <pointLight position={[3, 1.5, 4]} intensity={0.7} color="#6bffd9" />

      <Suspense fallback={<SceneLoader />}>
        <Environment preset="city" environmentIntensity={0.42} />
        <CarModel />
      </Suspense>

      <GridFloor />
      <VerticalShadows />
      <CameraRig />
    </Canvas>
  )
}

export default HeroScene
