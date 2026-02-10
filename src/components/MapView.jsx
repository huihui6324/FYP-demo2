import { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import './MapView.css'

function MapView() {
  const cesiumContainer = useRef(null)
  const viewerRef = useRef(null)

  useEffect(() => {
    // 設置 Cesium Token
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNTZmYzAwNS03MDU3LTQ1MGYtYjJkNC1kMmFjNzUxODU5OWUiLCJpZCI6Mzg4MDk1LCJpYXQiOjE3NzA0NTQ5NTd9.4DzniAg6qD-wNw_E0t75ytmPCkba163P2u_XIIjYNFU'

    // 創建 Cesium Viewer
    const viewer = new Cesium.Viewer(cesiumContainer.current, {
      terrainProvider: Cesium.createWorldTerrain(),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: true,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: true,
    })

    viewerRef.current = viewer

    // 設置初始視圖
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(114.1694, 22.3193, 10000), // 香港
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-45),
        roll: 0.0
      }
    })

    // 更新比例尺函數
    const updateScale = () => {
      const scene = viewer.scene
      const camera = viewer.camera
      const canvas = scene.canvas
      
      // 獲取畫布中心點的地理位置
      const centerPixel = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2)
      const centerPosition = camera.pickEllipsoid(centerPixel, scene.globe.ellipsoid)
      
      if (centerPosition) {
        const geodetic = Cesium.Cartographic.fromCartesian(centerPosition)
        const height = camera.positionCartographic.height
        
        // 計算比例尺距離（像素到實際距離）
        const pixelWidth = 100 // 比例尺條的像素寬度
        const fov = camera.frustum.fov
        const pixelSize = 2 * height * Math.tan(fov / 2) / canvas.clientHeight
        const distance = pixelSize * pixelWidth
        
        // 格式化距離顯示
        let scaleText
        if (distance >= 1000) {
          scaleText = `${(distance / 1000).toFixed(1)} km`
        } else {
          scaleText = `${Math.round(distance)} m`
        }
        
        const scaleLabel = document.getElementById('scale-label')
        if (scaleLabel) {
          scaleLabel.textContent = scaleText
        }
      }
    }

    // 監聽相機移動事件
    viewer.camera.moveEnd.addEventListener(updateScale)
    viewer.camera.changed.addEventListener(updateScale)
    
    // 初始更新
    updateScale()

    // 清理函數
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className="map-container">
      <div ref={cesiumContainer} className="cesium-viewer" />
      <div className="compass" title="指北">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="28" fill="white" fillOpacity="0.9" stroke="#333" strokeWidth="2"/>
          <polygon points="30,10 35,28 30,25 25,28" fill="#e74c3c"/>
          <polygon points="30,50 35,32 30,35 25,32" fill="#95a5a6"/>
          <text x="30" y="15" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#333">N</text>
        </svg>
      </div>
      <div className="scale-bar" id="scale-bar">
        <div className="scale-bar-line"></div>
        <div className="scale-bar-label" id="scale-label">1000 m</div>
      </div>
    </div>
  )
}

export default MapView
