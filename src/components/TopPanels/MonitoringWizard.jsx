// src/components/TopPanels/MonitoringWizard.jsx
import React from 'react'

export default function MonitoringWizard({ onClose }) {
  return (
    <div className="top-panel monitoring-panel">
      <div className="panel-header">
        <h3><span className="emoji">🔍</span> Ecological Monitoring</h3>
        <button className="panel-close" onClick={onClose}>×</button>
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
  )
}
