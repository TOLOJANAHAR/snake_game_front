import { gsap } from 'gsap'

//Serpent grandit : flash sur le nouveau segment
export function animateGrow(el) {
  if (!el) return
  gsap.fromTo(el,
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.2, ease: 'back.out(2)' }
  )
}

//Tête du serpent : légère compression à chaque tick
export function animateHeadMove(el) {
  if (!el) return
  gsap.fromTo(el,
    { scaleX: 1.15, scaleY: 0.85 },
    { scaleX: 1,    scaleY: 1,    duration: 0.1, ease: 'power1.out' }
  )
}

// Pomme mangée : burst d'étoiles
export function animateFoodEat(container, x, y, type) {
  const colors = {
    apple:  '#ff4757',
    golden: '#ffd700',
    blue:   '#4fc3f7',
    red:    '#ff6b6b',
    skull:  '#9e9e9e',
  }
  const color = colors[type] || '#fff'
  const count = type === 'skull' ? 8 : 6

  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div')
    particle.style.cssText = `
      position: absolute;
      width: 5px; height: 5px;
      background: ${color};
      border-radius: 1px;
      left: ${x}px; top: ${y}px;
      pointer-events: none;
      z-index: 100;
      image-rendering: pixelated;
    `
    container.appendChild(particle)
    const angle  = (360 / count) * i
    const dist   = 20 + Math.random() * 20
    const rad    = (angle * Math.PI) / 180
    gsap.to(particle, {
      x: Math.cos(rad) * dist,
      y: Math.sin(rad) * dist,
      opacity: 0,
      scale: 0,
      duration: 0.5 + Math.random() * 0.3,
      ease: 'power2.out',
      onComplete: () => particle.remove(),
    })
  }
}

// Floating score text
export function animateScoreFloat(container, x, y, points) {
  const el = document.createElement('div')
  el.textContent = points > 0 ? `+${points}` : `${points}`
  el.style.cssText = `
    position: absolute;
    left: ${x}px; top: ${y}px;
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    color: ${points > 0 ? '#3ddc84' : '#ff4757'};
    pointer-events: none;
    z-index: 101;
    white-space: nowrap;
    text-shadow: 1px 1px 0 #000;
  `
  container.appendChild(el)
  gsap.fromTo(el,
    { y: 0, opacity: 1 },
    { y: -40, opacity: 0, duration: 0.9, ease: 'power2.out', onComplete: () => el.remove() }
  )
}

// Évolution du serpent : flash de toute la grille
export function animateEvolution(overlayEl, stage) {
  if (!overlayEl) return
  const colors = { serpent: '#3ddc84', dragon: '#ffd700' }
  const color  = colors[stage] || '#fff'
  gsap.fromTo(overlayEl,
    { opacity: 0.5, backgroundColor: color },
    { opacity: 0,   duration: 0.6, ease: 'power2.out' }
  )
}

// Shake de l'écran (game over / crâne) 
export function animateScreenShake(el) {
  if (!el) return
  gsap.fromTo(el,
    { x: 0 },
    {
      x: 8, duration: 0.06, ease: 'none', yoyo: true, repeat: 5,
      onComplete: () => gsap.set(el, { x: 0 }),
    }
  )
}

//Power-up actif : glow pulsant sur le serpent
export function animatePowerUpGlow(el, type) {
  if (!el) return
  const glows = {
    golden: '0 0 10px #ffd700, 0 0 20px #ffd70066',
    blue:   '0 0 10px #4fc3f7, 0 0 20px #4fc3f766',
    red:    '0 0 10px #ff4757, 0 0 20px #ff475766',
  }
  gsap.to(el, {
    boxShadow: glows[type] || 'none',
    duration: 0.3,
  })
}
