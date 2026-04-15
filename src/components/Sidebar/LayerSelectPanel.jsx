// src/components/Sidebar/LayerSelectPanel.jsx
import React from 'react'

export default function LayerSelectPanel({ isExpanded, onToggle }) {
  return (
    <div className="sub-panel">
      <a className="model-section-header" onClick={onToggle}>
        <span><span className="emoji">🗂️</span> Select Layer</span>
        <i className={`fa-solid ${isExpanded ? 'fa-minus' : 'fa-plus'}`}></i>
      </a>
      {isExpanded && (
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
  )
}
