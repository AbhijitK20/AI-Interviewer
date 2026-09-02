import { useEffect, useRef, useState } from 'react'

export default function LiquidLogo({ src, size = 200, className = '' }) {
  const canvasRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !src) return

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) return

    canvas.width = size * 2
    canvas.height = size * 2

    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D u_image;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 centered = uv - 0.5;

        float t = u_time * 0.3;
        float n = fbm(centered * 3.0 + t);

        vec2 offset = vec2(
          cos(n * 6.28 + t) * 0.02,
          sin(n * 6.28 + t) * 0.02
        );

        vec4 color = texture2D(u_image, uv + offset);

        float edge = smoothstep(0.01, 0.05, color.a);
        float glow = smoothstep(0.3, 0.0, length(centered)) * 0.3;

        vec3 metallic = mix(
          vec3(0.6, 0.7, 0.9),
          vec3(0.9, 0.7, 0.6),
          n
        );

        vec3 finalColor = mix(metallic * 0.5, color.rgb * metallic, edge);
        finalColor += glow * metallic;

        float mouseDist = length(centered - u_mouse * 0.1);
        float mouseGlow = smoothstep(0.3, 0.0, mouseDist) * 0.2;
        finalColor += mouseGlow * metallic;

        gl_FragColor = vec4(finalColor, max(edge, glow * 0.5));
      }
    `

    const vs = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vs, vertexShaderSource)
    gl.compileShader(vs)

    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fs, fragmentShaderSource)
    gl.compileShader(fs)

    const program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const imageLoc = gl.getUniformLocation(program, 'u_image')
    const resLoc = gl.getUniformLocation(program, 'u_resolution')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse')

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.uniform1i(imageLoc, 0)
      setLoaded(true)
    }
    img.src = src

    let mouseX = 0, mouseY = 0
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }
    canvas.addEventListener('mousemove', handleMouseMove)

    let animId
    const startTime = Date.now()
    const render = () => {
      const time = (Date.now() - startTime) / 1000
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

      gl.useProgram(program)
      gl.uniform1f(timeLoc, time)
      gl.uniform2f(resLoc, canvas.width, canvas.height)
      gl.uniform2f(mouseLoc, mouseX, mouseY)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animId)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [src, size])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}
