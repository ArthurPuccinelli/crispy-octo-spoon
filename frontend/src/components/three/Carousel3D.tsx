"use client"

import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Image, ScrollControls, useScroll, useTexture } from '@react-three/drei'
import { easing } from 'maath'
import './Util'

type CarouselTheme = {
    images?: string[]
    accentColor?: string
    gradientFrom?: string
    gradientTo?: string
    hoverScale?: number
    bendRadius?: number
    zoom?: { hovered: number; idle: number }
}

function Rig(props: any) {
    const ref = useRef<THREE.Group>(null!)
    const scroll = useScroll()
    useFrame((state, delta) => {
        if (!ref.current) return
        ref.current.rotation.y = -scroll.offset * (Math.PI * 2)
        // @ts-ignore optional: nem todos os managers expõem update
        state.events?.update?.()
        easing.damp3(state.camera.position as unknown as THREE.Vector3, [-state.pointer.x * 2, state.pointer.y + 1.5, 10] as any, 0.3, delta)
        state.camera.lookAt(0, 0, 0)
    })
    return <group ref={ref} {...props} />
}

function Carousel({ radius = 1.4, count = 8, theme }: { radius?: number; count?: number; theme: CarouselTheme }) {
    const imgs = theme.images && theme.images.length > 0 ? theme.images : Array.from({ length: 10 }, (_, i) => `/img${i + 1}_.jpg`)
    return (
        <>
            {Array.from({ length: count }, (_, i) => (
                <Card
                    key={i}
                    url={imgs[i % imgs.length]}
                    theme={theme}
                    position={[Math.sin((i / count) * Math.PI * 2) * radius, 0, Math.cos((i / count) * Math.PI * 2) * radius] as any}
                    rotation={[0, Math.PI + (i / count) * Math.PI * 2, 0] as any}
                />
            ))}
        </>
    )
}

function AccentFrame({ color }: { color: string }) {
    // Moldura levemente maior atrás do card para reforçar identidade visual
    return (
        <group position={[0, 0, -0.01]}>
            {/* @ts-ignore - provided via extend in Util.ts */}
            <bentPlaneGeometry args={[0.1, 1.05, 1.05, 20, 20]} />
            {/* plane via mesh + basic material com cor de acento */}
            <mesh>
                {/* @ts-ignore - provided via extend in Util.ts */}
                <bentPlaneGeometry args={[0.1, 1.05, 1.05, 20, 20]} />
                <meshBasicMaterial color={color} transparent opacity={0.15} />
            </mesh>
        </group>
    )
}

function Card({ url, theme, ...props }: { url: string; theme: CarouselTheme } & any) {
    const ref = useRef<any>(null)
    const [hovered, setHovered] = useState(false)
    const pointerOver = (e: any) => {
        e.stopPropagation()
        setHovered(true)
    }
    const pointerOut = () => setHovered(false)
    useFrame((_, delta) => {
        if (!ref.current) return
        const hoverScale = theme.hoverScale ?? 1.15
        const bend = hovered ? (theme.bendRadius ?? 0.25) : 0.1
        const zoom = hovered ? (theme.zoom?.hovered ?? 1) : (theme.zoom?.idle ?? 1.5)
        easing.damp3(ref.current.scale as any, hovered ? hoverScale : 1, 0.1, delta)
        easing.damp(ref.current.material as any, 'radius', bend, 0.2, delta)
        easing.damp(ref.current.material as any, 'zoom', zoom, 0.2, delta)
    })
    return (
        <group {...props}>
            <AccentFrame color={theme.accentColor ?? '#10b981'} />
            <Image ref={ref} url={url} transparent side={THREE.DoubleSide} onPointerOver={pointerOver} onPointerOut={pointerOut}>
                {/* @ts-ignore - provided via extend in Util.ts */}
                <bentPlaneGeometry args={[0.1, 1, 1, 20, 20]} />
            </Image>
        </group>
    )
}

function Banner({ colorFrom, colorTo, ...props }: { colorFrom?: string; colorTo?: string } & any) {
    const ref = useRef<any>(null)
    const texture = useTexture('/work_.png')
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    const scroll = useScroll()
    useFrame((_, delta) => {
        if (!ref.current) return
        ref.current.material.time.value += Math.abs(scroll.delta) * 4
        ref.current.material.map.offset.x += delta / 2
    })
    return (
        <mesh ref={ref} {...props}>
            <cylinderGeometry args={[1.6, 1.6, 0.14, 128, 16, true]} />
            {/* @ts-ignore - provided via extend in Util.ts */}
            <meshSineMaterial map={texture} map-anisotropy={16} map-repeat={[30, 1]} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
    )
}

export default function Carousel3D({ theme }: { theme?: CarouselTheme }) {
    const t: CarouselTheme = {
        accentColor: theme?.accentColor ?? '#14b8a6',
        gradientFrom: theme?.gradientFrom ?? '#14b8a6',
        gradientTo: theme?.gradientTo ?? '#06b6d4',
        hoverScale: theme?.hoverScale ?? 1.12,
        bendRadius: theme?.bendRadius ?? 0.22,
        zoom: theme?.zoom ?? { hovered: 1, idle: 1.45 },
        images: theme?.images
    }
    return (
        <Canvas camera={{ position: [0, 0, 100], fov: 15 }}>
            {/* @ts-ignore three-stdlib fog jsx */}
            <fog attach="fog" args={["#a79", 8.5, 12]} />
            <ScrollControls pages={4} infinite>
                <Rig rotation={[0, 0, 0.15]}>
                    <Carousel theme={t} />
                </Rig>
                <Banner colorFrom={t.gradientFrom} colorTo={t.gradientTo} position={[0, -0.15, 0]} />
            </ScrollControls>
            <Environment preset="dawn" background blur={0.5} />
        </Canvas>
    )
}


