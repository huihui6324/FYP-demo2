// src/components/TopPanels/ProjectManager.jsx
import React from 'react'

export default function ProjectManager({ onClose }) {
  return (
    <div className="top-panel project-manager-panel">
      <div className="panel-header">
        <h3><span className="emoji">📁</span> Project Manager</h3>
        <button className="panel-close" onClick={onClose}>×</button>
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
  )
}
