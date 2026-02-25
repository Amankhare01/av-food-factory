"use client"

import { useEffect, useState } from "react"

export function useParallax(speed: number = 0.3) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    let rafId: number

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        setOffset(window.scrollY * speed)
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [speed])

  return offset
}