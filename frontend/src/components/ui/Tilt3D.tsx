'use client'

import React, { useRef } from 'react'

type Tilt3DProps = React.PropsWithChildren<{
    className?: string
    maxTiltDeg?: number
    scaleOnHover?: number
    enableGlare?: boolean
}>

export default function Tilt3D({ children, className, maxTiltDeg = 8, scaleOnHover = 1.02, enableGlare = true }: Tilt3DProps) {
    const ref = useRef<HTMLDivElement>(null)
    const glareRef = useRef<HTMLDivElement>(null)

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const node = ref.current
        if (!node) return
        const rect = node.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const px = x / rect.width
        const py = y / rect.height
        const tiltX = (py - 0.5) * -2 * maxTiltDeg
        const tiltY = (px - 0.5) * 2 * maxTiltDeg
        node.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${scaleOnHover})`

        if (enableGlare && glareRef.current) {
            const gx = px * 100
            const gy = py * 100
            glareRef.current.style.opacity = '1'
            glareRef.current.style.background = `radial-gradient( circle at ${gx}% ${gy}%, rgba(255,255,255,0.35), rgba(255,255,255,0.06) 25%, transparent 60% )`
            glareRef.current.style.boxShadow = `0 0 0 1px rgba(255,255,255,0.06), 0 10px 35px rgba(20,184,166,0.15), 0 8px 28px rgba(6,182,212,0.15)`
        }
    }

    const reset = () => {
        const node = ref.current
        if (!node) return
        node.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)'
        if (glareRef.current) {
            glareRef.current.style.opacity = '0'
        }
    }

    return (
        <div
            ref={ref}
            className={className}
            onPointerMove={handlePointerMove}
            onPointerLeave={reset}
            onPointerCancel={reset}
            onBlur={reset}
            style={{ transition: 'transform 200ms ease' }}
        >
            {enableGlare && (
                <div
                    ref={glareRef}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-150"
                    style={{ mixBlendMode: 'screen' }}
                />
            )}
            {children}
        </div>
    )
}


