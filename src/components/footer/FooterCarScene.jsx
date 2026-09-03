import {
  ContactShadows,
  Environment,
  Html,
  useGLTF,
  useProgress,
} from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'

const MODEL_PATH = '/models/sedan.glb'
const PAINT_COLOR = '#21c95a'
const BASE_ROT_Y = Math.PI * 0.5

const FOOTER_ARC = new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(-4.5, -1.1, 0.5),
  new THREE.Vector3(0, -0.3, -0.8),
  new THREE.Vector3(0, -1.2, 2.5),
)

const ARC_POINT_COUNT = 64
const ARC_POINTS = FOOTER_ARC.getPoints(ARC_POINT_COUNT)

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

function lerp(a, b, t) {
  return a + (b - a) * t
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function getArcEndState() {
  const end = FOOTER_ARC.getPoint(1)
  const tangent = FOOTER_ARC.getTangent(1)
  const carRotY = Math.atan2(tangent.x, tangent.z)
  return { carX: end.x, carY: end.y, carZ: end.z, carRotY }
}

function mapProgress(p) {
  const endState = getArcEndState()
  let cameraZ = 9
  let cameraY = 1.2
  let carX = 0
  let carY = 0
  let carZ = 0
  let carRotY = BASE_ROT_Y
  let arcReveal = 0
  let arcDrawT = 0
  let lookAtX = 0
  let lookAtY = 0.35
  let lookAtZ = 0

  if (p <= 0.2) {
    const t = p / 0.2
    cameraZ = lerp(10, 9, easeInOut(t))
    cameraY = lerp(1.5, 1.2, t)
    carX = 0
    carY = 0
    carZ = 0
    carRotY = BASE_ROT_Y
    arcReveal = 0
    arcDrawT = 0
  } else if (p <= 0.4) {
    const t = (p - 0.2) / 0.2
    cameraZ = lerp(9, 1.35, easeInOut(t))
    cameraY = lerp(1.2, 0.85, t)
    carX = 0
    carY = lerp(0, 0.08, t)
    carZ = 0
    carRotY = BASE_ROT_Y
    arcReveal = 0
    arcDrawT = 0
  } else if (p <= 0.75) {
    const t = (p - 0.4) / 0.35
    const arcT = easeInOut(t)

    arcReveal = Math.min(1, t * 1.4)
    arcDrawT = arcT

    const blendIn = Math.min(1, t * 3)
    const arcPoint = FOOTER_ARC.getPoint(arcT)
    const tangent = FOOTER_ARC.getTangent(arcT)
    const arcRotY = Math.atan2(tangent.x, tangent.z)

    const fromCenter = { x: 0, y: 0.08, z: 0, rotY: BASE_ROT_Y }
    carX = lerp(fromCenter.x, arcPoint.x, blendIn)
    carY = lerp(fromCenter.y, arcPoint.y, blendIn)
    carZ = lerp(fromCenter.z, arcPoint.z, blendIn)
    carRotY = lerp(fromCenter.rotY, arcRotY, blendIn)

    cameraZ = lerp(1.35, 3.2, arcT)
    cameraY = lerp(0.85, 1.0, arcT)
    lookAtX = carX
    lookAtY = carY + 0.35
    lookAtZ = carZ
  } else {
    const t = (p - 0.75) / 0.25
    arcReveal = 1
    arcDrawT = 1

    carX = endState.carX
    carY = endState.carY
    carZ = lerp(endState.carZ, endState.carZ + 0.35, easeInOut(t))
    carRotY = lerp(endState.carRotY, BASE_ROT_Y, easeInOut(t))

    cameraZ = lerp(3.2, 5.5, easeInOut(t))
    cameraY = lerp(1.0, 1.08, t)
    lookAtX = 0
    lookAtY = -0.2
    lookAtZ = 1.5
  }

  return {
    cameraZ,
    cameraY,
    carX,
    carY,
    carZ,
    carRotY,
    arcReveal,
    arcDrawT,
    lookAtX,
    lookAtY,
    lookAtZ,
  }
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

function FooterArcPath({ animProgress }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(ARC_POINTS.length * 3)
    ARC_POINTS.forEach((point, i) => {
      positions[i * 3] = point.x
      positions[i * 3 + 1] = point.y
      positions[i * 3 + 2] = point.z
    })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setDrawRange(0, 2)
    return geo
  }, [])

  const glowMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#7cff6b',
        transparent: true,
        opacity: 0,
      }),
    [],
  )

  const coreMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#b8ffb0',
        transparent: true,
        opacity: 0,
      }),
    [],
  )

  useFrame(() => {
    const { arcReveal, arcDrawT } = mapProgress(animProgress.current.value)
    const visibleCount = Math.max(2, Math.ceil(arcDrawT * (ARC_POINTS.length - 1)) + 1)

    geometry.setDrawRange(0, visibleCount)
    glowMaterial.opacity = arcReveal * 0.5
    coreMaterial.opacity = arcReveal * 0.85
  })

  return (
    <group>
      <line geometry={geometry} material={glowMaterial} />
      <line geometry={geometry} material={coreMaterial} />
    </group>
  )
}

function FooterCarModel({ animProgress }) {
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
    const { carX, carY, carZ, carRotY } = mapProgress(animProgress.current.value)
    groupRef.current.position.set(carX, carY, carZ)
    groupRef.current.rotation.y = carRotY
  })

  return (
    <group ref={groupRef}>
      <primitive object={car} />
    </group>
  )
}

function FooterCameraRig({ animProgress }) {
  const { camera } = useThree()
  const lookTarget = useRef(new THREE.Vector3())

  useFrame(() => {
    const state = mapProgress(animProgress.current.value)
    camera.position.z = state.cameraZ
    camera.position.y = state.cameraY
    camera.position.x = lerp(0, state.carX * 0.15, state.arcDrawT)

    lookTarget.current.set(state.lookAtX, state.lookAtY, state.lookAtZ)
    camera.lookAt(lookTarget.current)
    camera.updateProjectionMatrix()
  })

  return null
}

useGLTF.preload(MODEL_PATH)

const FooterCarScene = ({ animProgress }) => {
  return (
    <Canvas
      className="!h-full !w-full min-h-full min-w-full"
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.4, 9], fov: 38, near: 0.1, far: 50 }}
      style={{ width: '100%', height: '100%', display: 'block' }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.25} />
      <hemisphereLight args={['#c8d6e5', '#0c0c0c', 0.35]} />
      <spotLight
        position={[2, 8, 4]}
        angle={0.45}
        penumbra={0.55}
        intensity={2.2}
        color="#f2fff4"
        castShadow
      />
      <pointLight position={[-2, 3, 2]} intensity={1.2} color="#7cff6b" />

      <Suspense fallback={<SceneLoader />}>
        <Environment preset="city" environmentIntensity={0.35} />
        <FooterArcPath animProgress={animProgress} />
        <FooterCameraRig animProgress={animProgress} />
        <FooterCarModel animProgress={animProgress} />
      </Suspense>

      <ContactShadows
        position={[0, -1.1, 0]}
        opacity={0.45}
        scale={10}
        blur={2.6}
        far={4}
      />
    </Canvas>
  )
}

export default FooterCarScene
