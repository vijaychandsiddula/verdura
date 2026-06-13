'use client'

export function LeafCluster() {
  return (
    <svg viewBox="0 0 420 520" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', opacity: 0.85 }}>
      <path d="M210 480 C180 380 80 320 60 200 C40 80 160 20 210 100 C260 20 380 80 360 200 C340 320 240 380 210 480Z"
        fill="#2d5a0e" opacity="0.15" />
      <path d="M200 460 C170 360 90 290 100 180 C110 70 180 40 210 90 C240 40 310 70 320 180 C330 290 250 360 220 460Z"
        fill="#3b6d11" opacity="0.25" />
      <path d="M155 220 C130 210 110 190 120 165 C130 140 155 148 165 170" fill="none" stroke="#f5f0e8" strokeWidth="12" strokeLinecap="round" />
      <path d="M265 220 C290 210 310 190 300 165 C290 140 265 148 255 170" fill="none" stroke="#f5f0e8" strokeWidth="12" strokeLinecap="round" />
      <path d="M140 290 C112 272 100 248 115 225" fill="none" stroke="#f5f0e8" strokeWidth="10" strokeLinecap="round" />
      <path d="M280 290 C308 272 320 248 305 225" fill="none" stroke="#f5f0e8" strokeWidth="10" strokeLinecap="round" />
      <path d="M210 460 L210 340" stroke="#27500a" strokeWidth="8" strokeLinecap="round" opacity="0.4" />
      <path d="M140 350 C100 310 80 260 110 230 C130 215 160 230 155 260 C150 285 145 320 140 350Z"
        fill="#4a8a1a" opacity="0.35" />
      <path d="M280 350 C320 310 340 260 310 230 C290 215 260 230 265 260 C270 285 275 320 280 350Z"
        fill="#4a8a1a" opacity="0.35" />
      <circle cx="100" cy="150" r="6" fill="#c0dd97" opacity="0.6" />
      <circle cx="320" cy="130" r="4" fill="#c0dd97" opacity="0.5" />
      <circle cx="80" cy="380" r="5" fill="#c0dd97" opacity="0.4" />
      <circle cx="350" cy="360" r="7" fill="#c0dd97" opacity="0.45" />
      <circle cx="210" cy="50" r="8" fill="#c0dd97" opacity="0.5" />
      <path d="M140 350 Q160 300 180 320" fill="none" stroke="#27500a" strokeWidth="3" opacity="0.3" strokeLinecap="round" />
      <path d="M280 350 Q260 300 240 320" fill="none" stroke="#27500a" strokeWidth="3" opacity="0.3" strokeLinecap="round" />
    </svg>
  )
}

export function WaveDown({ from, to }: { from: string; to: string }) {
  return (
    <div style={{ lineHeight: 0, backgroundColor: from }}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 80 }}>
        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill={to} />
      </svg>
    </div>
  )
}

export function WaveUp({ from, to }: { from: string; to: string }) {
  return (
    <div style={{ lineHeight: 0, backgroundColor: from }}>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 80 }}>
        <path d="M0,40 C360,0 1080,80 1440,40 L1440,80 L0,80 Z" fill={to} />
      </svg>
    </div>
  )
}

export function LeafBg() {
  return (
    <svg viewBox="0 0 200 200" style={{ position: 'absolute', right: 0, bottom: 0, width: 320, height: 320, opacity: 0.05, pointerEvents: 'none' }}>
      <path d="M100 180 C70 130 20 100 30 50 C40 0 90 10 100 60 C110 10 160 0 170 50 C180 100 130 130 100 180Z" fill="#3b6d11" />
    </svg>
  )
}

export function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: 52, height: 52, backgroundColor: '#eaf3de', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 24 }}>
      {children}
    </div>
  )
}
