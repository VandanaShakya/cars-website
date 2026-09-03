import { ContactShadows, Environment, Html, useGLTF, useProgress } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'

const MODEL_PATH = '/models/sedan.glb'
const PAINT_COLOR = '#21c95a'
const BASE_ROT_Y = Math.PI * 0.72

function isBodyMaterial(name = '') {
  return /body_color|body/i.test(name)
}

function isBrandAccent(name = '') {
  return /ferrari_yellow|dodgerblue|yellow_trim|blue/i.test(name)
}

function shouldHideBrandMesh(name = '', materialName = '') {
  const label = `${name} ${materialName}`.toLowerCase()
  return (
    /^(trim|yellow_trim|blue)$/.test(name) ||
    /ferrari|dodgerblue|ferrari_yellow|_0098_dodgerblue/.test(label)
  )
}

function buildPaintCar(source) {
  const root = source.clone(true)
  const toRemove = []

  root.traverse((child) => {
    if (!child.isMesh) return

    const materialName = Array.isArray(child.material)
      ? child.material.map((mat) => mat?.name || '').join(' ')
      : child.material?.name || ''

    if (shouldHideBrandMesh(child.name || '', materialName)) {
      toRemove.push(child)
      return
    }

    const original = child.material
    const materials = Array.isArray(original) ? original : [original]
    const painted = materials.map((mat) => {
      const next = mat.clone()
      const matLabel = `${next.name || ''} ${child.name || ''}`
      if (isBodyMaterial(matLabel)) {
        next.color = new THREE.Color(PAINT_COLOR)
        next.metalness = 0.72
        next.roughness = 0.28
        if ('clearcoat' in next) {
          next.clearcoat = 1
          next.clearcoatRoughness = 0.1
        }
      }
      if (isBrandAccent(matLabel)) {
        next.color = new THREE.Color('#111111')
      }
      return next
    })
    child.material = Array.isArray(original) ? painted : painted[0]
    child.castShadow = true
    child.receiveShadow = true
  })

  toRemove.forEach((mesh) => mesh.removeFromParent())
  return root
}

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

function AboutCarModel({ enterProgress }) {
  const { scene } = useGLTF(MODEL_PATH)
  const groupRef = useRef(null)

  const car = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = 2.2 / Math.max(size.x, size.z, 0.001)

    const root = buildPaintCar(scene)
    root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
    root.scale.setScalar(scale)
    return root
  }, [scene])

  useFrame(() => {
    if (!groupRef.current) return
    const t = enterProgress.current.value
    const enterEase = t < 0.78 ? t / 0.78 : 1
    const settleT = t < 0.78 ? 0 : (t - 0.78) / 0.22
    const enterRot = (1 - enterEase) * 0.35
    const settleRot = settleT * -0.04
    groupRef.current.rotation.y = BASE_ROT_Y + enterRot + settleRot
  })

  return (
    <group ref={groupRef}>
      <primitive object={car} />
    </group>
  )
}

useGLTF.preload(MODEL_PATH)

const AboutCarScene = ({ enterProgress }) => {
  return (
    <Canvas
      className="h-full w-full touch-pan-y"
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [3.2, 1.1, 3.4], fov: 34, near: 0.1, far: 40 }}
      style={{ touchAction: 'pan-y' }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <color attach="background" args={['#050505']} />
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
        <AboutCarModel enterProgress={enterProgress} />
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

export default AboutCarScene
