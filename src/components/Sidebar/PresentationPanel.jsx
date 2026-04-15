// src/components/Sidebar/PresentationPanel.jsx
import React from 'react'

export default function PresentationPanel({ isExpanded, onToggle }) {
  return (
    <div className="sub-panel">
      <a className="model-section-header" onClick={onToggle}>
        <span><span className="emoji">🎬</span> Presentation Wizard</span>
        <i className={`fa-solid ${isExpanded ? 'fa-minus' : 'fa-plus'}`}></i>
      </a>
      {isExpanded && (
        <div className="model-section-content p-3">
          <label className="form-check mb-3">
            <input type="checkbox" />
            <span>Hide All Menus</span>
          </label>
          <div className="sky-colour-section">
            <div className="mb-2">Sky Colour</div>
            <div className="d-flex">
              <div className="flex-grow-1 px-1">
                <div className="text-center mb-1">Left Side</div>
                <input type="range" className="form-range blue-gradient-slider" />
              </div>
              <div className="flex-grow-1 px-1">
                <div className="text-center mb-1">Right Side</div>
                <input type="range" className="form-range blue-gradient-slider" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
