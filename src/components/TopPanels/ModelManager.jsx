// src/components/TopPanels/ModelManager.jsx
import React from 'react'

export default function ModelManager({ onClose }) {
  return (
    <div className="top-panel model-manager-panel">
      <div className="panel-header">
        <h3><span className="emoji">🏗️</span> Model Manager</h3>
        <button className="panel-close" onClick={onClose}>×</button>
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
  )
}
