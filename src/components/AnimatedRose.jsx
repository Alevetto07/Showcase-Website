import React, { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedRose({ provideHandlers }) {
  // Load animated rose model
  const groupRef = useRef() // pivot group we rotate
  const modelRef = useRef() // actual loaded model
  const gltf = useGLTF('/models/blue_flower_animated.glb')
  const { actions, clips } = useAnimations(gltf.animations, groupRef)
  const { camera } = useThree()
  const progressRef = useRef(0) // 0..1 scroll-controlled animation progress
  const orbitAngleRef = useRef(0)
  const durationRef = useRef(1) // seconds; set after clips load
  const actionRef = useRef(null)
  const isDraggingRef = useRef(false)
  const lastPointerXRef = useRef(0)
  const bloomVelRef = useRef(0) // inertia for bloom progress (kept for minor smoothing)
  const orbitVelRef = useRef(0) // inertia for camera orbit (disabled by scroll)
  const rotationVelRef = useRef(0) // inertia for flower rotation
  const targetProgressRef = useRef(0) // follow page scroll progress with smoothing
  const baseRotationYRef = useRef(null) // starting rotation for clamping

  useEffect(() => {
    // Center model so rotation pivots around the flower (model center), not stem base
    if (gltf && gltf.scene && modelRef.current === null) {
      // no-op safeguard
    }
    if (gltf && gltf.scene) {
      const box = new THREE.Box3().setFromObject(gltf.scene)
      const center = new THREE.Vector3()
      box.getCenter(center)
      gltf.scene.position.sub(center) // recenter model around origin
    }

    // Pick the first animation if available
    const firstClip = clips && clips.length > 0 ? clips[0] : null
    if (firstClip && actions) {
      const action = actions[firstClip.name]
      if (action) {
        action.clampWhenFinished = true
        action.setLoop(THREE.LoopOnce, 1)
        action.play()
        action.paused = true // we will scrub time manually via progress
        actionRef.current = action
        durationRef.current = firstClip.duration
      }
    }
    // Ensure initial facing: rotate 180 degrees + 10° so it faces slightly to the right
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.PI + 0.1745329252
      baseRotationYRef.current = groupRef.current.rotation.y
    }
  }, [actions, clips])

  useFrame((state) => {
    // Scrub animation time from progress
    if (actionRef.current) {
      // Smoothly follow scroll position without overshoot (exponential smoothing)
      const diff = targetProgressRef.current - progressRef.current
      progressRef.current = THREE.MathUtils.clamp(progressRef.current + diff * 0.12, 0, 1)
      // Keep only the last half of the clip: map 0..1 -> 0.5..1.0
      const mapped = 0.5 + 0.5 * progressRef.current
      actionRef.current.time = mapped * durationRef.current
      actionRef.current._updateTime(0) // force internal update without advancing time
    }

    // Camera orbit (kept stable unless changed elsewhere)
    orbitAngleRef.current += orbitVelRef.current
    orbitVelRef.current *= 0.8
    const r = 2.2 // slightly closer zoom
    const a = orbitAngleRef.current
    camera.position.x = Math.cos(a) * r
    camera.position.z = Math.sin(a) * r
    camera.lookAt(0, 0, 0)

    // Apply inertial rotation to the model
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationVelRef.current
      rotationVelRef.current *= 0.92 // damping

      // Elastic bounds within ±30° from base
      const base = baseRotationYRef.current ?? 0
      const limit = Math.PI / 6 // 30 degrees
      const min = base - limit
      const max = base + limit
      const rot = groupRef.current.rotation.y
      if (rot < min) {
        const overflow = min - rot
        // Ease back inside: allow small overshoot factor then reduce
        groupRef.current.rotation.y = min - overflow * 0.3
        // Kill negative velocity, keep positive but damped
        rotationVelRef.current = Math.max(rotationVelRef.current, 0) * 0.3
      } else if (rot > max) {
        const overflow = rot - max
        groupRef.current.rotation.y = max + overflow * 0.3
        rotationVelRef.current = Math.min(rotationVelRef.current, 0) * 0.3
      }
    }
  })

  // Expose global handlers
  useEffect(() => {
    if (!provideHandlers) return
    const api = {
      onWheel: (_e) => {
        // No direct wheel control; progress follows scroll position via onScrollProgress
      },
      onScrollProgress: (p) => {
        // Set target; frame loop eases toward this value
        targetProgressRef.current = THREE.MathUtils.clamp(p, 0, 1)
      },
      onDown: (e) => {
        isDraggingRef.current = true
        lastPointerXRef.current = e.clientX
      },
      onUp: () => {
        isDraggingRef.current = false
      },
      onMove: (e) => {
        if (!isDraggingRef.current) return
        const dx = e.clientX - lastPointerXRef.current
        lastPointerXRef.current = e.clientX
        rotationVelRef.current += dx * 0.00012
      }
    }
    provideHandlers(api)
  }, [provideHandlers])

  return (
    <group ref={groupRef} position={[0, 0.35, 0]}>
      <primitive ref={modelRef} object={gltf.scene} position={[0, 0, 0]} scale={1.5} />
    </group>
  )
}

export default AnimatedRose
