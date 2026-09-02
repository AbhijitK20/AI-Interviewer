import { useEffect, useRef } from 'react'

export default function ShaderBackground({ className = '' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    let animationId
    let gl, program, timeLocation, resolutionLocation

    const vertexShader = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `

    const fragmentShader = `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;

      vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.263, 0.416, 0.557);
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        uv.x *= resolution.x / resolution.y;

        float t = time * 0.15;
        vec3 col = vec3(0.0);

        for (float i = 0.0; i < 3.0; i++) {
          vec2 p = uv;
          p.x += sin(t + p.y * 2.0 + i * 1.5) * 0.3;
          p.y += cos(t + p.x * 2.0 + i * 1.5) * 0.3;
          float d = length(p - vec2(0.5));
          col += palette(d + t + i * 0.3) * (0.02 / (d * d + 0.01));
        }

        col *= 0.15;
        gl_FragColor = vec4(col, 1.0);
      }
    `

    const canvas = canvasRef.current
    if (!canvas) return

    gl = canvas.getContext('webgl')
    if (!gl) return

    const vs = gl.createShader(gl.VERTEX_SHADER)
    gl.shaderSource(vs, vertexShader)
    gl.compileShader(vs)

    const fs = gl.createShader(gl.FRAGMENT_SHADER)
    gl.shaderSource(fs, fragmentShader)
    gl.compileShader(fs)

    program = gl.createProgram()
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.useProgram(program)

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1])
    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    timeLocation = gl.getUniformLocation(program, 'time')
    resolutionLocation = gl.getUniformLocation(program, 'resolution')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    let startTime = Date.now()
    const render = () => {
      const time = (Date.now() - startTime) / 1000
      gl.uniform1f(timeLocation, time)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      animationId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full -z-10 ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  )
}
