import { LiquidGlass } from '@liquidglass/react'

export default function GlassCard({
  children,
  className = '',
  borderRadius = 20,
  blur = 0.25,
  contrast = 1.2,
  brightness = 1.05,
  saturation = 1.1,
  shadowIntensity = 0.25,
  displacementScale = 1,
  elasticity = 0.6,
  ...props
}) {
  return (
    <LiquidGlass
      borderRadius={borderRadius}
      blur={blur}
      contrast={contrast}
      brightness={brightness}
      saturation={saturation}
      shadowIntensity={shadowIntensity}
      displacementScale={displacementScale}
      elasticity={elasticity}
      className={className}
      {...props}
    >
      {children}
    </LiquidGlass>
  )
}
