'use client'

import { Canvas } from '@react-three/fiber'
import { Environment, Float, Stars } from '@react-three/drei'
import React, { Suspense } from 'react'

function AnimatedBackgroundContent() {
    return (
        <>
            <Stars radius={100} depth={50} count={3000} factor={4} fade speed={0.6} />
            <Float speed={1} rotationIntensity={0.2} floatIntensity={0.4}>
                {/* Soft, subtle light volumes */}
                <mesh position={[0, 0, -8]}
                    scale={[8, 8, 1]}
                >
                    <planeGeometry args={[2, 2]} />
                    <meshBasicMaterial color={'#14b8a6'} transparent opacity={0.06} />
                </mesh>
                <mesh position={[3, 1, -7]} scale={[5, 5, 1]}>
                    <planeGeometry args={[2, 2]} />
                    <meshBasicMaterial color={'#06b6d4'} transparent opacity={0.05} />
                </mesh>
                <mesh position={[-3, -1, -6]} scale={[4, 4, 1]}>
                    <planeGeometry args={[2, 2]} />
                    <meshBasicMaterial color={'#10b981'} transparent opacity={0.05} />
                </mesh>
            </Float>
            <Environment preset="city" />
        </>
    )
}

export default function BackgroundScene() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <Canvas gl={{ antialias: true }} camera={{ position: [0, 0, 8], fov: 50 }}>
                <Suspense fallback={null}>
                    <AnimatedBackgroundContent />
                </Suspense>
            </Canvas>
        </div>
    )
}


