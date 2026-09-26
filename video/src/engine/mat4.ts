// Minimal column-major 4×4 matrices for perspective planes.
export type M4 = Float32Array

export const ident = (): M4 => {
  const m = new Float32Array(16)
  m[0] = m[5] = m[10] = m[15] = 1
  return m
}

export const mul = (a: M4, b: M4): M4 => {
  const o = new Float32Array(16)
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0
      for (let k = 0; k < 4; k++) s += a[k * 4 + r]! * b[c * 4 + k]!
      o[c * 4 + r] = s
    }
  return o
}

export const chain = (...ms: M4[]) => ms.reduce((a, b) => mul(a, b))

export const perspective = (
  fovy: number,
  aspect: number,
  near: number,
  far: number
): M4 => {
  const f = 1 / Math.tan(fovy / 2)
  const m = new Float32Array(16)
  m[0] = f / aspect
  m[5] = f
  m[10] = (far + near) / (near - far)
  m[11] = -1
  m[14] = (2 * far * near) / (near - far)
  return m
}

export const translate = (x: number, y: number, z: number): M4 => {
  const m = ident()
  m[12] = x
  m[13] = y
  m[14] = z
  return m
}

export const scale = (x: number, y: number, z = 1): M4 => {
  const m = ident()
  m[0] = x
  m[5] = y
  m[10] = z
  return m
}

export const rotX = (a: number): M4 => {
  const m = ident()
  const c = Math.cos(a)
  const s = Math.sin(a)
  m[5] = c
  m[6] = s
  m[9] = -s
  m[10] = c
  return m
}

export const rotY = (a: number): M4 => {
  const m = ident()
  const c = Math.cos(a)
  const s = Math.sin(a)
  m[0] = c
  m[2] = -s
  m[8] = s
  m[10] = c
  return m
}

export const rotZ = (a: number): M4 => {
  const m = ident()
  const c = Math.cos(a)
  const s = Math.sin(a)
  m[0] = c
  m[1] = s
  m[4] = -s
  m[5] = c
  return m
}

export const apply = (m: M4, x: number, y: number, z: number) => {
  const X = m[0]! * x + m[4]! * y + m[8]! * z + m[12]!
  const Y = m[1]! * x + m[5]! * y + m[9]! * z + m[13]!
  const Z = m[2]! * x + m[6]! * y + m[10]! * z + m[14]!
  const Wc = m[3]! * x + m[7]! * y + m[11]! * z + m[15]!
  return { x: X / Wc, y: Y / Wc, z: Z / Wc, w: Wc }
}

/**
 * A "screen-space" camera: the z = 0 plane maps 1:1 onto output pixels.
 * World units are pixels with the origin at the screen center, y up.
 */
export const screenCamera = (W: number, H: number, fovDeg = 30) => {
  const fov = (fovDeg * Math.PI) / 180
  const D = H / 2 / Math.tan(fov / 2)
  const P = perspective(fov, W / H, 20, D * 6)
  const V = translate(0, 0, -D)
  return { P, V, PV: mul(P, V), D }
}

export interface PlanePose {
  /** Center in screen pixels (y down). */
  cx: number
  cy: number
  z?: number
  w: number
  h: number
  rx?: number
  ry?: number
  rz?: number
  s?: number
}

export const planeMVP = (
  W: number,
  H: number,
  pose: PlanePose,
  fovDeg = 30
) => {
  const cam = screenCamera(W, H, fovDeg)
  const s = pose.s ?? 1
  const M = chain(
    translate(pose.cx - W / 2, H / 2 - pose.cy, pose.z ?? 0),
    rotY(pose.ry ?? 0),
    rotX(pose.rx ?? 0),
    rotZ(pose.rz ?? 0),
    scale(s, s, 1),
    translate(-pose.w / 2, -pose.h / 2, 0),
    scale(pose.w, pose.h, 1)
  )
  return mul(cam.PV, M)
}

/** Project a point given in plane-local pixels (origin top-left, y down) to the screen. */
export const planePoint = (
  W: number,
  H: number,
  pose: PlanePose,
  u: number,
  v: number,
  fovDeg = 30
) => {
  const mvp = planeMVP(W, H, pose, fovDeg)
  const p = apply(mvp, u / pose.w, 1 - v / pose.h, 0)
  return { x: (p.x * 0.5 + 0.5) * W, y: (1 - (p.y * 0.5 + 0.5)) * H }
}

type V3 = [number, number, number]
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

export const lookAt = (eye: V3, target: V3, up: V3 = [0, 1, 0]): M4 => {
  const z = norm(sub(eye, target))
  const x = norm(cross(up, z))
  const y = cross(z, x)
  const m = ident()
  m[0] = x[0]
  m[4] = x[1]
  m[8] = x[2]
  m[1] = y[0]
  m[5] = y[1]
  m[9] = y[2]
  m[2] = z[0]
  m[6] = z[1]
  m[10] = z[2]
  m[12] = -dot(x, eye)
  m[13] = -dot(y, eye)
  m[14] = -dot(z, eye)
  return m
}

/** Project a world point with a view-projection matrix to screen pixels. */
export const project = (
  PV: M4,
  W: number,
  H: number,
  x: number,
  y: number,
  z: number
) => {
  const p = apply(PV, x, y, z)
  return { x: (p.x * 0.5 + 0.5) * W, y: (1 - (p.y * 0.5 + 0.5)) * H, w: p.w }
}
