// WebGL2 compositor: sub-frame accumulation (motion blur) in linear light,
// optional perspective planes, soft-knee bloom, and a filmic finishing pass.

export type RGB = [number, number, number]

export interface Plane {
  canvas: HTMLCanvasElement
  version: number
  /** Column-major clip-space matrix for the unit quad (0..1, 0..1). */
  mvp: Float32Array
  alpha: number
}

export interface Fx {
  bg: RGB
  samples: number
  shutter: number
  bloom: number
  bloomThreshold: number
  bloomKnee: number
  ca: number
  grain: number
  vignette: number
  flash: number
  flashColor: RGB
  exposure: number
  contrast: number
  saturation: number
  zoomBlur: number
  zoomCenter: [number, number]
  planes: Plane[]
  /** Planes drawn above the 2D layer (e.g. foreground billboards). */
  topPlanes: Plane[]
}

export const defaultFx = (): Fx => ({
  bg: [0, 0, 0],
  samples: 8,
  shutter: 0.5,
  bloom: 0.18,
  bloomThreshold: 0.8,
  bloomKnee: 0.35,
  ca: 0.6,
  grain: 0.045,
  vignette: 0.18,
  flash: 0,
  flashColor: [1, 1, 1],
  exposure: 1,
  contrast: 1,
  saturation: 1,
  zoomBlur: 0,
  zoomCenter: [0.5, 0.5],
  planes: [],
  topPlanes: []
})

const VERT_FULL = `#version 300 es
out vec2 uv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG_LAYER = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D tex;
out vec4 o;
void main() { o = texture(tex, uv); }`

const VERT_PLANE = `#version 300 es
uniform mat4 mvp;
out vec2 uv;
void main() {
  vec2 p = vec2(gl_VertexID == 1 || gl_VertexID == 2 || gl_VertexID == 4 ? 1.0 : 0.0,
                gl_VertexID == 2 || gl_VertexID == 4 || gl_VertexID == 5 ? 1.0 : 0.0);
  uv = vec2(p.x, 1.0 - p.y);
  gl_Position = mvp * vec4(p, 0.0, 1.0);
}`

const FRAG_PLANE = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D tex;
uniform float alpha;
out vec4 o;
void main() { o = texture(tex, uv) * alpha; }`

const SRGB = `
vec3 toLinear(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}
vec3 toSrgb(vec3 c) {
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}`

const FRAG_ACCUM = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D tex;
uniform float weight;
out vec4 o;
${SRGB}
void main() {
  vec3 c = texture(tex, uv).rgb;
  o = vec4(toLinear(c) * weight, weight);
}`

const FRAG_BRIGHT = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D tex;
uniform float threshold;
uniform float knee;
out vec4 o;
void main() {
  vec3 c = texture(tex, uv).rgb;
  float br = max(c.r, max(c.g, c.b));
  float soft = clamp(br - threshold + knee, 0.0, 2.0 * knee);
  soft = soft * soft / (4.0 * knee + 1e-4);
  float contrib = max(soft, br - threshold) / max(br, 1e-4);
  o = vec4(c * contrib, 1.0);
}`

const FRAG_DOWN = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D tex;
uniform vec2 texel;
out vec4 o;
void main() {
  vec3 a = texture(tex, uv + texel * vec2(-2, 2)).rgb;
  vec3 b = texture(tex, uv + texel * vec2(0, 2)).rgb;
  vec3 c = texture(tex, uv + texel * vec2(2, 2)).rgb;
  vec3 d = texture(tex, uv + texel * vec2(-2, 0)).rgb;
  vec3 e = texture(tex, uv).rgb;
  vec3 f = texture(tex, uv + texel * vec2(2, 0)).rgb;
  vec3 g = texture(tex, uv + texel * vec2(-2, -2)).rgb;
  vec3 h = texture(tex, uv + texel * vec2(0, -2)).rgb;
  vec3 i = texture(tex, uv + texel * vec2(2, -2)).rgb;
  vec3 j = texture(tex, uv + texel * vec2(-1, 1)).rgb;
  vec3 k = texture(tex, uv + texel * vec2(1, 1)).rgb;
  vec3 l = texture(tex, uv + texel * vec2(-1, -1)).rgb;
  vec3 m = texture(tex, uv + texel * vec2(1, -1)).rgb;
  vec3 r = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  o = vec4(r, 1.0);
}`

