"use client"

import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Image, ScrollControls, Text, useScroll } from '@react-three/drei'
import { easing } from 'maath'
import './Util'

type CarouselTheme = {
    images?: string[]
    cards?: { image: string; title: string; subtitle?: string; color?: string }[]
    accentColor?: string
    gradientFrom?: string
    gradientTo?: string
    hoverScale?: number
    baseScale?: number
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

function Carousel({ radius = 1.4, count, theme }: { radius?: number; count?: number; theme: CarouselTheme }) {
    const imgs = theme.images && theme.images.length > 0 ? theme.images : Array.from({ length: 10 }, (_, i) => `/img${i + 1}_.jpg`)
    const fallbackCount = typeof count === 'number' && count > 0 ? count : imgs.length
    const cards: { image: string; title: string; subtitle?: string; color?: string }[] = theme.cards && theme.cards.length > 0
        ? theme.cards
        : Array.from({ length: fallbackCount }, (_, i) => ({ image: imgs[i % imgs.length], title: `Card ${i + 1}` }))
    const total = typeof count === 'number' && count > 0 ? count : cards.length
    return (
        <>
            {Array.from({ length: total } as { length: number }, (_, i) => (
                <Card
                    key={i}
                    url={cards[i % cards.length].image}
                    title={cards[i % cards.length].title}
                    subtitle={cards[i % cards.length].subtitle}
                    accent={cards[i % cards.length].color ?? theme.accentColor}
                    theme={theme}
                    position={[Math.sin((i / total) * Math.PI * 2) * radius, 0, Math.cos((i / total) * Math.PI * 2) * radius] as any}
                    rotation={[0, Math.PI + (i / total) * Math.PI * 2, 0] as any}
                />
            ))}
        </>
    )
}

function AccentFrame({ color }: { color: string }) {
    // Moldura levemente maior atrás do card para reforçar identidade visual
    return (
        <mesh position={[0, 0, -0.02]}>
            {/* @ts-ignore - provided via extend in Util.ts */}
            <bentPlaneGeometry args={[0.1, 1.06, 1.06, 20, 20]} />
            <meshBasicMaterial color={color} transparent opacity={0.25} />
        </mesh>
    )
}

function Card({ url, title, subtitle, accent, theme, ...props }: { url: string; title: string; subtitle?: string; accent?: string; theme: CarouselTheme } & any) {
    const ref = useRef<any>(null)
    const [hovered, setHovered] = useState(false)
    const pointerOver = (e: any) => {
        e.stopPropagation()
        setHovered(true)
    }
    const pointerOut = () => setHovered(false)
    useFrame((_, delta) => {
        if (!ref.current) return
        const hoverScale = theme.hoverScale ?? 1.05
        const baseScale = theme.baseScale ?? 0.75
        const bend = hovered ? (theme.bendRadius ?? 0.25) : 0.1
        const zoom = hovered ? (theme.zoom?.hovered ?? 1) : (theme.zoom?.idle ?? 1.5)
        easing.damp3(ref.current.scale as any, hovered ? baseScale * hoverScale : baseScale, 0.15, delta)
        easing.damp(ref.current.material as any, 'radius', bend, 0.2, delta)
        easing.damp(ref.current.material as any, 'zoom', zoom, 0.2, delta)
    })
    return (
        <group {...props}>
            <AccentFrame color={accent ?? theme.accentColor ?? '#10b981'} />
            <Image ref={ref} url={url} transparent side={THREE.DoubleSide} onPointerOver={pointerOver} onPointerOut={pointerOut}>
                {/* @ts-ignore - provided via extend in Util.ts */}
                <bentPlaneGeometry args={[0.1, 0.9, 0.9, 20, 20]} />
            </Image>
            <Text
                position={[0, -0.58, 0.08]}
                fontSize={0.14}
                color={"#ffffff"}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.005}
                outlineColor="#000000"
            >
                {title}
            </Text>
            {subtitle && (
                <Text
                    position={[0, -0.73, 0.08]}
                    fontSize={0.09}
                    color={"#cbd5e1"}
                    anchorX="center"
                    anchorY="middle"
                >
                    {subtitle}
                </Text>
            )}
        </group>
    )
}

export default function Carousel3D({ theme }: { theme?: CarouselTheme }) {
    const t: CarouselTheme = {
        accentColor: theme?.accentColor ?? '#14b8a6',
        gradientFrom: theme?.gradientFrom ?? '#14b8a6',
        gradientTo: theme?.gradientTo ?? '#06b6d4',
        hoverScale: theme?.hoverScale ?? 1.05,
        baseScale: theme?.baseScale ?? 0.75,
        bendRadius: theme?.bendRadius ?? 0.22,
        zoom: theme?.zoom ?? { hovered: 1, idle: 1.45 },
        images: theme?.images
    }
    return (
        <Canvas className="!absolute inset-0 !w-full !h-full" camera={{ position: [0, 0, 100], fov: 15 }}>
            {/* @ts-ignore three-stdlib fog jsx */}
            <fog attach="fog" args={["#a79", 8.5, 12]} />
            <ScrollControls pages={4} infinite>
                <Rig rotation={[0, 0, 0.15]}>
                    <Carousel theme={t} />
                </Rig>
            </ScrollControls>
            <Environment preset="dawn" background blur={0.5} />
        </Canvas>
    )
}


