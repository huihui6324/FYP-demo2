// src/components/wizards/ClimateWizard.jsx
import { useState, useEffect, useRef } from 'react'
import * as Cesium from 'cesium'

function ClimateWizard({ viewer }) {
  const [expandedPanels, setExpandedPanels] = useState({
    climate: true,
    time: true,
    ecmwf: false
  })

  const [climate, setClimate] = useState({
    rain: false,
    snow: false,
    fog: 0,
    sun: 50,
    timezone: '8',
    month: 1,
    hour: 13,
    castShadows: false
  })

  const [ecmwfLayers, setEcmwfLayers] = useState({
    hideAll: true,
    pressure1000: false,
    pressure500: false
  })

  // 存储粒子系统引用
  const rainSystem = useRef(null)
  const snowSystem = useRef(null)

  const togglePanel = (panel) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }))
  }

  // 创建雨效果
  const createRainEffect = (viewer) => {
    if (!viewer) return

    // 移除现有雨效果
    if (rainSystem.current) {
      viewer.scene.primitives.remove(rainSystem.current)
    }

    // 创建新的雨粒子系统
    rainSystem.current = viewer.scene.primitives.add(
      new Cesium.ParticleSystem({
        image: '/raindrop.png', // 需要雨滴图片，或用下面的替代方案
        startColor: Cesium.Color.LIGHTBLUE.withAlpha(0.5),
        endColor: Cesium.Color.LIGHTBLUE.withAlpha(0.1),
        startScale: 1.0,
        endScale: 1.0,
        minimumParticleLife: 1.0,
        maximumParticleLife: 2.0,
        minimumSpeed: 10.0,
        maximumSpeed: 20.0,
        imageSize: new Cesium.Cartesian2(10, 10),
        emissionRate: 5000,
        lifetime: 16.0,
        systemLifeTime: 1000.0,
        loop: true,
        emitter: new Cesium.BoxEmitter(
          new Cesium.Cartesian3(100000, 100000, 10000)
        ),
        modelMatrix: Cesium.Matrix4.fromTranslation(
          Cesium.Cartesian3.fromDegrees(114.17, 22.32, 1000)
        ),
        force: {
          minimum: new Cesium.Cartesian3(0, 0, -10),
          maximum: new Cesium.Cartesian3(0, 0, -20)
        }
      })
    )
  }

  // 创建雪效果
  const createSnowEffect = (viewer) => {
    if (!viewer) return

    if (snowSystem.current) {
      viewer.scene.primitives.remove(snowSystem.current)
    }

    snowSystem.current = viewer.scene.primitives.add(
      new Cesium.ParticleSystem({
        image: '/snowflake.png',
        startColor: Cesium.Color.WHITE.withAlpha(0.8),
        endColor: Cesium.Color.WHITE.withAlpha(0.1),
        startScale: 1.0,
        endScale: 1.0,
        minimumParticleLife: 3.0,
        maximumParticleLife: 5.0,
        minimumSpeed: 2.0,
        maximumSpeed: 5.0,
        imageSize: new Cesium.Cartesian2(8, 8),
        emissionRate: 3000,
        lifetime: 16.0,
        systemLifeTime: 1000.0,
        loop: true,
        emitter: new Cesium.BoxEmitter(
          new Cesium.Cartesian3(100000, 100000, 10000)
        ),
        modelMatrix: Cesium.Matrix4.fromTranslation(
          Cesium.Cartesian3.fromDegrees(114.17, 22.32, 1000)
        ),
        force: {
          minimum: new Cesium.Cartesian3(0, 0, -2),
          maximum: new Cesium.Cartesian3(0, 0, -5)
        }
      })
    )
  }

  // 清除天气效果
  const clearWeatherEffects = () => {
    if (!viewer) return

    if (rainSystem.current) {
      viewer.scene.primitives.remove(rainSystem.current)
      rainSystem.current = null
    }

    if (snowSystem.current) {
      viewer.scene.primitives.remove(snowSystem.current)
      snowSystem.current = null
    }
  }

  const handleClimateChange = (key, value) => {
    setClimate(prev => ({ ...prev, [key]: value }))

    if (!viewer) return

    // 应用气候效果
    if (key === 'castShadows') {
      viewer.scene.globe.enableLighting = value
    }

    if (key === 'sun') {
      // 控制光照强度
      viewer.scene.brightness = value / 50
    }

    if (key === 'fog') {
      // 控制雾效果
      viewer.scene.fog.enabled = value > 0
      viewer.scene.fog.density = value / 7000
    }

    if (key === 'hour' || key === 'month') {
      const date = new Date(2026, climate.month || 0, 21, climate.hour || 0, 45)
      viewer.clock.currentTime = Cesium.JulianDate.fromDate(date)
    }

    // 雨效果
    if (key === 'rain') {
      if (value) {
        createRainEffect(viewer)
      } else {
        if (rainSystem.current) {
          viewer.scene.primitives.remove(rainSystem.current)
          rainSystem.current = null
        }
      }
    }

    // 雪效果
    if (key === 'snow') {
      if (value) {
        createSnowEffect(viewer)
      } else {
        if (snowSystem.current) {
          viewer.scene.primitives.remove(snowSystem.current)
          snowSystem.current = null
        }
      }
    }
  }

  const toggleEcmwfLayer = (layer) => {
    setEcmwfLayers(prev => {
      const newState = {
        hideAll: false,
        pressure1000: false,
        pressure500: false
      }
      newState[layer] = !prev[layer]
      return newState
    })
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  // 清理效果
  useEffect(() => {
    return () => {
      clearWeatherEffects()
    }
  }, [])

  return (
    <div className="climate-wizard">

      {/* Climate Visualization Panel */}
      <div className="sub-panel">
        <div className="model-section-header" onClick={() => togglePanel('climate')}>
          <span>🌤️ Climate Visualization</span>
          <i className={`fa-solid ${expandedPanels.climate ? 'fa-minus' : 'fa-plus'}`}></i>
        </div>

        {expandedPanels.climate && (
          <div className="model-section-content p-3">
            <div className="climate-options">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={climate.rain}
                  onChange={(e) => handleClimateChange('rain', e.target.checked)}
                />
                <span>🌧️ Rain</span>
              </label>

              <label className="checkbox-item disabled">
                <input type="checkbox" disabled />
                <span>💨 Wind</span>
              </label>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={climate.snow}
                  onChange={(e) => handleClimateChange('snow', e.target.checked)}
                />
                <span>❄️ Snow</span>
              </label>

              <div className="slider-item">
                <span>🌫️ Fog</span>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="7000"
                  value={climate.fog}
                  onChange={(e) => handleClimateChange('fog', parseInt(e.target.value))}
                />
              </div>

              <div className="slider-item">
                <span>☀️ Sun</span>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="100"
                  value={climate.sun}
                  onChange={(e) => handleClimateChange('sun', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Time Control Panel */}
      <div className="sub-panel">
        <div className="model-section-header" onClick={() => togglePanel('time')}>
          <span>⏰ Time</span>
          <i className={`fa-solid ${expandedPanels.time ? 'fa-minus' : 'fa-plus'}`}></i>
        </div>

        {expandedPanels.time && (
          <div className="model-section-content p-3">
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                className="form-select"
                value={climate.timezone}
                onChange={(e) => handleClimateChange('timezone', e.target.value)}
              >
                <option value="-12">(UTC-12:00) International Date Line West</option>
                <option value="-5">(UTC-05:00) Eastern Time (US & Canada)</option>
                <option value="0">(UTC+00:00) London, Edinburgh</option>
                <option value="8">(UTC+08:00) Beijing, Hong Kong</option>
                <option value="9">(UTC+09:00) Tokyo, Seoul</option>
              </select>
            </div>

            <div className="row g-3">
              <div className="col-6">
                <label className="form-label">Month</label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="11"
                  value={climate.month}
                  onChange={(e) => handleClimateChange('month', parseInt(e.target.value))}
                />
                <span className="range-value">{monthNames[climate.month]}</span>
              </div>
              <div className="col-6">
                <label className="form-label">Time</label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="23"
                  value={climate.hour}
                  onChange={(e) => handleClimateChange('hour', parseInt(e.target.value))}
                />
                <span className="range-value">{climate.hour.toString().padStart(2,'0')}:45</span>
              </div>
            </div>

            <div className="time-display">
              <span className="badge">
                {monthNames[climate.month]}, {climate.hour.toString().padStart(2,'0')}:45
              </span>
            </div>

            <label className="form-check form-switch mt-3">
              <input
                type="checkbox"
                checked={climate.castShadows}
                onChange={(e) => handleClimateChange('castShadows', e.target.checked)}
              />
              <span>Cast shadows</span>
            </label>
          </div>
        )}
      </div>

      {/* ECMWF Weather Forecast Panel */}
      <div className="sub-panel">
        <div className="model-section-header" onClick={() => togglePanel('ecmwf')}>
          <span>🌦️ ECMWF Weather Forecast</span>
          <i className={`fa-solid ${expandedPanels.ecmwf ? 'fa-minus' : 'fa-plus'}`}></i>
        </div>

        {expandedPanels.ecmwf && (
          <div className="model-section-content p-3">
            <div className="ecmwf-layers">
              <button
                className={`layer-option ${ecmwfLayers.hideAll ? 'selected' : ''}`}
                onClick={() => setEcmwfLayers({ hideAll: true, pressure1000: false, pressure500: false })}
              >
                Hide all
              </button>

              <button
                className={`layer-option ${ecmwfLayers.pressure1000 ? 'selected' : ''}`}
                onClick={() => toggleEcmwfLayer('pressure1000')}
              >
                Pressure Level (1000 hPa)
              </button>

              <button
                className={`layer-option ${ecmwfLayers.pressure500 ? 'selected' : ''}`}
                onClick={() => toggleEcmwfLayer('pressure500')}
              >
                Pressure Level (500 hPa)
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

export default ClimateWizard