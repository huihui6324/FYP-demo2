// src/components/Sidebar/SplitScreenPanel.jsx
import React from 'react'

export default function SplitScreenPanel({ isExpanded, onToggle }) {
  return (
    <div className="sub-panel">
      <a className="model-section-header" onClick={onToggle}>
        <span><span className="emoji">🖥️</span> Split Screen</span>
        <i className={`fa-solid ${isExpanded ? 'fa-minus' : 'fa-plus'}`}></i>
      </a>
      {isExpanded && (
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
  )
}
