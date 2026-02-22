// src/components/MapView.jsx
import { useEffect, useRef, useState } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import './MapView.css'

function MapView() {
  const cesiumContainer = useRef(null)
  const [viewer, setViewer] = useState(null)

  // 左侧面板展开状态
  const [leftPanels, setLeftPanels] = useState({
    climate: true,
    time: true,
    ecmwf: false,
    presentation: false,
    splitScreen: false,
    selectLayer: false
  })

  // 右侧工具栏激活状态
  const [activeTool, setActiveTool] = useState(null)

  // 顶部工具栏面板显示状态
  const [topPanels, setTopPanels] = useState({
    projectManager: false,
    modelManager: false,
    layerManager: false,
    assessmentWizard: false,
    monitoringWizard: false
  })

  // 气候状态
  const [climate, setClimate] = useState({
    rain: false,
    snow: false,
    fog: 0,
    timezone: '8',
    month: 1,
    hour: 13,
    castShadows: false
  })

  // 切换左侧面板
  const toggleLeftPanel = (panel) => {
    setLeftPanels(prev => ({ ...prev, [panel]: !prev[panel] }))
  }

  // 切换顶部面板
  const toggleTopPanel = (panel) => {
    setTopPanels(prev => {
      const newState = {}
      Object.keys(prev).forEach(key => {
        newState[key] = key === panel ? !prev[key] : false
      })
      return newState
    })
  }

  // 激活工具
  const activateTool = (tool) => {
    setActiveTool(activeTool === tool ? null : tool)
  }

  // 初始化 Cesium
  useEffect(() => {
    const initViewer = new Cesium.Viewer(cesiumContainer.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: true,
      geocoder: true,
      homeButton: true,
      sceneModePicker: true,
      navigationHelpButton: false,
      infoBox: true,
      selectionIndicator: true,
    })

    initViewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(114.17, 22.32, 15000),
      duration: 2
    })

    setViewer(initViewer)
    return () => initViewer.destroy()
  }, [])

  return (
      <div className="map-wrapper">
        {/* ========== 顶部工具栏 ========== */}
        <header className="top-toolbar">
          <div className="toolbar-logo">
            <span>🌍 EA Planner</span>
          </div>
          <div className="toolbar-divider" />

          {/* 左侧工具组 */}
          <div className="toolbar-group">
            <button className="tool-btn" title="Location" onClick={() => alert('Location Selector')}>
              🌍
            </button>
            <button className="tool-btn" title="Home" onClick={() => {
              viewer?.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(114.17, 22.32, 15000),
                duration: 2
              })
            }}>
              🏠
            </button>
            <button
                className={`tool-btn ${topPanels.projectManager ? 'active' : ''}`}
                title="Project Manager"
                onClick={() => toggleTopPanel('projectManager')}
            >
              📁
            </button>
            <button
                className={`tool-btn ${topPanels.modelManager ? 'active' : ''}`}
                title="Model Manager"
                onClick={() => toggleTopPanel('modelManager')}
            >
              🏗️
            </button>
            <button
                className={`tool-btn ${topPanels.layerManager ? 'active' : ''}`}
                title="Layer Manager"
                onClick={() => toggleTopPanel('layerManager')}
            >
              🗂️
            </button>
          </div>

          <div className="toolbar-divider" />

          {/* 巫师工具组 */}
          <div className="toolbar-group">
            <button className="tool-btn" title="Climate Wizard" onClick={() => toggleLeftPanel('climate')}>
              🌤️
            </button>
            <button
                className={`tool-btn ${topPanels.assessmentWizard ? 'active' : ''}`}
                title="Assessment Wizard"
                onClick={() => toggleTopPanel('assessmentWizard')}
            >
              📊
            </button>
            <button
                className={`tool-btn ${topPanels.monitoringWizard ? 'active' : ''}`}
                title="Monitoring Wizard"
                onClick={() => toggleTopPanel('monitoringWizard')}
            >
              🔍
            </button>
            <button className="tool-btn" title="Presentation Wizard" onClick={() => toggleLeftPanel('presentation')}>
              🎬
            </button>
          </div>

          <div className="toolbar-spacer" />

          {/* 右侧图标 */}
          <div className="toolbar-icons">
            <button className="tool-btn" title="Search" onClick={() => alert('Search Location')}>🔍</button>
            <button className="tool-btn" title="Settings" onClick={() => alert('Settings')}>⚙️</button>
            <button className="tool-btn" title="Help" onClick={() => alert('Help')}>❓</button>
            <button className="tool-btn" title="User" onClick={() => alert('User Profile')}>👤</button>
            <button className="tool-btn primary" title="Logout" onClick={() => alert('Logout')}>➡️</button>
          </div>
        </header>

        {/* ========== 顶部面板区域 ========== */}
        {topPanels.projectManager && (
            <div className="top-panel project-manager-panel">
              <div className="panel-header">
                <h3>📁 Project Manager</h3>
                <button className="panel-close" onClick={() => toggleTopPanel('projectManager')}>×</button>
              </div>
              <div className="panel-content">
                <div className="project-list">
                  <div className="project-item">
                    <span className="project-code">MH IVE</span>
                    <span className="project-version">v1.0</span>
                    <span className="project-name">GSLS Tree Project</span>
                    <span className="project-stage">Initial Planning</span>
                    <div className="project-actions">
                      <button className="btn-sm">✏️ Edit</button>
                      <button className="btn-sm">📋 Copy</button>
                      <button className="btn-sm">⬇️ Download</button>
                      <button className="btn-sm danger">🗑️ Delete</button>
                    </div>
                  </div>
                </div>
                <button className="btn-primary mt-3">+ Create New Project</button>
              </div>
            </div>
        )}

        {topPanels.modelManager && (
            <div className="top-panel model-manager-panel">
              <div className="panel-header">
                <h3>🏗️ Model Manager</h3>
                <button className="panel-close" onClick={() => toggleTopPanel('modelManager')}>×</button>
              </div>
              <div className="panel-content">
                <div className="upload-section">
                  <label>Upload Models</label>
                  <p className="help-text">Supported formats: .3dm, .ifc, .obj, .skp, .tif, .geojson, .zip</p>
                  <input type="file" multiple accept=".3dm,.ifc,.obj,.skp,.tif,.geojson,.zip" />
                </div>
                <div className="model-list">
                  <p className="empty-state">No models uploaded yet</p>
                </div>
              </div>
            </div>
        )}

        {topPanels.layerManager && (
            <div className="top-panel layer-manager-panel">
              <div className="panel-header">
                <h3>🗂️ Layer Manager</h3>
                <button className="panel-close" onClick={() => toggleTopPanel('layerManager')}>×</button>
              </div>
              <div className="panel-content">
                <input type="text" className="search-input" placeholder="Search layers..." />
                <div className="layer-groups">
                  <div className="layer-group">
                    <h4>General</h4>
                    <label className="layer-item">
                      <input type="checkbox" /> OZP
                      <input type="range" className="layer-opacity" min="0" max="1" step="0.1" />
                    </label>
                    <label className="layer-item">
                      <input type="checkbox" /> District Boundaries
                      <input type="range" className="layer-opacity" min="0" max="1" step="0.1" />
                    </label>
                  </div>
                  <div className="layer-group">
                    <h4>Environmental</h4>
                    <label className="layer-item">
                      <input type="checkbox" /> Buildings
                      <input type="range" className="layer-opacity" min="0" max="1" step="0.1" />
                    </label>
                    <label className="layer-item">
                      <input type="checkbox" /> Bathing Beach
                      <input type="range" className="layer-opacity" min="0" max="1" step="0.1" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
        )}

        {topPanels.assessmentWizard && (
            <div className="top-panel assessment-panel">
              <div className="panel-header">
                <h3>📊 Assessment Wizard</h3>
                <button className="panel-close" onClick={() => toggleTopPanel('assessmentWizard')}>×</button>
              </div>
              <div className="panel-content">
                <div className="assessment-options">
                  <button className="assessment-btn">
                    <img src="/images/influence.png" alt="" width="24" />
                    <span>Influence Analysis</span>
                  </button>
                  <button className="assessment-btn">
                    <img src="/images/assessmentWizard/windAssesments.png" alt="" width="24" />
                    <span>Air Ventilation</span>
                  </button>
                  <button className="assessment-btn">
                    <img src="/images/assessmentWizard/noise.png" alt="" width="24" />
                    <span>Noise Impact Assessment</span>
                  </button>
                  <button className="assessment-btn">
                    <img src="/images/assessmentWizard/air.png" alt="" width="24" />
                    <span>Air Impact Assessment</span>
                  </button>
                </div>
              </div>
            </div>
        )}

        {topPanels.monitoringWizard && (
            <div className="top-panel monitoring-panel">
              <div className="panel-header">
                <h3>🔍 Ecological Monitoring</h3>
                <button className="panel-close" onClick={() => toggleTopPanel('monitoringWizard')}>×</button>
              </div>
              <div className="panel-content">
                <div className="monitoring-types">
                  <div className="monitoring-card">
                    <img src="/images/monitorWizard/camera.png" alt="" width="32" />
                    <h4>CCTV Cameras</h4>
                    <p>View live camera feeds</p>
                    <button className="btn-sm">Open Dashboard</button>
                  </div>
                  <div className="monitoring-card">
                    <img src="/images/monitorWizard/sound-sensor.png" alt="" width="32" />
                    <h4>Sound Sensors</h4>
                    <p>Monitor noise levels</p>
                    <button className="btn-sm">Open Dashboard</button>
                  </div>
                  <div className="monitoring-card">
                    <img src="/images/monitorWizard/monitoring-devices.png" alt="" width="32" />
                    <h4>Bird Monitoring</h4>
                    <p>Track bird activity</p>
                    <button className="btn-sm">Open Dashboard</button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* ========== 左侧侧边栏 ========== */}
        <aside className="sidebar">

          {/* Climate Visualization */}
          <div className="sub-panel">
            <a className="model-section-header" onClick={() => toggleLeftPanel('climate')}>
              <span>🌤️ Climate Visualization</span>
              <i className={`fa-solid ${leftPanels.climate ? 'fa-minus' : 'fa-plus'}`}></i>
            </a>
            {leftPanels.climate && (
                <div className="model-section-content p-3">
                  <label className="checkbox-item">
                    <input type="checkbox" checked={climate.rain} onChange={(e) => setClimate({...climate, rain: e.target.checked})} />
                    <span>🌧️ Rain</span>
                  </label>
                  <label className="checkbox-item disabled">
                    <input type="checkbox" disabled />
                    <span>💨 Wind</span>
                  </label>
                  <label className="checkbox-item">
                    <input type="checkbox" checked={climate.snow} onChange={(e) => setClimate({...climate, snow: e.target.checked})} />
                    <span>❄️ Snow</span>
                  </label>
                  <div className="slider-item">
                    <span>🌫️ Fog</span>
                    <input type="range" className="form-range" min="0" max="100" value={climate.fog} onChange={(e) => setClimate({...climate, fog: parseInt(e.target.value)})} />
                  </div>
                </div>
            )}
          </div>

          {/* Time */}
          <div className="sub-panel">
            <a className="model-section-header" onClick={() => toggleLeftPanel('time')}>
              <span>⏰ Time</span>
              <i className={`fa-solid ${leftPanels.time ? 'fa-minus' : 'fa-plus'}`}></i>
            </a>
            {leftPanels.time && (
                <div className="model-section-content p-3">
                  <div className="form-group">
                    <label>Timezone</label>
                    <select className="form-select" value={climate.timezone} onChange={(e) => setClimate({...climate, timezone: e.target.value})}>
                      <option value="8">(UTC+08:00) Beijing, Hong Kong</option>
                      <option value="0">(UTC+00:00) London, Edinburgh</option>
                      <option value="-5">(UTC-05:00) Eastern Time (US & Canada)</option>
                      <option value="9">(UTC+09:00) Tokyo, Seoul</option>
                    </select>
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <label>Month</label>
                      <input type="range" className="form-range" min="0" max="11" value={climate.month} onChange={(e) => setClimate({...climate, month: parseInt(e.target.value)})} />
                      <span className="range-value">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][climate.month]}</span>
                    </div>
                    <div className="col-6">
                      <label>Time</label>
                      <input type="range" className="form-range" min="0" max="23" value={climate.hour} onChange={(e) => setClimate({...climate, hour: parseInt(e.target.value)})} />
                      <span className="range-value">{climate.hour.toString().padStart(2,'0')}:45</span>
                    </div>
                  </div>
                  <div className="time-display">
                <span className="badge">
                  {['January','February','March','April','May','June','July','August','September','October','November','December'][climate.month]}, {climate.hour.toString().padStart(2,'0')}:45
                </span>
                  </div>
                  <label className="form-check form-switch mt-3">
                    <input type="checkbox" checked={climate.castShadows} onChange={(e) => setClimate({...climate, castShadows: e.target.checked})} />
                    <span>Cast shadows</span>
                  </label>
                </div>
            )}
          </div>

          {/* ECMWF Weather Forecast */}
          <div className="sub-panel">
            <a className="model-section-header" onClick={() => toggleLeftPanel('ecmwf')}>
              <span>🌦️ ECMWF Weather Forecast</span>
              <i className={`fa-solid ${leftPanels.ecmwf ? 'fa-minus' : 'fa-plus'}`}></i>
            </a>
            {leftPanels.ecmwf && (
                <div className="model-section-content p-3">
                  <div className="ecmwf-layers">
                    <button className="layer-option selected">Hide all</button>
                    <button className="layer-option">Pressure Level (1000 hPa)</button>
                    <button className="layer-option">Pressure Level (500 hPa)</button>
                  </div>
                </div>
            )}
          </div>

          {/* Presentation Wizard */}
          <div className="sub-panel">
            <a className="model-section-header" onClick={() => toggleLeftPanel('presentation')}>
              <span>🎬 Presentation Wizard</span>
              <i className={`fa-solid ${leftPanels.presentation ? 'fa-minus' : 'fa-plus'}`}></i>
            </a>
            {leftPanels.presentation && (
                <div className="model-section-content p-3">
                  <label className="form-check mb-3">
                    <input type="checkbox" />
                    <span>Hide All Menus</span>
                  </label>
                  <div className="sky-colour-section">
                    <div className="mb-2">Sky Colour</div>
                    <div className="d-flex">
                      <div className="flex-grow-1 px-1">
                        <div className="text-center mb-1">Left Side</div>
                        <input type="range" className="form-range blue-gradient-slider" />
                      </div>
                      <div className="flex-grow-1 px-1">
                        <div className="text-center mb-1">Right Side</div>
                        <input type="range" className="form-range blue-gradient-slider" />
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* Split Screen */}
          <div className="sub-panel">
            <a className="model-section-header" onClick={() => toggleLeftPanel('splitScreen')}>
              <span>🖥️ Split Screen</span>
              <i className={`fa-solid ${leftPanels.splitScreen ? 'fa-minus' : 'fa-plus'}`}></i>
            </a>
            {leftPanels.splitScreen && (
                <div className="model-section-content p-3">
                  <label className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" />
                    <span>Split screen</span>
                  </label>
                  <div className="mb-3">
                    <label>Left screen</label>
                    <select className="form-select mb-2">
                      <option>Select Project</option>
                    </select>
                    <button className="btn-upload">📁 Choose File - No file chosen</button>
                  </div>
                  <div className="mb-3">
                    <label>Right screen</label>
                    <select className="form-select mb-2">
                      <option>Select Project</option>
                    </select>
                    <button className="btn-upload">📁 Choose File - No file chosen</button>
                  </div>
                  <label className="form-check">
                    <input type="checkbox" defaultChecked />
                    <span>Synchronise camera positions</span>
                  </label>
                </div>
            )}
          </div>

          {/* Select Layer */}
          <div className="sub-panel">
            <a className="model-section-header" onClick={() => toggleLeftPanel('selectLayer')}>
              <span>🗂️ Select Layer</span>
              <i className={`fa-solid ${leftPanels.selectLayer ? 'fa-minus' : 'fa-plus'}`}></i>
            </a>
            {leftPanels.selectLayer && (
                <div className="model-section-content p-3">
                  <div className="mb-3">3D Mass Visualizer</div>
                  <label className="checkbox-item">
                    <input type="checkbox" />
                    <span>Noise</span>
                  </label>
                  <label className="checkbox-item">
                    <input type="checkbox" />
                    <span>Air Quality</span>
                  </label>
                  <label className="checkbox-item">
                    <input type="checkbox" />
                    <span>Air Flow</span>
                  </label>
                </div>
            )}
          </div>

        </aside>

        {/* ========== 右侧工具栏 ========== */}
        <aside className="right-toolbar">
          <button className={`tool-btn ${activeTool === 'viewpoint' ? 'active' : ''}`} title="Viewpoint Manager" onClick={() => activateTool('viewpoint')}>📍</button>
          <button className={`tool-btn ${activeTool === 'construct' ? 'active' : ''}`} title="Construct Building" onClick={() => activateTool('construct')}>🏢</button>
          <button className={`tool-btn ${activeTool === 'georef' ? 'active' : ''}`} title="Geo Reference" onClick={() => activateTool('georef')}>🗺️</button>
          <button className={`tool-btn ${activeTool === 'measure' ? 'active' : ''}`} title="Measure Distance" onClick={() => activateTool('measure')}>📏</button>
          <button className={`tool-btn ${activeTool === 'move' ? 'active' : ''}`} title="Move Model" onClick={() => activateTool('move')}>✏️</button>
          <button className={`tool-btn ${activeTool === 'rotate' ? 'active' : ''}`} title="Rotate Model" onClick={() => activateTool('rotate')}>🔄</button>
          <button className={`tool-btn ${activeTool === 'height' ? 'active' : ''}`} title="Adjust Height" onClick={() => activateTool('height')}>⬆️</button>
          <button className={`tool-btn ${activeTool === 'scale' ? 'active' : ''}`} title="Scale Model" onClick={() => activateTool('scale')}>📐</button>
          <button className={`tool-btn ${activeTool === 'cutter' ? 'active' : ''}`} title="Cutter" onClick={() => activateTool('cutter')}>✂️</button>
          <button className={`tool-btn ${activeTool === 'reset' ? 'active' : ''}`} title="Reset" onClick={() => activateTool('reset')}>🔁</button>
          <button className="tool-btn" title="Export" onClick={() => alert('Export Project')}>📤</button>
          <button className="tool-btn" title="Share" onClick={() => alert('Share Link')}>🔗</button>
        </aside>

        {/* ========== 工具激活提示 ========== */}
        {activeTool && (
            <div className="tool-activation-toast">
              <span>✅ {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)} Tool Activated</span>
              <p className="tool-hint">Click on the map to start using this tool</p>
            </div>
        )}

        {/* Cesium 地图容器 */}
        <div ref={cesiumContainer} className="cesium-container"></div>
      </div>
  )
}

export default MapView