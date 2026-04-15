// src/components/Sidebar/ClimatePanel.jsx
import React from 'react'

export default function ClimatePanel({ climate, setClimate, isExpanded, onToggle }) {
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
