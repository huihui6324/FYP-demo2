import React, { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import '../Sidebar.css'

export default function ClimatePanel({ climate, setClimate, viewer, isExpanded, onToggle }) {
  const rainStageRef = useRef(null)
  const snowStageRef = useRef(null)
  const fogStageRef = useRef(null)

  // 处理雾效：Cesium 原生雾 + 屏幕后处理雾，让滑条变化更明显
  useEffect(() => {
    if (!viewer) return

    const scene = viewer.scene
    const { postProcessStages } = scene

    if (!fogStageRef.current) {
      fogStageRef.current = postProcessStages.add(
        new Cesium.PostProcessStage({
          name: 'weather-fog-overlay-stage',
          fragmentShader: `
            uniform sampler2D colorTexture;
            uniform sampler2D depthTexture;
            in vec2 v_textureCoordinates;
            uniform float fogIntensity;
            uniform vec3 fogTint;

            void main(void) {
              vec4 base = texture(colorTexture, v_textureCoordinates);
              float depth = czm_readDepth(depthTexture, v_textureCoordinates);

              // 将深度映射到更平滑的雾权重（近处轻，远处重）
              float depthFactor = smoothstep(0.72, 1.0, depth);
              float amount = clamp(fogIntensity * (0.25 + depthFactor), 0.0, 0.9);

              vec3 mixed = mix(base.rgb, fogTint, amount);
              out_FragColor = vec4(mixed, base.a);
            }
          `,
          uniforms: {
            fogIntensity: () => climate.fog / 100,
            fogTint: () => {
              const base = 0.72 + climate.fog / 500
              const channel = Math.min(base, 0.92)
              return new Cesium.Cartesian3(channel, channel, channel + 0.02)
            }
          }
        })
      )
    }

    const fogRatio = climate.fog / 100
    scene.fog.enabled = climate.fog > 0
    scene.fog.density = fogRatio * fogRatio * 0.035
    scene.fog.minimumBrightness = 0.2
    scene.fog.screenSpaceErrorFactor = 2.0 + fogRatio * 5
    fogStageRef.current.enabled = climate.fog > 0

    return () => {
      if (fogStageRef.current) {
        postProcessStages.remove(fogStageRef.current)
        fogStageRef.current = null
      }
    }
  }, [viewer, climate.fog])

  // 处理雨雪屏幕后处理效果（确保在任意相机高度都可见）
  useEffect(() => {
    if (!viewer) return

    const scene = viewer.scene
    const { postProcessStages } = scene

    if (rainStageRef.current) {
      postProcessStages.remove(rainStageRef.current)
      rainStageRef.current = null
    }
    if (snowStageRef.current) {
      postProcessStages.remove(snowStageRef.current)
      snowStageRef.current = null
    }

    const createRainStage = () => postProcessStages.add(new Cesium.PostProcessStage({
      name: 'weather-rain-stage',
      fragmentShader: `
        uniform sampler2D colorTexture;
        in vec2 v_textureCoordinates;
        float hash(float x){ return fract(sin(x * 133.3) * 13.13); }
        void main(void){
          float time = czm_frameNumber / 60.0;
          vec2 resolution = czm_viewport.zw;
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
          vec3 c = vec3(.6,.7,.8);
          float a = -0.35;
          float si = sin(a), co = cos(a);
          uv *= mat2(co, -si, si, co);
          uv *= length(uv + vec2(0, 4.9)) * .25 + 1.0;
          float v = 1.0 - sin(hash(floor(uv.x * 80.0)) * 2.0);
          float b = clamp(abs(sin(20.0 * time * v + uv.y * 5.0)) - .95, 0.0, 1.0) * 20.0;
          c *= v * b * 0.55;
          vec4 base = texture(colorTexture, v_textureCoordinates);
          out_FragColor = vec4(base.rgb + c, base.a);
        }
      `
    }))

    const createSnowStage = () => postProcessStages.add(new Cesium.PostProcessStage({
      name: 'weather-snow-stage',
      fragmentShader: `
        uniform sampler2D colorTexture;
        in vec2 v_textureCoordinates;
        float snow(vec2 uv, float scale){
          float time = czm_frameNumber / 60.0;
          float w = smoothstep(1.0, 0.0, -uv.y * (scale / 10.0));
          if (w < 0.1) return 0.0;
          uv += time / scale;
          uv.y += time * 2.0 / scale;
          uv.x += sin(uv.y + time * 0.5) / scale;
          uv *= scale;
          vec2 s = floor(uv), f = fract(uv), p;
          float k = 3.0, d;
          p = .5 + .35 * sin(11.0 * fract(sin((s + scale) * mat2(7,3,6,5)) * 5.0)) - f;
          d = length(p);
          k = min(d, k);
          k = smoothstep(0.0, k, sin(f.x + f.y) * 0.01);
          return k * w;
        }
        void main(void){
          vec2 resolution = czm_viewport.zw;
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
          float c = 0.0;
          c += snow(uv, 30.0) * 0.0;
          c += snow(uv, 20.0) * 0.0;
          c += snow(uv, 15.0) * 0.0;
          c += snow(uv, 10.0);
          c += snow(uv, 8.0);
          c += snow(uv, 6.0);
          vec3 snowColor = vec3(c) * 0.6;
          vec4 base = texture(colorTexture, v_textureCoordinates);
          out_FragColor = vec4(base.rgb + snowColor, base.a);
        }
      `
    }))

    if (climate.rain) {
      rainStageRef.current = createRainStage()
    }
    if (climate.snow) {
      snowStageRef.current = createSnowStage()
    }

    return () => {
      if (rainStageRef.current) {
        postProcessStages.remove(rainStageRef.current)
        rainStageRef.current = null
      }
      if (snowStageRef.current) {
        postProcessStages.remove(snowStageRef.current)
        snowStageRef.current = null
      }
    }
  }, [viewer, climate.rain, climate.snow])

  return (
    <div className="sub-panel">
      <a className="model-section-header" onClick={onToggle}>
        <span><span className="emoji">🌤️</span> Climate Visualization</span>
        <i className={`fa-solid ${isExpanded ? 'fa-minus' : 'fa-plus'}`}></i>
      </a>
      {isExpanded && (
        <div className="model-section-content p-3">
          <label className="checkbox-item">
            <input type="checkbox" checked={climate.rain} onChange={(e) => setClimate({...climate, rain: e.target.checked})} />
            <span><span className="emoji">🌧️</span> Rain</span>
          </label>
          <label className="checkbox-item disabled">
            <input type="checkbox" disabled />
            <span><span className="emoji">💨</span> Wind</span>
          </label>
          <label className="checkbox-item">
            <input type="checkbox" checked={climate.snow} onChange={(e) => setClimate({...climate, snow: e.target.checked})} />
            <span><span className="emoji">❄️</span> Snow</span>
          </label>
          <div className="slider-item">
            <span><span className="emoji">🌫️</span> Fog</span>
            <input type="range" className="form-range" min="0" max="100" value={climate.fog} onChange={(e) => setClimate({...climate, fog: parseInt(e.target.value)})} />
          </div>
        </div>
      )}
    </div>
  )
}
