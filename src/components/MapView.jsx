// src/components/MapView.jsx
import { useEffect, useRef, useState } from 'react'
import * as Cesium from 'cesium'
import { Ion } from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'

// 配置 Cesium Ion Access Token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5ODYzMGVjNy1hOGZmLTQzNTMtOGNiNC0wNmMzMzU3YjJmYzEiLCJpZCI6NDEzOTgzLCJpYXQiOjE3NzUzNzIwMDN9.alkn5QrNOGKTVFb4sx9jufiPe8LiOZQ3ruN0sihnJSU';

// 引入所有 CSS 文件
import './MapView.css'
import './Toolbar.css'
import './Panels.css'
import './Sidebar.css'
import './Forms.css'
import './Emoji.css'
import './Responsive.css'

// 引入拆分后的组件
import { ProjectManager, ModelManager, LayerManager, AssessmentWizard, MonitoringWizard } from './TopPanels'
import { ClimatePanel, TimePanel, WeatherPanel, PresentationPanel, SplitScreenPanel, LayerSelectPanel } from './Sidebar'

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
      shouldAnimate: true,
      requestRenderMode: false,
      maximumRenderTimeChange: Infinity
    })

    // 确保使用 Cesium Ion 默认影像服务
    if (initViewer.imageryLayers.length === 0) {
      initViewer.imageryLayers.addImageryProvider(
        new Cesium.IonImageryProvider({ assetId: 2 })
      )
    }

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
      {topPanels.projectManager && <ProjectManager onClose={() => toggleTopPanel('projectManager')} />}
      {topPanels.modelManager && <ModelManager onClose={() => toggleTopPanel('modelManager')} />}
      {topPanels.layerManager && <LayerManager onClose={() => toggleTopPanel('layerManager')} />}
      {topPanels.assessmentWizard && <AssessmentWizard onClose={() => toggleTopPanel('assessmentWizard')} />}
      {topPanels.monitoringWizard && <MonitoringWizard onClose={() => toggleTopPanel('monitoringWizard')} />}

      {/* ========== 左侧侧边栏 ========== */}
      <aside className="sidebar">
        <ClimatePanel 
          climate={climate} 
          setClimate={setClimate} 
          isExpanded={leftPanels.climate} 
          onToggle={() => toggleLeftPanel('climate')} 
        />
        <TimePanel 
          climate={climate} 
          setClimate={setClimate} 
          isExpanded={leftPanels.time} 
          onToggle={() => toggleLeftPanel('time')} 
        />
        <WeatherPanel 
          isExpanded={leftPanels.ecmwf} 
          onToggle={() => toggleLeftPanel('ecmwf')} 
        />
        <PresentationPanel 
          isExpanded={leftPanels.presentation} 
          onToggle={() => toggleLeftPanel('presentation')} 
        />
        <SplitScreenPanel 
          isExpanded={leftPanels.splitScreen} 
          onToggle={() => toggleLeftPanel('splitScreen')} 
        />
        <LayerSelectPanel 
          isExpanded={leftPanels.selectLayer} 
          onToggle={() => toggleLeftPanel('selectLayer')} 
        />
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
