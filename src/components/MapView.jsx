// src/components/MapView.jsx
import { useEffect, useRef, useState } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import './MapView.css'

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODYzMGVjNy1hOGZmLTQzNTMtOGNiNC0wNmMzMzU3YjJmYzEiLCJpZCI6NDEzOTgzLCJpYXQiOjE3NzUzNzIwMDN9.alkn5QrNOGKTVFb4sx9jufiPe8LiOZQ3ruN0sihnJSU'

function MapView() {
  const cesiumContainer = useRef(null)
  const [viewer, setViewer] = useState(null)

  // 当前激活的面板
  const [activePanel, setActivePanel] = useState(null)

  // 各面板展开状态
  const [expandedSections, setExpandedSections] = useState({
    // Model Manager
    uploadModels: true,
    modelProperties: true,
    modelLibrary: false,

    // Assessment Manager
    viewAssessments: true,
    influenceAnalysis: true,
    uploadAssessment: false,
    airVentilation: false,

    // Climate Wizard
    climateVisualization: true,
    timeControl: true,
    ecmwfWeather: false,

    // Presentation Wizard
    presentationSettings: true,
    splitScreen: true,
    selectLayer: true,

    // Layer Manager
    layersTree: true,
    threeDLandscapes: true,

    // Viewpoint Manager
    viewpoints: true,
    flightpaths: false,

    // Annotation Manager
    textAnnotation: true,
    markerAnnotation: false
  })

  // 右侧工具栏激活状态
  const [activeTool, setActiveTool] = useState(null)

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

  // 缓冲区状态
  const [buffer, setBuffer] = useState(100)
  const [bufferDrawn, setBufferDrawn] = useState(false)

  // 图层状态
  const [layers, setLayers] = useState({
    ozp: false,
    boundaries: false,
    buildings: true,
    bathingBeach: false
  })

  // 切换面板
  const togglePanel = (panel) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  // 切换子面板
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // 激活工具
  const activateTool = (tool) => {
    setActiveTool(activeTool === tool ? null : tool)
  }

  // 处理气候变更
  const handleClimateChange = (key, value) => {
    setClimate(prev => ({ ...prev, [key]: value }))

    if (viewer) {
      if (key === 'castShadows') {
        viewer.scene.globe.enableLighting = value
      }
      if (key === 'hour' || key === 'month') {
        const date = new Date(2026, climate.month, 21, climate.hour, 45)
        viewer.clock.currentTime = Cesium.JulianDate.fromDate(date)
      }
    }
  }

  // 绘制缓冲区
  const drawBuffer = () => {
    if (!viewer) return

    viewer.entities.removeById('buffer-entity')

    viewer.entities.add({
      id: 'buffer-entity',
      position: Cesium.Cartesian3.fromDegrees(114.17, 22.32),
      ellipse: {
        semiMinorAxis: buffer,
        semiMajorAxis: buffer,
        material: Cesium.Color.BLUE.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.BLUE
      }
    })

    setBufferDrawn(true)
  }

  // 删除缓冲区
  const deleteBuffer = () => {
    if (!viewer) return
    viewer.entities.removeById('buffer-entity')
    setBufferDrawn(false)
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

  // 应用气候设置
  useEffect(() => {
    if (!viewer) return

    viewer.scene.globe.enableLighting = climate.castShadows

    const date = new Date(2026, climate.month, 21, climate.hour, 45)
    viewer.clock.currentTime = Cesium.JulianDate.fromDate(date)
  }, [climate, viewer])

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="map-wrapper">

      {/* ========== 顶部工具栏 ========== */}
      <header className="top-toolbar">
        <div className="toolbar-logo">
          <img src="/vite.svg" alt="EA Planner" className="logo-img" />
          <span>EA Planner</span>
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
          <button className="tool-btn" title="Project Manager" onClick={() => alert('Project Manager')}>
            📁
          </button>
          <button
            className={`tool-btn ${activePanel === 'modelManager' ? 'active' : ''}`}
            title="Model Manager"
            onClick={() => togglePanel('modelManager')}
          >
            🏗️
          </button>
          <button
            className={`tool-btn ${activePanel === 'layerManager' ? 'active' : ''}`}
            title="Layer Manager"
            onClick={() => togglePanel('layerManager')}
          >
            🗂️
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* Wizard 工具组 */}
        <div className="toolbar-group">
          <button
            className={`tool-btn ${activePanel === 'climateWizard' ? 'active' : ''}`}
            title="Climate Wizard"
            onClick={() => togglePanel('climateWizard')}
          >
            🌤️
          </button>
          <button
            className={`tool-btn ${activePanel === 'assessmentManager' ? 'active' : ''}`}
            title="Assessment Wizard"
            onClick={() => togglePanel('assessmentManager')}
          >
            📊
          </button>
          <button
            className={`tool-btn ${activePanel === 'monitoringWizard' ? 'active' : ''}`}
            title="Monitoring Wizard"
            onClick={() => togglePanel('monitoringWizard')}
          >
            🔍
          </button>
          <button
            className={`tool-btn ${activePanel === 'presentationWizard' ? 'active' : ''}`}
            title="Presentation Wizard"
            onClick={() => togglePanel('presentationWizard')}
          >
            🎬
          </button>
        </div>

        <div className="toolbar-spacer" />

        {/* 右侧图标 */}
        <div className="toolbar-icons">
          <button className="tool-btn" title="Search" onClick={() => alert('Search')}>🔍</button>
          <button className="tool-btn" title="Settings" onClick={() => alert('Settings')}>⚙️</button>
          <button className="tool-btn" title="Help" onClick={() => alert('Help')}>❓</button>
          <button className="tool-btn" title="User" onClick={() => alert('User Profile')}>👤</button>
          <button className="tool-btn primary" title="Logout" onClick={() => alert('Logout')}>➡️</button>
        </div>
      </header>

      {/* ========== 左侧侧边栏 ========== */}
      <aside className="sidebar">

        {/* ===== MODEL MANAGER ===== */}
        {activePanel === 'modelManager' && (
          <div className="sidebar-section">

            {/* Upload Models */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('uploadModels')}>
                <span>📤 Upload Models</span>
                <small>(.3dm, .ifc, .obj, .skp, .tif, .geojson, .zip)</small>
                <i className={`fa-solid ${expandedSections.uploadModels ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.uploadModels && (
                <div className="model-section-content p-3">
                  <div className="alert alert-warning">
                    ⚠️ Please backup your data via Export Model!
                  </div>
                  <div id="models-title">Models:</div>
                  <div className="entity-list">
                    <p className="text-center">No Models</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept=".skp,.3dm,.ifc,.gltf,.glb,.obj,.tif,.geojson,.zip"
                    className="form-control mt-2"
                  />
                </div>
              )}
            </div>

            {/* Model Properties */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('modelProperties')}>
                <span>Model Properties</span>
                <i className={`fa-solid ${expandedSections.modelProperties ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.modelProperties && (
                <div className="model-section-content p-3">
                  <div>Lat./Long. Coordinates</div>
                  <div className="d-flex">
                    <div className="flex3">Latitude</div>
                    <div className="flex3">Longitude</div>
                    <div className="flex2">Altitude (mPD)</div>
                    <div className="flex2">Height (m)</div>
                  </div>
                  <div className="d-flex">
                    <input type="number" className="flex3 form-control form-control-sm" step="0.00001" disabled />
                    <input type="number" className="flex3 form-control form-control-sm" step="0.00001" disabled />
                    <input type="number" className="flex2 form-control form-control-sm" step="any" disabled />
                    <input type="number" className="flex2 form-control form-control-sm" step="0.5" disabled />
                  </div>
                </div>
              )}
            </div>

            {/* Model Library */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('modelLibrary')}>
                <span>Model Library</span>
                <i className={`fa-solid ${expandedSections.modelLibrary ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.modelLibrary && (
                <div className="model-section-content p-3">
                  <div className="alphabet-tab mb-2">
                    {['all', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'].map(letter => (
                      <button key={letter} className="alphabet-btn">{letter}</button>
                    ))}
                  </div>
                  <div className="library-grid">
                    <div className="model-div">
                      <div className="model-icon">✈️</div>
                      <div>Airplane</div>
                    </div>
                    <div className="model-div">
                      <div className="model-icon">🏢</div>
                      <div>Building</div>
                    </div>
                    <div className="model-div">
                      <div className="model-icon">🚗</div>
                      <div>Car</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ===== ASSESSMENT MANAGER ===== */}
        {activePanel === 'assessmentManager' && (
          <div className="sidebar-section">

            {/* View Assessments */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('viewAssessments')}>
                <span>📊 View Assessments</span>
                <i className={`fa-solid ${expandedSections.viewAssessments ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.viewAssessments && (
                <div className="model-section-content p-3">
                  <div className="assessments-header">
                    <span>3 most recent assessments</span>
                    <button className="btn btn-sm btn-primary">🔄 Refresh</button>
                  </div>
                  <div className="assessments-list">
                    <div className="assessment-item">
                      <span className="assessment-type">Noise</span>
                      <span className="assessment-date">2026-02-20</span>
                      <span className="assessment-status">Completed</span>
                      <button className="btn btn-sm">📥 Download</button>
                    </div>
                    <div className="assessment-item">
                      <span className="assessment-type">Air Quality</span>
                      <span className="assessment-date">2026-02-19</span>
                      <span className="assessment-status">Completed</span>
                      <button className="btn btn-sm">📥 Download</button>
                    </div>
                    <div className="assessment-item">
                      <span className="assessment-type">Wind</span>
                      <span className="assessment-date">2026-02-18</span>
                      <span className="assessment-status">Completed</span>
                      <button className="btn btn-sm">📥 Download</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Influence Analysis */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('influenceAnalysis')}>
                <span>📍 Influence Analysis</span>
                <i className={`fa-solid ${expandedSections.influenceAnalysis ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.influenceAnalysis && (
                <div className="model-section-content p-3">
                  <div className="form-group">
                    <label>Features</label>
                    <div className="buffer-control">
                      <span>Buffer</span>
                      <input
                        type="range"
                        className="buffer-slider"
                        min="0"
                        max="716"
                        value={buffer}
                        onChange={(e) => setBuffer(parseInt(e.target.value))}
                      />
                      <input
                        type="number"
                        className="buffer-input"
                        value={buffer}
                        onChange={(e) => setBuffer(parseInt(e.target.value))}
                        min="0"
                        max="716"
                      />
                      <span>m</span>
                    </div>
                    <div className="buffer-actions">
                      <button className="btn btn-sm" onClick={drawBuffer} title="Draw buffer">✏️ Draw</button>
                      <button className="btn btn-sm" onClick={deleteBuffer} title="Delete buffer">🗑️ Delete</button>
                    </div>
                    <p className="help-text">
                      Get surrounding buildings and features within created buffers (max. 2).
                    </p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => alert('Running Influence Analysis...')}>
                    ▶️ Run
                  </button>
                </div>
              )}
            </div>

            {/* Upload Assessment Result */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('uploadAssessment')}>
                <span>📤 Upload Assessment Result</span>
                <small>(.png, .jpeg, .csv, .geoJson, .zip)</small>
                <i className={`fa-solid ${expandedSections.uploadAssessment ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.uploadAssessment && (
                <div className="model-section-content p-3">
                  <input type="file" className="form-control my-2" accept=".csv,.geojson,.zip,.png,.jpeg" />
                  <div className="coordinates-section">
                    <div className="coordinate-group">
                      <label>Top Left Coordinates</label>
                      <div className="coordinate-inputs">
                        <input type="number" className="form-control" placeholder="Latitude" step="0.0001" />
                        <input type="number" className="form-control" placeholder="Longitude" step="0.0001" />
                        <input type="number" className="form-control" placeholder="Altitude (mPD)" step="2" />
                      </div>
                    </div>
                    <div className="coordinate-group">
                      <label>Bottom Right Coordinates</label>
                      <div className="coordinate-inputs">
                        <input type="number" className="form-control" placeholder="Latitude" step="0.0001" />
                        <input type="number" className="form-control" placeholder="Longitude" step="0.0001" />
                        <input type="number" className="form-control" placeholder="Altitude (mPD)" step="2" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Air Ventilation */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('airVentilation')}>
                <span>💨 Air Ventilation</span>
                <i className={`fa-solid ${expandedSections.airVentilation ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.airVentilation && (
                <div className="model-section-content p-3">
                  <p className="info-text">
                    The simulation area will be calculated from your placed models.
                  </p>
                  <div className="form-group">
                    <label>Simulation method</label>
                    <select className="form-control">
                      <option value="boltzmann">Boltzmann</option>
                      <option value="navier-stokes">Navier-Stokes</option>
                      <option value="open-foam">OpenFOAM</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Grid spacing (meters)</label>
                    <input type="number" className="form-control" min="1" defaultValue="5" />
                  </div>
                  <div className="form-group">
                    <label>Wind direction (degrees)</label>
                    <input type="number" className="form-control" min="0" max="360" defaultValue="90" />
                  </div>
                  <div className="form-group">
                    <label>Wind speed</label>
                    <input type="number" className="form-control" min="0.1" max="50" step="0.1" defaultValue="12" />
                  </div>
                  <div className="form-group">
                    <label>Display method</label>
                    <select className="form-control">
                      <option value="arrows">arrows</option>
                      <option value="heatmap">heatmap</option>
                      <option value="moving arrows">moving arrows</option>
                    </select>
                  </div>
                  <label className="form-check">
                    <input type="checkbox" defaultChecked />
                    Use influence analysis buildings
                  </label>
                  <div className="heatmap-legend">
                    <div className="hue-gradient"></div>
                    <div className="legend-labels">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                    <div className="legend-unit">ms⁻¹</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => alert('Starting simulation...')}>
                    Start simulation
                  </button>
                </div>
              )}
            </div>

            {/* Noise Impact (Placeholder) */}
            <div className="sub-panel">
              <div className="model-section-header">
                <span>🔊 Noise Impact Assessment (Contact us for your need)</span>
              </div>
            </div>

            {/* Air Impact (Placeholder) */}
            <div className="sub-panel">
              <div className="model-section-header">
                <span>🌬️ Air Impact Assessment (Contact us for your need)</span>
              </div>
            </div>

          </div>
        )}

        {/* ===== CLIMATE WIZARD ===== */}
        {activePanel === 'climateWizard' && (
          <div className="sidebar-section">

            {/* Climate Visualization */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('climateVisualization')}>
                <span>🌤️ Climate Visualization</span>
                <i className={`fa-solid ${expandedSections.climateVisualization ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.climateVisualization && (
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
                      <input type="range" className="form-range" min="0" max="100" value="50" disabled />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Time Control */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('timeControl')}>
                <span>⏰ Time</span>
                <i className={`fa-solid ${expandedSections.timeControl ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.timeControl && (
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

            {/* ECMWF Weather Forecast */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('ecmwfWeather')}>
                <span>🌦️ ECMWF Weather Forecast</span>
                <i className={`fa-solid ${expandedSections.ecmwfWeather ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.ecmwfWeather && (
                <div className="model-section-content p-3">
                  <div className="ecmwf-layers">
                    <button className="layer-option selected">Hide all</button>
                    <button className="layer-option">Pressure Level (1000 hPa)</button>
                    <button className="layer-option">Pressure Level (500 hPa)</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ===== PRESENTATION WIZARD ===== */}
        {activePanel === 'presentationWizard' && (
          <div className="sidebar-section">

            {/* Presentation Settings */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('presentationSettings')}>
                <span>🎬 Presentation Wizard</span>
                <i className={`fa-solid ${expandedSections.presentationSettings ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.presentationSettings && (
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
              <div className="model-section-header" onClick={() => toggleSection('splitScreen')}>
                <span>🖥️ Split Screen</span>
                <i className={`fa-solid ${expandedSections.splitScreen ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.splitScreen && (
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
              <div className="model-section-header" onClick={() => toggleSection('selectLayer')}>
                <span>🗂️ Select Layer</span>
                <i className={`fa-solid ${expandedSections.selectLayer ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.selectLayer && (
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

          </div>
        )}

        {/* ===== LAYER MANAGER ===== */}
        {activePanel === 'layerManager' && (
          <div className="sidebar-section">

            {/* Layers Tree */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('layersTree')}>
                <span>🗂️ Layers</span>
                <i className={`fa-solid ${expandedSections.layersTree ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.layersTree && (
                <div className="model-section-content p-3">
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Search by layer name..."
                  />
                  <div className="layer-groups">
                    <div className="layer-group">
                      <h4>General</h4>
                      <label className="layer-item">
                        <input type="checkbox" checked={layers.ozp} onChange={(e) => setLayers({...layers, ozp: e.target.checked})} />
                        <span>OZP</span>
                        <input type="range" className="layer-opacity" min="0" max="1" step="0.1" />
                      </label>
                      <label className="layer-item">
                        <input type="checkbox" checked={layers.boundaries} onChange={(e) => setLayers({...layers, boundaries: e.target.checked})} />
                        <span>District Boundaries</span>
                        <input type="range" className="layer-opacity" min="0" max="1" step="0.1" />
                      </label>
                    </div>
                    <div className="layer-group">
                      <h4>Environmental</h4>
                      <label className="layer-item">
                        <input type="checkbox" checked={layers.buildings} onChange={(e) => setLayers({...layers, buildings: e.target.checked})} />
                        <span>Buildings</span>
                        <input type="range" className="layer-opacity" min="0" max="1" step="0.1" />
                      </label>
                      <label className="layer-item">
                        <input type="checkbox" checked={layers.bathingBeach} onChange={(e) => setLayers({...layers, bathingBeach: e.target.checked})} />
                        <span>Bathing Beach</span>
                        <input type="range" className="layer-opacity" min="0" max="1" step="0.1" />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3D Landscapes */}
            <div className="sub-panel">
              <div className="model-section-header" onClick={() => toggleSection('threeDLandscapes')}>
                <span>🏔️ 3D Landscapes</span>
                <i className={`fa-solid ${expandedSections.threeDLandscapes ? 'fa-minus' : 'fa-plus'}`}></i>
              </div>
              {expandedSections.threeDLandscapes && (
                <div className="model-section-content p-3">
                  <label className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" />
                    <span>3D Block Model</span>
                  </label>
                  <label className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" />
                    <span>3D Google Model</span>
                  </label>
                  <label className="form-check mb-2">
                    <input className="form-check-input" type="checkbox" />
                    <span>LandsD Photo-realistic Model</span>
                  </label>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ===== MONITORING WIZARD ===== */}
        {activePanel === 'monitoringWizard' && (
          <div className="sidebar-section">
            <div className="sub-panel">
              <div className="model-section-header">
                <span>🔍 Ecological Monitoring Devices</span>
                <i className="fa-solid fa-plus"></i>
              </div>
              <div className="model-section-content p-3">
                <div className="monitoring-types">
                  <div className="monitoring-card">
                    <div className="monitoring-icon">📹</div>
                    <h4>CCTV Cameras</h4>
                    <p>View live camera feeds</p>
                    <button className="btn btn-sm">Open Dashboard</button>
                  </div>
                  <div className="monitoring-card">
                    <div className="monitoring-icon">🔊</div>
                    <h4>Sound Sensors</h4>
                    <p>Monitor noise levels</p>
                    <button className="btn btn-sm">Open Dashboard</button>
                  </div>
                  <div className="monitoring-card">
                    <div className="monitoring-icon">🐦</div>
                    <h4>Bird Monitoring</h4>
                    <p>Track bird activity</p>
                    <button className="btn btn-sm">Open Dashboard</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 默认状态 - 没有选择面板 */}
        {!activePanel && (
          <div className="no-panel-selected">
            <h3>👋 Welcome to EA Planner</h3>
            <p>Select a wizard or manager from the top toolbar to get started</p>
            <div className="quick-actions">
              <button className="btn btn-primary" onClick={() => togglePanel('climateWizard')}>🌤️ Climate Wizard</button>
              <button className="btn btn-primary" onClick={() => togglePanel('assessmentManager')}>📊 Assessment Wizard</button>
              <button className="btn btn-primary" onClick={() => togglePanel('layerManager')}>🗂️ Layer Manager</button>
              <button className="btn btn-primary" onClick={() => togglePanel('presentationWizard')}>🎬 Presentation Wizard</button>
            </div>
          </div>
        )}

      </aside>

      {/* ========== 右侧工具栏 ========== */}
      <aside className="right-toolbar">
        <button
          className={`tool-btn ${activeTool === 'viewpoint' ? 'active' : ''}`}
          title="Viewpoint Manager"
          onClick={() => activateTool('viewpoint')}
        >
          📍
        </button>
        <button
          className={`tool-btn ${activeTool === 'construct' ? 'active' : ''}`}
          title="Construct Building"
          onClick={() => activateTool('construct')}
        >
          🏢
        </button>
        <button
          className={`tool-btn ${activeTool === 'georef' ? 'active' : ''}`}
          title="Geo Reference"
          onClick={() => activateTool('georef')}
        >
          🗺️
        </button>
        <button
          className={`tool-btn ${activeTool === 'measure' ? 'active' : ''}`}
          title="Measure Distance"
          onClick={() => activateTool('measure')}
        >
          📏
        </button>
        <button
          className={`tool-btn ${activeTool === 'move' ? 'active' : ''}`}
          title="Move Model"
          onClick={() => activateTool('move')}
        >
          ✏️
        </button>
        <button
          className={`tool-btn ${activeTool === 'rotate' ? 'active' : ''}`}
          title="Rotate Model"
          onClick={() => activateTool('rotate')}
        >
          🔄
        </button>
        <button
          className={`tool-btn ${activeTool === 'height' ? 'active' : ''}`}
          title="Adjust Height"
          onClick={() => activateTool('height')}
        >
          ⬆️
        </button>
        <button
          className={`tool-btn ${activeTool === 'scale' ? 'active' : ''}`}
          title="Scale Model"
          onClick={() => activateTool('scale')}
        >
          📐
        </button>
        <button
          className={`tool-btn ${activeTool === 'cutter' ? 'active' : ''}`}
          title="Cutter"
          onClick={() => activateTool('cutter')}
        >
          ✂️
        </button>
        <button
          className={`tool-btn ${activeTool === 'reset' ? 'active' : ''}`}
          title="Reset"
          onClick={() => activateTool('reset')}
        >
          🔁
        </button>
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

      {/* ========== Cesium 地图容器 ========== */}
      <div ref={cesiumContainer} className="cesium-container"></div>

      {/* ========== 底部图例 ========== */}
      <div className="bottom-legend">
        <div className="distance-legend">
          <div className="distance-legend-label">3.0 km</div>
          <div className="distance-legend-scale-bar"></div>
        </div>
        <div className="bottom-logo">
          <span>ODEN Systems</span>
        </div>
      </div>
    </div>
  )
}

export default MapView