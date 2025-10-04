import React from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Rose({ position }) {
  // For now, we'll create a simple stem using basic geometries
  // In a real implementation, you would load a GLTF model here
  return (
    <group position={position}>
      {/* Simple stem representation */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 4, 8]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>

      {/* Simple rose center */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#fff5f5" />
      </mesh>

      {/* Simple leaves */}
      <mesh position={[0.5, -1, 0]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshStandardMaterial color="#1a4a0f" side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[-0.5, -1.5, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshStandardMaterial color="#1a4a0f" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default Rose
