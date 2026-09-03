import { useCursor, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  assembleProgress,
  verticalLayout,
  verticalProgress,
} from '../../scroll/carExperienceProgress'

const MODEL_PATH = '/models/sedan.glb'
const WIRE_COLOR = '#7cff6b'
const PAINT_COLOR = '#21c95a'
const BASE_ROT_Y = Math.PI * 1.18
const PORTRAIT_ROT_Y = Math.PI * 0.5
const PORTRAIT_ROT_Z = Math.PI * 0.5
const PORTRAIT_SCALE = 0.72

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

function setClipping(root, plane) {
  if (!root) return
  root.traverse((child) => {
    if (!child.isMesh?.material) return
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach((mat) => {
      mat.clippingPlanes = plane ? [plane] : []
      mat.clipShadows = Boolean(plane)
      mat.needsUpdate = true
    })
  })
}

function buildWireframe(source) {
  const root = source.clone(true)
  const meshes = []
  root.traverse((child) => {
    if (child.isMesh) meshes.push(child)
  })

  meshes.forEach((mesh) => {
    const materialName = Array.isArray(mesh.material)
      ? mesh.material.map((mat) => mat?.name || '').join(' ')
      : mesh.material?.name || ''
    if (shouldHideBrandMesh(mesh.name || '', materialName)) {
      mesh.removeFromParent()
      return
    }
    const edges = new THREE.EdgesGeometry(mesh.geometry, 22)
    const lines = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({
        color: WIRE_COLOR,
        transparent: true,
        opacity: 0.88,
        depthWrite: false,
      }),
    )
    lines.position.copy(mesh.position)
    lines.quaternion.copy(mesh.quaternion)
    lines.scale.copy(mesh.scale)
    lines.raycast = () => {}
    mesh.parent.add(lines)
    mesh.removeFromParent()
  })

  return root
}

