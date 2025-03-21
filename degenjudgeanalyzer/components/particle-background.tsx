"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    // Check for WebGL support using a simple detection method
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement("canvas")
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        )
      } catch (e) {
        return false
      }
    }

    // Exit if WebGL is not supported
    if (!checkWebGLSupport()) {
      console.error("WebGL is not available in your browser")
      return
    }

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x0f0f1a, 0)

    // Setup scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 30

    // Create particles
    const particleCount = 1500 // Reduced count for better performance and subtlety
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    // Gold/amber color palette
    const colorPalette = [
      new THREE.Color(0xffd700), // Gold
      new THREE.Color(0xffbf00), // Amber
      new THREE.Color(0xffaa00), // Orange-amber
      new THREE.Color(0xffc87c), // Light amber
    ]

    for (let i = 0; i < particleCount; i++) {
      // Position particles in a sphere
      const radius = 20 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      // Assign random color from palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      // Random size for each particle
      sizes[i] = Math.random() * 1.5 + 0.3 // Slightly smaller particles
    }

    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    particles.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    particles.setAttribute("size", new THREE.BufferAttribute(sizes, 1))

    // Mouse interaction
    const mouse = new THREE.Vector2()
    const targetRotation = new THREE.Vector2()
    const mousePosition = new THREE.Vector2()
    let isMouseDown = false

    const onMouseMove = (event: MouseEvent) => {
      // Update normalized mouse coordinates (-1 to 1)
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      // Store actual mouse position for particle attraction
      mousePosition.x = event.clientX
      mousePosition.y = event.clientY

      // Always update rotation target for more responsive movement, but with reduced values
      targetRotation.x = mouse.y * 0.3 // Reduced from 0.8
      targetRotation.y = mouse.x * 0.3 // Reduced from 0.8

      if (isMouseDown) {
        // More dramatic rotation when mouse is down, but still gentler
        targetRotation.x = mouse.y * 0.6 // Reduced from 1.5
        targetRotation.y = mouse.x * 0.6 // Reduced from 1.5
      }
    }

    const onMouseDown = () => {
      isMouseDown = true
    }

    const onMouseUp = () => {
      isMouseDown = false
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mousedown", onMouseDown)
    window.addEventListener("mouseup", onMouseUp)

    // Touch events
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1

        targetRotation.x = mouse.y * 0.5
        targetRotation.y = mouse.x * 0.5
      }
    }

    window.addEventListener("touchmove", onTouchMove)
    window.addEventListener("touchstart", () => (isMouseDown = true))
    window.addEventListener("touchend", () => (isMouseDown = false))

    // Handle window resize
    const onWindowResize = () => {
      const pageHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight,
      )

      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)

      // Ensure particles cover the entire page
      particleSystem.scale.y = Math.max(1, pageHeight / window.innerHeight)
    }

    window.addEventListener("resize", onWindowResize)

    // Handle scroll to ensure particles cover the entire scrollable area
    const onScroll = () => {
      const scrollY = window.scrollY
      particleSystem.position.y = scrollY * 0.05 // Subtle parallax effect
    }

    window.addEventListener("scroll", onScroll)

    // Particle shader material
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: window.devicePixelRatio },
        mousePosition: { value: new THREE.Vector2(0, 0) },
        mouseInfluence: { value: 0.08 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        uniform float time;
        uniform float pixelRatio;
        uniform vec2 mousePosition;
        uniform float mouseInfluence;
        varying vec3 vColor;

        void main() {
          vColor = color;
          
          // Simple animation - gentle floating motion
          vec3 pos = position;
          pos.x += sin(time * 0.2 + position.z * 0.1) * 0.3;
          pos.y += cos(time * 0.2 + position.x * 0.1) * 0.3;
          pos.z += sin(time * 0.2 + position.y * 0.1) * 0.3;
          
          // Mouse influence - particles are attracted to or repelled from mouse
          float distanceToMouse = length(pos.xy - mousePosition * 20.0);
          float influence = mouseInfluence / (distanceToMouse * 0.1 + 0.2);  // Adjusted from 0.05 and 0.1
          vec2 direction = normalize(pos.xy - mousePosition * 20.0);
          pos.x += direction.x * influence;
          pos.y += direction.y * influence;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Circular particle with soft edge
          vec2 xy = gl_PointCoord.xy - vec2(0.5);
          float radius = length(xy);
          float alpha = 1.0 - smoothstep(0.3, 0.5, radius);
          
          // Apply color with reduced opacity
          gl_FragColor = vec4(vColor, alpha * 0.4); // Reduced opacity
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    // Create particle system
    const particleSystem = new THREE.Points(particles, particleMaterial)
    scene.add(particleSystem)

    // Animation loop
    const clock = new THREE.Clock()

    const animate = () => {
      const elapsedTime = clock.getElapsedTime()
      particleMaterial.uniforms.time.value = elapsedTime
      particleMaterial.uniforms.mousePosition.value = new THREE.Vector2(mouse.x, mouse.y)
      particleMaterial.uniforms.mouseInfluence.value = isMouseDown ? 0.06 : 0.03 // Reduced from 0.15 and 0.08

      // Smoother rotation with enhanced responsiveness, but slower
      particleSystem.rotation.x += (targetRotation.x - particleSystem.rotation.x) * 0.015 // Reduced from 0.03
      particleSystem.rotation.y += (targetRotation.y - particleSystem.rotation.y) * 0.015 // Reduced from 0.03

      // Add a constant slow rotation that's reduced when mouse is moving
      const mouseMoving = Math.abs(targetRotation.x) > 0.01 || Math.abs(targetRotation.y) > 0.01
      const baseRotationSpeed = mouseMoving ? 0.00005 : 0.0002 // Reduced from 0.0001 and 0.0005
      particleSystem.rotation.y += baseRotationSpeed
      particleSystem.rotation.x += baseRotationSpeed * 0.4

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mousedown", onMouseDown)
      window.removeEventListener("mouseup", onMouseUp)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchstart", () => {})
      window.removeEventListener("touchend", () => {})
      window.removeEventListener("resize", onWindowResize)
      window.removeEventListener("scroll", onScroll)

      scene.remove(particleSystem)
      particles.dispose()
      particleMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 w-full h-full min-h-screen opacity-60 blur-[3px]" />
}

