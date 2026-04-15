// src/components/TopPanels/LayerManager.jsx
import React from 'react'

export default function LayerManager({ onClose }) {
  return (
    <div className="top-panel layer-manager-panel">
      <div className="panel-header">
        <h3><span className="emoji">🗂️</span> Layer Manager</h3>
        <button className="panel-close" onClick={onClose}>×</button>
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
  )
}