const FRAG_UP = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D tex;
uniform vec2 texel;
uniform float radius;
out vec4 o;
void main() {
  vec2 t = texel * radius;
  vec3 r = texture(tex, uv + vec2(-t.x, t.y)).rgb
    + texture(tex, uv + vec2(0.0, t.y)).rgb * 2.0
    + texture(tex, uv + vec2(t.x, t.y)).rgb
    + texture(tex, uv + vec2(-t.x, 0.0)).rgb * 2.0
    + texture(tex, uv).rgb * 4.0
    + texture(tex, uv + vec2(t.x, 0.0)).rgb * 2.0
    + texture(tex, uv + vec2(-t.x, -t.y)).rgb
    + texture(tex, uv + vec2(0.0, -t.y)).rgb * 2.0
    + texture(tex, uv + vec2(t.x, -t.y)).rgb;
  o = vec4(r / 16.0, 1.0);
}`

const FRAG_FINAL = `#version 300 es
precision highp float;
in vec2 uv;
uniform sampler2D scene;
uniform sampler2D bloomTex;
uniform vec2 res;
uniform float bloom;
uniform float ca;
uniform float grain;
uniform float vignette;
uniform float flash;
uniform vec3 flashColor;
uniform float exposure;
uniform float contrast;
uniform float saturation;
uniform float zoomBlur;
uniform vec2 zoomCenter;
uniform float frame;
out vec4 o;
${SRGB}
float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1, 0));
  float c = hash(i + vec2(0, 1));
  float d = hash(i + vec2(1, 1));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
