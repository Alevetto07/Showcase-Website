import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const GlowShaderMaterial = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color(0xffffff) }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vUv = uv;
      vNormal = normal;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec3 color;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;

    void main() {
      vec2 uv = vUv;
      float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);

      // Create a subtle glow effect
      float glow = fresnel * 0.3 + 0.7;

      // Add some subtle animation to the glow
      glow += sin(time * 2.0 + vPosition.y * 10.0) * 0.1;

      gl_FragColor = vec4(color * glow, 0.9);
    }
  `
}

const ProceduralPetal = forwardRef(function ProceduralPetal({ position, onPointerOver, onPointerOut }, ref) {
  const meshRef = useRef()
  useImperativeHandle(ref, () => meshRef.current)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.5, 1, 32, 32)

    // Bend for rose-like curve
    const vertices = geo.attributes.position.array
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i]
      const y = vertices[i + 1]
      vertices[i + 1] += Math.sin(x * Math.PI) * 0.2 // Curve effect
    }
    geo.attributes.position.needsUpdate = true

    return geo
  }, [])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      ...GlowShaderMaterial,
      transparent: true,
      side: THREE.DoubleSide
    })
  }, [])

  useFrame((state) => {
    if (material.uniforms) {
      material.uniforms.time.value = state.clock.elapsedTime
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    />
  )
})

export default ProceduralPetal
