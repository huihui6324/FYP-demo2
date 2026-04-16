// src/components/Sidebar/ClimatePanel.jsx
import React, { useEffect, useRef } from 'react'

export default function ClimatePanel({ climate, setClimate, viewer, isExpanded, onToggle }) {
  const rainEffectRef = useRef(null)
  const snowEffectRef = useRef(null)

  // 处理雾效
  useEffect(() => {
    if (!viewer) return
    
    const scene = viewer.scene
    if (climate.fog > 0) {
      scene.fog.enabled = true
      scene.fog.density = climate.fog / 2000
      scene.fog.screenSpaceErrorFactor = 2.0
    } else {
      scene.fog.enabled = false
    }
  }, [viewer, climate.fog])

  // 处理雨雪粒子效果
  useEffect(() => {
    if (!viewer) return

    // 清理旧的粒子系统
    if (rainEffectRef.current) {
      viewer.scene.primitives.remove(rainEffectRef.current)
      rainEffectRef.current = null
    }
    if (snowEffectRef.current) {
      viewer.scene.primitives.remove(snowEffectRef.current)
      snowEffectRef.current = null
    }

    const scene = viewer.scene

    // 辅助函数：创建粒子系统
    const createParticleSystem = (type) => {
      const isRain = type === 'rain'
      
      // 使用相机当前位置作为发射中心
      const cameraPosition = viewer.camera.positionCartographic
      const emissionOrigin = Cesium.Cartesian3.fromRadians(
        cameraPosition.longitude,
        cameraPosition.latitude,
        cameraPosition.height + 500
      )

      return scene.primitives.add(new Cesium.ParticleSystem({
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        
        startColor: isRain 
          ? new Cesium.Color(0.5, 0.5, 0.8, 0.8)
          : new Cesium.Color(1.0, 1.0, 1.0, 0.9),
        
        endColor: isRain
          ? new Cesium.Color(0.5, 0.5, 0.8, 0.1)
          : new Cesium.Color(1.0, 1.0, 1.0, 0.1),
        
        startScale: isRain ? 0.5 : 1.5,
        endScale: isRain ? 0.1 : 2.0,
        
        minimumParticleLife: 1.2,
        maximumParticleLife: 2.5,
        
        minimumSpeed: isRain ? 150 : 20,
        maximumSpeed: isRain ? 200 : 40,
        
        imageSize: new Cesium.Cartesian2(isRain ? 2 : 6, isRain ? 10 : 6),
        
        emissionRate: isRain ? 5000 : 3000,
        
        lifetime: 16.0,
        
        emitter: new Cesium.SphereEmitter(isRain ? 200 : 400),
        
        emitterModelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(emissionOrigin),
        
        modelMatrix: Cesium.Matrix4.IDENTITY,
        
        force: new Cesium.Cartesian3(0, 0, isRain ? -9.8 * 20 : -1.0),
        
        sizeInMeters: true
      }))
    }

    console.log("ClimatePanel: Updating effects", { rain: climate.rain, snow: climate.snow })

    if (climate.rain) {
      try {
        rainEffectRef.current = createParticleSystem('rain')
        console.log("Rain effect created successfully")
      } catch (e) {
        console.error("Failed to create rain effect:", e)
      }
    }

    if (climate.snow) {
      try {
        snowEffectRef.current = createParticleSystem('snow')
        console.log("Snow effect created successfully")
      } catch (e) {
        console.error("Failed to create snow effect:", e)
      }
    }

    // 清理函数
    return () => {
      if (rainEffectRef.current) {
        viewer.scene.primitives.remove(rainEffectRef.current)
        rainEffectRef.current = null
      }
      if (snowEffectRef.current) {
        viewer.scene.primitives.remove(snowEffectRef.current)
        snowEffectRef.current = null
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