function buildPaint(source) {
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
        next.roughness = 0.26
        if ('clearcoat' in next) {
          next.clearcoat = 1
          next.clearcoatRoughness = 0.1
        }
        if ('envMapIntensity' in next) next.envMapIntensity = 1.15
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

const CarModel = () => {
  const { scene } = useGLTF(MODEL_PATH)
  const groupRef = useRef(null)
  const pivotRef = useRef(null)
  const wireRef = useRef(null)
  const paintRef = useRef(null)
  const scanRef = useRef(null)
  const bounds = useRef({ minY: 0, maxY: 1.2, ready: false })
  const clipReady = useRef(false)
  const wasVertical = useRef(false)
  const spin = useRef({ x: 0, y: 0 })
  const drag = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    pointerId: null,
  })
  const [grabbing, setGrabbing] = useState(false)
  const verticalActive = verticalProgress.value > 0.001
  useCursor(verticalActive ? false : grabbing, grabbing ? 'grabbing' : 'grab')

  const clipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    [],
  )
  const wireClipPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
    [],
  )
  const bboxHelper = useMemo(() => new THREE.Box3(), [])

  const { wire, paint } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const scale = 4.8 / Math.max(size.x, size.z, 0.001)

    const prepare = (root) => {
      root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale)
      root.scale.setScalar(scale)
      return root
    }

    return {
      wire: prepare(buildWireframe(scene)),
      paint: prepare(buildPaint(scene)),
    }
  }, [scene])

  useEffect(() => {
    wireRef.current = wire
    paintRef.current = paint
    clipReady.current = false
  }, [wire, paint])

  const onPointerDown = (event) => {
    if (verticalProgress.value > 0.001) return
    event.stopPropagation()
    const cx = event.nativeEvent?.clientX ?? event.clientX
    const cy = event.nativeEvent?.clientY ?? event.clientY
    drag.current.active = true
    drag.current.lastX = cx
    drag.current.lastY = cy
    drag.current.pointerId = event.pointerId
    setGrabbing(true)
  }

  const endDrag = () => {
    drag.current.active = false
    drag.current.pointerId = null
    setGrabbing(false)
  }

  useEffect(() => {
    const onWindowMove = (event) => {
      if (!drag.current.active) return
      const dx = event.clientX - drag.current.lastX
      const dy = event.clientY - drag.current.lastY
      drag.current.lastX = event.clientX
      drag.current.lastY = event.clientY
      spin.current.y += dx * 0.0085
      spin.current.x = THREE.MathUtils.clamp(
        spin.current.x + dy * 0.0048,
        -0.42,
        0.42,
      )
    }
    const onWindowUp = () => endDrag()
    window.addEventListener('pointermove', onWindowMove, { passive: true })
    window.addEventListener('pointerup', onWindowUp)
    window.addEventListener('pointercancel', onWindowUp)
    return () => {
      window.removeEventListener('pointermove', onWindowMove)
      window.removeEventListener('pointerup', onWindowUp)
      window.removeEventListener('pointercancel', onWindowUp)
    }
  }, [])

  useFrame((state, delta) => {
    if (!bounds.current.ready && pivotRef.current) {
      const box = new THREE.Box3().setFromObject(pivotRef.current)
      bounds.current.minY = box.min.y
      bounds.current.maxY = box.max.y
      bounds.current.ready = true
    }

    const vertical = verticalProgress.value
    const assemble = assembleProgress.value
    const inVerticalPhase = vertical > 0.001

    if (inVerticalPhase) {
      wasVertical.current = true
      if (wireRef.current) wireRef.current.visible = false
      if (scanRef.current) scanRef.current.visible = false
      setClipping(paintRef.current, null)
      setClipping(wireRef.current, null)
    } else {
      if (wireRef.current) wireRef.current.visible = true

      if (wasVertical.current) {
        clipReady.current = false
        wasVertical.current = false
      }

      if (!clipReady.current) {
        setClipping(paintRef.current, clipPlane)
        wireRef.current?.traverse((child) => {
          if (child.isLineSegments && child.material) {
            child.material.clippingPlanes = [wireClipPlane]
            child.material.needsUpdate = true
          }
        })
        clipReady.current = true
      }

      const t = assemble
      const y = THREE.MathUtils.lerp(
        bounds.current.maxY + 0.06,
        bounds.current.minY - 0.05,
        t,
      )
      clipPlane.constant = -y
      wireClipPlane.constant = y

      if (scanRef.current) {
        scanRef.current.position.y = y
        scanRef.current.visible = t > 0.03 && t < 0.97
        scanRef.current.material.opacity = 0.55 * (1 - Math.abs(t - 0.5) * 0.6)
      }
    }

    if (vertical > 0 || !drag.current.active) {
      spin.current.x = THREE.MathUtils.damp(spin.current.x, 0, 1.8, delta)
      spin.current.y = THREE.MathUtils.damp(spin.current.y, 0, 1.8, delta)
    }

    if (pivotRef.current && groupRef.current) {
      const heroRotY = BASE_ROT_Y + spin.current.y
      const heroRotX = spin.current.x

      pivotRef.current.rotation.order = 'YXZ'
      pivotRef.current.rotation.y = THREE.MathUtils.lerp(heroRotY, PORTRAIT_ROT_Y, vertical)
      pivotRef.current.rotation.x = THREE.MathUtils.lerp(heroRotX, 0, vertical)
      pivotRef.current.rotation.z = THREE.MathUtils.lerp(0, PORTRAIT_ROT_Z, vertical)

      const scale = THREE.MathUtils.lerp(1, PORTRAIT_SCALE, vertical)
      groupRef.current.scale.setScalar(scale)

      if (vertical > 0.05) {
        bboxHelper.setFromObject(groupRef.current)
        const size = bboxHelper.getSize(new THREE.Vector3())
        const center = bboxHelper.getCenter(new THREE.Vector3())
        verticalLayout.height = size.y
        verticalLayout.centerY = center.y

        const mobile = state.size.width < 768
        const offsetX = mobile ? 0.15 : 0.45
        groupRef.current.position.x = THREE.MathUtils.lerp(0, offsetX, vertical)
        groupRef.current.position.y = THREE.MathUtils.lerp(0, -center.y + size.y * 0.06, vertical)
        groupRef.current.position.z = 0
      } else {
        groupRef.current.position.set(0, 0, 0)
      }
    }
  })

  return (
    <group ref={groupRef} onPointerDown={onPointerDown}>
      <group ref={pivotRef}>
        <primitive object={wire} />
        <primitive object={paint} />
        <mesh ref={scanRef} rotation={[-Math.PI / 2, 0, 0]} visible={false} raycast={() => {}}>
          <planeGeometry args={[5.2, 2.4]} />
          <meshBasicMaterial
            color={WIRE_COLOR}
            transparent
            opacity={0.4}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  )
}

useGLTF.preload(MODEL_PATH)

export default CarModel
