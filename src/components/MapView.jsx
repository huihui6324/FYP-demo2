// src/components/MapView.jsx
import { useEffect, useRef, useState } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

// 引入所有 CSS 文件
import './MapView.css'
import './Toolbar.css'
import './Panels.css'
import './Sidebar.css'
import './Forms.css'
import './Emoji.css'
import './Responsive.css'

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

  // Assessment Wizard 状态
  const [assessmentStep, setAssessmentStep] = useState(0)
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [assessmentConfig, setAssessmentConfig] = useState({
    influenceType: 'shadow',
    analysisDate: '',
    analysisTime: '',
    windDirection: 'north',
    windSpeed: 5,
    noiseSource: 'traffic',
    noiseLevel: 70,
    airPollutant: 'PM2.5',
    emissionRate: 100
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

  // 选择评估类型
  const selectAssessmentType = (type) => {
    setSelectedAssessment(type)
    setAssessmentStep(1)
  }

  // 重置评估向导
  const resetAssessmentWizard = () => {
    setAssessmentStep(0)
    setSelectedAssessment(null)
    setAssessmentConfig({
      influenceType: 'shadow',
      analysisDate: '',
      analysisTime: '',
      windDirection: 'north',
      windSpeed: 5,
      noiseSource: 'traffic',
      noiseLevel: 70,
      airPollutant: 'PM2.5',
      emissionRate: 100
    })
  }

  // 运行评估
  const runAssessment = () => {
    alert(`Running ${selectedAssessment} assessment with config: ${JSON.stringify(assessmentConfig, null, 2)}`)
    setAssessmentStep(3)
  }

  // 气候效果应用到 Cesium
  useEffect(() => {
    if (!viewer) return

    // 雨雪效果
    if (climate.rain) {
      // TODO: 实现 Cesium 雨效果
      console.log('Rain effect enabled')
    }
    if (climate.snow) {
      // TODO: 实现 Cesium 雪效果
      console.log('Snow effect enabled')
    }

    // 雾效果
    viewer.scene.fog.enabled = climate.fog > 0
    viewer.scene.fog.density = climate.fog / 1000

    // 阴影
    viewer.shadows = climate.castShadows
  }, [viewer, climate])

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
      terrainProvider: undefined, // 禁用默认地形以避免错误
      shouldAnimate: true
    })

    // 禁用地形以避免 incrementallyBuildTerrainPicker 错误
    initViewer.terrainProvider = undefined

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
          <span><span className="emoji">🌍</span> EA Planner</span>
        </div>
        <div className="toolbar-divider" />

        {/* 左侧工具组 */}
        <div className="toolbar-group">
          <button className="tool-btn" title="Location" onClick={() => alert('Location Selector')}>
            <span className="emoji">🌍</span>
          </button>
          <button className="tool-btn" title="Home" onClick={() => {
            viewer?.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(114.17, 22.32, 15000),
              duration: 2
            })
          }}>
            <span className="emoji">🏠</span>
          </button>
          <button
            className={`tool-btn ${topPanels.projectManager ? 'active' : ''}`}
            title="Project Manager"
            onClick={() => toggleTopPanel('projectManager')}
          >
            <span className="emoji">📁</span>
          </button>
          <button
            className={`tool-btn ${topPanels.modelManager ? 'active' : ''}`}
            title="Model Manager"
            onClick={() => toggleTopPanel('modelManager')}
          >
            <span className="emoji">🏗️</span>
          </button>
          <button
            className={`tool-btn ${topPanels.layerManager ? 'active' : ''}`}
            title="Layer Manager"
            onClick={() => toggleTopPanel('layerManager')}
          >
            <span className="emoji">🗂️</span>
          </button>
        </div>

        <div className="toolbar-divider" />

        {/* 巫师工具组 */}
        <div className="toolbar-group">
          <button className="tool-btn" title="Climate Wizard" onClick={() => toggleLeftPanel('climate')}>
            <span className="emoji">🌤️</span>
          </button>
          <button
            className={`tool-btn ${topPanels.assessmentWizard ? 'active' : ''}`}
            title="Assessment Wizard"
            onClick={() => toggleTopPanel('assessmentWizard')}
          >
            <span className="emoji">📊</span>
          </button>
          <button
            className={`tool-btn ${topPanels.monitoringWizard ? 'active' : ''}`}
            title="Monitoring Wizard"
            onClick={() => toggleTopPanel('monitoringWizard')}
          >
            <span className="emoji">🔍</span>
          </button>
          <button className="tool-btn" title="Presentation Wizard" onClick={() => toggleLeftPanel('presentation')}>
            <span className="emoji">🎬</span>
          </button>
        </div>

        <div className="toolbar-spacer" />

        {/* 右侧图标 */}
        <div className="toolbar-icons">
          <button className="tool-btn" title="Search" onClick={() => alert('Search Location')}>
            <span className="emoji">🔍</span>
          </button>
          <button className="tool-btn" title="Settings" onClick={() => alert('Settings')}>
            <span className="emoji">⚙️</span>
          </button>
          <button className="tool-btn" title="Help" onClick={() => alert('Help')}>
            <span className="emoji">❓</span>
          </button>
          <button className="tool-btn" title="User" onClick={() => alert('User Profile')}>
            <span className="emoji">👤</span>
          </button>
          <button className="tool-btn primary" title="Logout" onClick={() => alert('Logout')}>
            <span className="emoji">➡️</span>
          </button>
        </div>
      </header>

      {/* ========== 顶部面板区域 ========== */}
      {topPanels.projectManager && (
        <div className="top-panel project-manager-panel">
          <div className="panel-header">
            <h3><span className="emoji">📁</span> Project Manager</h3>
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
            <h3><span className="emoji">🏗️</span> Model Manager</h3>
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
            <h3><span className="emoji">🗂️</span> Layer Manager</h3>
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
            <h3><span className="emoji">📊</span> Assessment Wizard</h3>
            <button className="panel-close" onClick={() => toggleTopPanel('assessmentWizard')}>×</button>
          </div>
          <div className="panel-content">
            {/* Step 0: 选择评估类型 */}
            {assessmentStep === 0 && (
              <div className="assessment-options">
                <button className="assessment-btn" onClick={() => selectAssessmentType('influence')}>
                  <span className="emoji emoji-icon-small">📈</span>
                  <span>Influence Analysis</span>
                </button>
                <button className="assessment-btn" onClick={() => selectAssessmentType('ventilation')}>
                  <span className="emoji emoji-icon-small">💨</span>
                  <span>Air Ventilation</span>
                </button>
                <button className="assessment-btn" onClick={() => selectAssessmentType('noise')}>
                  <span className="emoji emoji-icon-small">🔇</span>
                  <span>Noise Impact Assessment</span>
                </button>
                <button className="assessment-btn" onClick={() => selectAssessmentType('air')}>
                  <span className="emoji emoji-icon-small">🌬️</span>
                  <span>Air Impact Assessment</span>
                </button>
              </div>
            )}

            {/* Step 1: 配置参数 */}
            {assessmentStep === 1 && selectedAssessment && (
              <div className="assessment-config">
                <div className="config-header">
                  <h4>Configure {selectedAssessment === 'influence' ? 'Influence Analysis' : 
                                   selectedAssessment === 'ventilation' ? 'Air Ventilation' :
                                   selectedAssessment === 'noise' ? 'Noise Impact' : 'Air Impact'}
                  </h4>
                  <button className="btn-sm" onClick={resetAssessmentWizard}>✕ Close</button>
                </div>

                {/* Influence Analysis 配置 */}
                {selectedAssessment === 'influence' && (
                  <div className="config-form">
                    <div className="form-group">
                      <label>Influence Type</label>
                      <select 
                        className="form-select" 
                        value={assessmentConfig.influenceType}
                        onChange={(e) => setAssessmentConfig({...assessmentConfig, influenceType: e.target.value})}
                      >
                        <option value="shadow">Shadow Analysis</option>
                        <option value="sunlight">Sunlight Hours</option>
                        <option value="visibility">Visibility</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Analysis Date</label>
                      <input 
                        type="date" 
                        className="form-input"
                        value={assessmentConfig.analysisDate}
                        onChange={(e) => setAssessmentConfig({...assessmentConfig, analysisDate: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Analysis Time</label>
                      <input 
                        type="time" 
                        className="form-input"
                        value={assessmentConfig.analysisTime}
                        onChange={(e) => setAssessmentConfig({...assessmentConfig, analysisTime: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {/* Air Ventilation 配置 */}
                {selectedAssessment === 'ventilation' && (
                  <div className="config-form">
                    <div className="form-group">
                      <label>Wind Direction</label>
                      <select 
                        className="form-select"
                        value={assessmentConfig.windDirection}
                        onChange={(e) => setAssessmentConfig({...assessmentConfig, windDirection: e.target.value})}
                      >
                        <option value="north">North (0°)</option>
                        <option value="northeast">Northeast (45°)</option>
                        <option value="east">East (90°)</option>
                        <option value="southeast">Southeast (135°)</option>
                        <option value="south">South (180°)</option>
                        <option value="southwest">Southwest (225°)</option>
                        <option value="west">West (270°)</option>
                        <option value="northwest">Northwest (315°)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Wind Speed (m/s)</label>
                      <input 
                        type="range" 
                        className="form-range"
                        min="0" max="30" step="0.5"
                        value={assessmentConfig.windSpeed}
                        onChange={(e) => setAssessmentConfig({...assessmentConfig, windSpeed: parseFloat(e.target.value)})}
                      />
                      <span className="range-value">{assessmentConfig.windSpeed} m/s</span>
                    </div>
                  </div>
                )}

                {/* Noise Impact 配置 */}
                {selectedAssessment === 'noise' && (
                  <div className="config-form">
                    <div className="form-group">
                      <label>Noise Source</label>
                      <select 
                        className="form-select"
                        value={assessmentConfig.noiseSource}
                        onChange={(e) => setAssessmentConfig({...assessmentConfig, noiseSource: e.target.value})}
                      >
                        <option value="traffic">Traffic</option>
                        <option value="construction">Construction</option>
                        <option value="industrial">Industrial</option>
                        <option value="airport">Airport</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Noise Level (dB)</label>
                      <input 
                        type="range" 
                        className="form-range"
                        min="30" max="120" step="5"
                        value={assessmentConfig.noiseLevel}
                        onChange={(e) => setAssessmentConfig({...assessmentConfig, noiseLevel: parseInt(e.target.value)})}
                      />
                      <span className="range-value">{assessmentConfig.noiseLevel} dB</span>
                    </div>
                  </div>
                )}

                {/* Air Impact 配置 */}
                {selectedAssessment === 'air' && (
                  <div className="config-form">
                    <div className="form-group">
                      <label>Pollutant Type</label>
                      <select 
                        className="form-select"
                        value={assessmentConfig.airPollutant}
                        onChange={(e) => setAssessmentConfig({...assessmentConfig, airPollutant: e.target.value})}
                      >
                        <option value="PM2.5">PM2.5</option>
                        <option value="PM10">PM10</option>
                        <option value="NO2">NO2</option>
                        <option value="SO2">SO2</option>
                        <option value="O3">O3</option>
                        <option value="CO">CO</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Emission Rate (kg/h)</label>
                      <input 
                        type="range" 
                        className="form-range"
                        min="0" max="1000" step="10"
                        value={assessmentConfig.emissionRate}
                        onChange={(e) => setAssessmentConfig({...assessmentConfig, emissionRate: parseInt(e.target.value)})}
                      />
                      <span className="range-value">{assessmentConfig.emissionRate} kg/h</span>
                    </div>
                  </div>
                )}

                <div className="config-actions">
                  <button className="btn-secondary" onClick={() => setAssessmentStep(0)}>← Back</button>
                  <button className="btn-primary" onClick={runAssessment}>Run Analysis →</button>
                </div>
              </div>
            )}

            {/* Step 3: 结果展示 */}
            {assessmentStep === 3 && (
              <div className="assessment-results">
                <div className="results-header">
                  <h4>✅ Analysis Complete</h4>
                  <button className="btn-sm" onClick={resetAssessmentWizard}>✕ Close</button>
                </div>
                <div className="results-content">
                  <div className="result-summary">
                    <p><strong>Assessment Type:</strong> {selectedAssessment}</p>
                    <p><strong>Status:</strong> Completed successfully</p>
                    <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
                  </div>
                  <div className="result-viz">
                    <div className="placeholder-viz">
                      <span className="emoji">📊</span>
                      <p>Visualization would appear here</p>
                      <p className="help-text">In a production environment, this would show heatmap overlays, charts, or 3D analysis results on the map.</p>
                    </div>
                  </div>
                  <div className="result-actions">
                    <button className="btn-secondary" onClick={() => setAssessmentStep(1)}>← Reconfigure</button>
                    <button className="btn-primary" onClick={() => alert('Downloading report...')}>📥 Download Report</button>
                    <button className="btn-success" onClick={() => alert('Sharing results...')}>📤 Share Results</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {topPanels.monitoringWizard && (
        <div className="top-panel monitoring-panel">
          <div className="panel-header">
            <h3><span className="emoji">🔍</span> Ecological Monitoring</h3>
            <button className="panel-close" onClick={() => toggleTopPanel('monitoringWizard')}>×</button>
          </div>
          <div className="panel-content">
            <div className="monitoring-types">
              <div className="monitoring-card">
                <span className="emoji-icon">📹</span>
                <h4>CCTV Cameras</h4>
                <p>View live camera feeds</p>
                <button className="btn-sm">Open Dashboard</button>
              </div>
              <div className="monitoring-card">
                <span className="emoji-icon">🔊</span>
                <h4>Sound Sensors</h4>
                <p>Monitor noise levels</p>
                <button className="btn-sm">Open Dashboard</button>
              </div>
              <div className="monitoring-card">
                <span className="emoji-icon">🦅</span>
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
            <span><span className="emoji">🌤️</span> Climate Visualization</span>
            <i className={`fa-solid ${leftPanels.climate ? 'fa-minus' : 'fa-plus'}`}></i>
          </a>
          {leftPanels.climate && (
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

        {/* Time */}
        <div className="sub-panel">
          <a className="model-section-header" onClick={() => toggleLeftPanel('time')}>
            <span><span className="emoji">⏰</span> Time</span>
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
            <span><span className="emoji">🌦️</span> ECMWF Weather Forecast</span>
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
            <span><span className="emoji">🎬</span> Presentation Wizard</span>
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
            <span><span className="emoji">🖥️</span> Split Screen</span>
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
            <span><span className="emoji">🗂️</span> Select Layer</span>
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
        <button className={`tool-btn ${activeTool === 'viewpoint' ? 'active' : ''}`} title="Viewpoint Manager" onClick={() => activateTool('viewpoint')}>
          <span className="emoji">📍</span>
        </button>
        <button className={`tool-btn ${activeTool === 'construct' ? 'active' : ''}`} title="Construct Building" onClick={() => activateTool('construct')}>
          <span className="emoji">🏢</span>
        </button>
        <button className={`tool-btn ${activeTool === 'georef' ? 'active' : ''}`} title="Geo Reference" onClick={() => activateTool('georef')}>
          <span className="emoji">🗺️</span>
        </button>
        <button className={`tool-btn ${activeTool === 'measure' ? 'active' : ''}`} title="Measure Distance" onClick={() => activateTool('measure')}>
          <span className="emoji">📏</span>
        </button>
        <button className={`tool-btn ${activeTool === 'move' ? 'active' : ''}`} title="Move Model" onClick={() => activateTool('move')}>
          <span className="emoji">✏️</span>
        </button>
        <button className={`tool-btn ${activeTool === 'rotate' ? 'active' : ''}`} title="Rotate Model" onClick={() => activateTool('rotate')}>
          <span className="emoji">🔄</span>
        </button>
        <button className={`tool-btn ${activeTool === 'height' ? 'active' : ''}`} title="Adjust Height" onClick={() => activateTool('height')}>
          <span className="emoji">⬆️</span>
        </button>
        <button className={`tool-btn ${activeTool === 'scale' ? 'active' : ''}`} title="Scale Model" onClick={() => activateTool('scale')}>
          <span className="emoji">📐</span>
        </button>
        <button className={`tool-btn ${activeTool === 'cutter' ? 'active' : ''}`} title="Cutter" onClick={() => activateTool('cutter')}>
          <span className="emoji">✂️</span>
        </button>
        <button className={`tool-btn ${activeTool === 'reset' ? 'active' : ''}`} title="Reset" onClick={() => activateTool('reset')}>
          <span className="emoji">🔁</span>
        </button>
        <button className="tool-btn" title="Export" onClick={() => alert('Export Project')}>
          <span className="emoji">📤</span>
        </button>
        <button className="tool-btn" title="Share" onClick={() => alert('Share Link')}>
          <span className="emoji">🔗</span>
        </button>
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