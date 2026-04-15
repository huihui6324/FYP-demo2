// src/components/Sidebar/WeatherPanel.jsx
import React from 'react'

export default function WeatherPanel({ isExpanded, onToggle }) {
  return (
    <div className="sub-panel">
      <a className="model-section-header" onClick={onToggle}>
        <span><span className="emoji">🌦️</span> ECMWF Weather Forecast</span>
        <i className={`fa-solid ${isExpanded ? 'fa-minus' : 'fa-plus'}`}></i>
      </a>
      {isExpanded && (
        <div className="model-section-content p-3">
          <div className="ecmwf-layers">
            <button className="layer-option selected">Hide all</button>
            <button className="layer-option">Pressure Level (1000 hPa)</button>
            <button className="layer-option">Pressure Level (500 hPa)</button>
          </div>
        </div>
      )}
    </div>
  )
}
