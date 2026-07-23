import React from 'react'

export function FeatherLogo({ className = "w-6 h-6", darkMode = false }: { className?: string; darkMode?: boolean }) {
  const color = darkMode ? '#38BDF8' : '#1677FF'

  return (
    <div className="relative flex flex-col items-center justify-center shrink-0">
      <svg
        viewBox="0 0 100 100"
        fill="currentColor"
        className={`${className} transition-colors`}
        style={{ color }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 28,76 C 29,73 31,68 33,62 C 34,57 37,51 40,44 C 44,35 50,26 58,19 C 64,14 70,11 76,9 C 74,12 70,16 64,22 C 57,29 50,37 45,45 C 41,52 38,59 36,65 C 34,70 33,74 31,78 L 28,76 Z 
                 M 76,9 C 68,14 58,22 49,32 C 43,39 38,47 34,55 C 39,47 46,39 54,32 C 63,24 72,17 76,9 Z 
                 M 64,22 C 58,28 50,36 44,44 C 48,37 54,30 61,24 L 64,22 Z
                 M 52,35 C 47,42 41,50 36,58 C 39,51 44,44 50,37 L 52,35 Z" 
        />
        <path fillRule="evenodd" clipRule="evenodd" d="
          M76,9
          C70,11 62,15 54,21
          C46,27 38,36 33,45
          C31,48 29,52 28,55
          C28.8,53.5 30,51 31.5,49
          C35,44 40,39 46,34
          C40,41 35,48 31,56
          C29,60 27.5,64 26.5,68
          L25,74
          L26.2,74.5
          C26.5,73 27.2,70.5 28.2,67.5
          C30,62 33,55 37,48
          C43,38 51,29 60,21
          C68,14 74,10 76,9 Z
          M25,74
          L23.5,78
          C23.2,78.8 22.8,79.5 22.5,80
          L24,80.5
          C24.5,79.8 25,78.5 25.5,77.2
          L26.2,74.5
          L25,74 Z
        " />
        <path d="
          M 23,81 
          C 24,78 26,72 29,65 
          C 33,56 39,46 47,37 
          C 55,27 65,18 78,11 
          C 74,15 69,20 63,26 
          C 60,29 58,31 55,34 
          C 57,31 60,28 64,24 
          C 58,31 52,38 47,45 
          C 43,51 40,56 37,61 
          C 39,57 42,52 46,47 
          C 41,54 37,61 34,67 
          C 32,71 30,75 28,79 
          L 23,81 Z
        " />
        <path
          d="M 28 86 Q 42 84 56 86 T 84 86"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  )
}