vec3 sampleScene(vec2 p) {
  if (ca <= 0.001) return texture(scene, p).rgb;
  vec2 d = (p - 0.5);
  float len2 = dot(d * vec2(res.x / res.y, 1.0), d * vec2(res.x / res.y, 1.0));
  vec2 off = d * ca / res.x * (0.6 + len2 * 2.2);
  return vec3(
    texture(scene, p + off).r,
    texture(scene, p).g,
    texture(scene, p - off).b
  );
}
void main() {
  vec3 c;
  if (zoomBlur > 0.001) {
    vec3 acc = vec3(0.0);
    float wsum = 0.0;
    for (int i = 0; i < 24; i++) {
      float t = float(i) / 23.0;
      float s = 1.0 - zoomBlur * t;
      vec2 p = zoomCenter + (uv - zoomCenter) * s;
      float w = 1.0 - t * 0.5;
      acc += sampleScene(p) * w;
      wsum += w;
    }
    c = acc / wsum;
  } else {
    c = sampleScene(uv);
  }
  c += texture(bloomTex, uv).rgb * bloom;
  c *= exposure;
  // Gentle shoulder so bloom never clips harshly.
  vec3 over = max(c - 0.82, 0.0);
  c = min(c, 0.82) + (1.0 - exp(-over * 5.5)) * 0.18;
  vec3 s = toSrgb(c);
  float l = dot(s, vec3(0.2126, 0.7152, 0.0722));
  s = mix(vec3(l), s, saturation);
  s = (s - 0.5) * contrast + 0.5;
  vec2 q = uv - 0.5;
  q.x *= res.x / res.y;
  float v = smoothstep(0.35, 1.25, length(q));
  s *= 1.0 - vignette * v;
  vec2 px = uv * res;
  float g = vnoise(px / 1.7 + vec2(frame * 37.0, frame * 91.0)) - 0.5;
  g += (vnoise(px / 0.9 + vec2(frame * 13.0, frame * 7.0)) - 0.5) * 0.5;
  float mid = 1.0 - pow(abs(l - 0.5) * 2.0, 2.0) * 0.6;
  s += g * grain * mid;
  s = mix(s, flashColor, clamp(flash, 0.0, 1.0));
  s += (hash(px + frame) - 0.5) / 255.0;
  o = vec4(clamp(s, 0.0, 1.0), 1.0);
}`

interface Target {
  fb: WebGLFramebuffer
  tex: WebGLTexture
  w: number
  h: number
}

export class Post {
  gl: WebGL2RenderingContext
  w: number
  h: number
  layerTex: WebGLTexture
  sceneT: Target
  accumT: Target
  mips: Target[] = []
  planeTex = new Map<
    HTMLCanvasElement,
    { tex: WebGLTexture; version: number }
  >()
  progs: Record<string, WebGLProgram> = {}
  aniso: EXT_texture_filter_anisotropic | null

  constructor(canvas: HTMLCanvasElement, w: number, h: number) {
    this.w = w
    this.h = h
    const gl = canvas.getContext('webgl2', {
      preserveDrawingBuffer: true,
      antialias: false,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance'
    })
    if (!gl) throw new Error('WebGL2 unavailable')
    this.gl = gl
    if (!gl.getExtension('EXT_color_buffer_float'))
      throw new Error('EXT_color_buffer_float unavailable')
    gl.getExtension('OES_texture_float_linear')
    this.aniso = gl.getExtension('EXT_texture_filter_anisotropic')
    this.progs.layer = this.program(VERT_FULL, FRAG_LAYER)
    this.progs.plane = this.program(VERT_PLANE, FRAG_PLANE)
    this.progs.accum = this.program(VERT_FULL, FRAG_ACCUM)
    this.progs.bright = this.program(VERT_FULL, FRAG_BRIGHT)
    this.progs.down = this.program(VERT_FULL, FRAG_DOWN)
    this.progs.up = this.program(VERT_FULL, FRAG_UP)
    this.progs.final = this.program(VERT_FULL, FRAG_FINAL)
    this.layerTex = this.texture(w, h, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE)
    this.sceneT = this.target(w, h)
    this.accumT = this.target(w, h)
    let mw = w >> 1
    let mh = h >> 1
    for (let i = 0; i < 6; i++) {
      this.mips.push(this.target(Math.max(1, mw), Math.max(1, mh)))
      mw >>= 1
      mh >>= 1
    }
    gl.bindVertexArray(gl.createVertexArray())
  }

  program(vs: string, fs: string) {
    const gl = this.gl
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s) ?? 'shader error')
      return s
    }
    const p = gl.createProgram()!
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs))
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs))
    gl.linkProgram(p)
    if (!gl.getProgramParameter(p, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(p) ?? 'link error')
    return p
  }

  texture(
    w: number,
    h: number,
    internal: number,
    format: number,
    type: number
  ) {
    const gl = this.gl
    const t = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, t)
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return t
  }

  target(w: number, h: number): Target {
    const gl = this.gl
    const tex = this.texture(w, h, gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT)
    const fb = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0
    )
    return { fb, tex, w, h }
  }

  use(name: string) {
    const p = this.progs[name]!
    this.gl.useProgram(p)
    return p
  }

  uni(p: WebGLProgram, name: string) {
    return this.gl.getUniformLocation(p, name)
  }

  bindTarget(t: Target | null) {
    const gl = this.gl
    gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fb : null)
    gl.viewport(0, 0, t ? t.w : this.w, t ? t.h : this.h)
  }

  bindTex(unit: number, tex: WebGLTexture) {
    const gl = this.gl
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, tex)
  }

  planeTexture(plane: Plane) {
    const gl = this.gl
    let entry = this.planeTex.get(plane.canvas)
    if (!entry) {
      const tex = gl.createTexture()!
      entry = { tex, version: -1 }
      this.planeTex.set(plane.canvas, entry)
    }
    if (entry.version !== plane.version) {
      gl.bindTexture(gl.TEXTURE_2D, entry.tex)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        plane.canvas
      )
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR
      )
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      if (this.aniso)
        gl.texParameterf(
          gl.TEXTURE_2D,
          this.aniso.TEXTURE_MAX_ANISOTROPY_EXT,
          16
        )
      entry.version = plane.version
    }
    return entry.tex
  }

  drawPlanes(planes: Plane[]) {
    const gl = this.gl
    if (!planes.length) return
    const p = this.use('plane')
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    for (const plane of planes) {
      this.bindTex(0, this.planeTexture(plane))
      gl.uniform1i(this.uni(p, 'tex'), 0)
      gl.uniformMatrix4fv(this.uni(p, 'mvp'), false, plane.mvp)
      gl.uniform1f(this.uni(p, 'alpha'), plane.alpha)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    gl.disable(gl.BLEND)
  }

  beginFrame() {
    const gl = this.gl
    this.bindTarget(this.accumT)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  /** Composite one sub-frame (planes + 2D layer) and add it to the accumulator. */
  addSubframe(layer: HTMLCanvasElement, fx: Fx, weight: number) {
    const gl = this.gl
    this.bindTarget(this.sceneT)
    gl.clearColor(fx.bg[0], fx.bg[1], fx.bg[2], 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    this.drawPlanes(fx.planes)
    gl.bindTexture(gl.TEXTURE_2D, this.layerTex)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, layer)
    const p = this.use('layer')
    this.bindTex(0, this.layerTex)
    gl.uniform1i(this.uni(p, 'tex'), 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.disable(gl.BLEND)
    this.drawPlanes(fx.topPlanes)

    this.bindTarget(this.accumT)
    const a = this.use('accum')
    this.bindTex(0, this.sceneT.tex)
    gl.uniform1i(this.uni(a, 'tex'), 0)
    gl.uniform1f(this.uni(a, 'weight'), weight)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.disable(gl.BLEND)
  }

  finish(fx: Fx, frame: number) {
    const gl = this.gl
    // Bloom: bright pass → downsample chain → tent upsample back up.
    const mips = this.mips
    this.bindTarget(mips[0]!)
    let p = this.use('bright')
    this.bindTex(0, this.accumT.tex)
    gl.uniform1i(this.uni(p, 'tex'), 0)
    gl.uniform1f(this.uni(p, 'threshold'), fx.bloomThreshold)
    gl.uniform1f(this.uni(p, 'knee'), fx.bloomKnee)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    p = this.use('down')
    for (let i = 1; i < mips.length; i++) {
      this.bindTarget(mips[i]!)
      this.bindTex(0, mips[i - 1]!.tex)
      gl.uniform1i(this.uni(p, 'tex'), 0)
      gl.uniform2f(this.uni(p, 'texel'), 1 / mips[i - 1]!.w, 1 / mips[i - 1]!.h)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    p = this.use('up')
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE)
    for (let i = mips.length - 1; i > 0; i--) {
      this.bindTarget(mips[i - 1]!)
      this.bindTex(0, mips[i]!.tex)
      gl.uniform1i(this.uni(p, 'tex'), 0)
      gl.uniform2f(this.uni(p, 'texel'), 1 / mips[i]!.w, 1 / mips[i]!.h)
      gl.uniform1f(this.uni(p, 'radius'), 1.0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    gl.disable(gl.BLEND)

    this.bindTarget(null)
    p = this.use('final')
    this.bindTex(0, this.accumT.tex)
    this.bindTex(1, mips[0]!.tex)
    gl.uniform1i(this.uni(p, 'scene'), 0)
    gl.uniform1i(this.uni(p, 'bloomTex'), 1)
    gl.uniform2f(this.uni(p, 'res'), this.w, this.h)
    gl.uniform1f(this.uni(p, 'bloom'), fx.bloom)
    gl.uniform1f(this.uni(p, 'ca'), fx.ca)
    gl.uniform1f(this.uni(p, 'grain'), fx.grain)
    gl.uniform1f(this.uni(p, 'vignette'), fx.vignette)
    gl.uniform1f(this.uni(p, 'flash'), fx.flash)
    gl.uniform3f(this.uni(p, 'flashColor'), ...fx.flashColor)
    gl.uniform1f(this.uni(p, 'exposure'), fx.exposure)
    gl.uniform1f(this.uni(p, 'contrast'), fx.contrast)
    gl.uniform1f(this.uni(p, 'saturation'), fx.saturation)
    gl.uniform1f(this.uni(p, 'zoomBlur'), fx.zoomBlur)
    gl.uniform2f(
      this.uni(p, 'zoomCenter'),
      fx.zoomCenter[0],
      1 - fx.zoomCenter[1]
    )
    gl.uniform1f(this.uni(p, 'frame'), frame % 997)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.finish()
  }
}
