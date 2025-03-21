"use client"

import { useEffect, useRef } from "react"

export function BlobLoader() {
  // Reference to the SVG element to append it to the DOM only once
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    // Ensure the SVG filter is added to the DOM only once
    if (svgRef.current && !document.getElementById("blob-goo-filter")) {
      const filterSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      filterSvg.setAttribute("id", "blob-goo-filter")
      filterSvg.setAttribute("width", "0")
      filterSvg.setAttribute("height", "0")
      filterSvg.innerHTML = `
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      `
      document.body.appendChild(filterSvg)
    }
  }, [])

  return (
    <div className="flex justify-center items-center w-full h-full min-h-[60vh]">
      <div className="relative w-[300px] h-[300px] overflow-hidden rounded-[70px]" style={{ filter: "url(#goo)" }}>
        {/* Blob center */}
        <div
          className="absolute top-1/2 left-1/2 w-[30px] h-[30px] rounded-full"
          style={{
            backgroundColor: "hsl(var(--primary))",
            transform: "scale(0.9) translate(-50%, -50%)",
            transformOrigin: "left top",
            animation: "blob-grow linear 3.4s infinite",
            boxShadow: "0 -10px 40px -5px hsl(var(--primary))",
          }}
        ></div>

        {/* Blobs */}
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-[30px] h-[30px] rounded-full opacity-0"
            style={{
              backgroundColor: "hsl(var(--primary))",
              transform: "scale(0.9) translate(-50%, -50%)",
              transformOrigin: "center top",
              animation: "blobs ease-out 3.4s infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Hidden SVG for reference */}
      <svg ref={svgRef} className="hidden"></svg>

      {/* Add the keyframes via a style tag */}
      <style jsx>{`
        @keyframes blobs {
          0% {
            opacity: 0;
            transform: scale(0) translate(calc(-330px - 50%), -50%);
          }
          1% {
            opacity: 1;
          }
          35%, 65% {
            opacity: 1;
            transform: scale(0.9) translate(-50%, -50%);
          }
          99% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(0) translate(calc(330px - 50%), -50%);
          }
        }

        @keyframes blob-grow {
          0%, 39% {
            transform: scale(0) translate(-50%, -50%);
          }
          40%, 42% {
            transform: scale(1, 0.9) translate(-50%, -50%);
          }
          43%, 44% {
            transform: scale(1.2, 1.1) translate(-50%, -50%);
          }
          45%, 46% {
            transform: scale(1.3, 1.2) translate(-50%, -50%);
          }
          47%, 48% {
            transform: scale(1.4, 1.3) translate(-50%, -50%);
          }
          52% {
            transform: scale(1.5, 1.4) translate(-50%, -50%);
          }
          54% {
            transform: scale(1.7, 1.6) translate(-50%, -50%);
          }
          58% {
            transform: scale(1.8, 1.7) translate(-50%, -50%);
          }
          68%, 70% {
            transform: scale(1.7, 1.5) translate(-50%, -50%);
          }
          78% {
            transform: scale(1.6, 1.4) translate(-50%, -50%);
          }
          80%, 81% {
            transform: scale(1.5, 1.4) translate(-50%, -50%);
          }
          82%, 83% {
            transform: scale(1.4, 1.3) translate(-50%, -50%);
          }
          84%, 85% {
            transform: scale(1.3, 1.2) translate(-50%, -50%);
          }
          86%, 87% {
            transform: scale(1.2, 1.1) translate(-50%, -50%);
          }
          90%, 91% {
            transform: scale(1, 0.9) translate(-50%, -50%);
          }
          92%, 100% {
            transform: scale(0) translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  )
}

