// src/components/Sidebar/TimePanel.jsx
import React from 'react'

export default function TimePanel({ climate, setClimate, isExpanded, onToggle }) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December']

  return (
    <div className="sub-panel">
      <a className="model-section-header" onClick={onToggle}>
        <span><span className="emoji">⏰</span> Time</span>
        <i className={`fa-solid ${isExpanded ? 'fa-minus' : 'fa-plus'}`}></i>
      </a>
      {isExpanded && (
        <div className="model-section-content p-3">
          <div className="form-group">
            <label>Timezone</label>
            <select className="form-select" value={climate.timezone} onChange={(e) => setClimate({...climate, timezone: e.target.value})}>
              <option value="8">(UTC+08:00) Beijing, Hong Kong</option>
              <option value="0">(UTC+00:00) London, Edinburgh</option>
              <option value="-5">(UTC-05:00) Eastern Time (US & Canada)</option>
              <option value="9">(UTC+09:00) Tokyo, Seoul</option>
            </select>
          </div>
          <div className="row g-3">
            <div className="col-6">
              <label>Month</label>
              <input type="range" className="form-range" min="0" max="11" value={climate.month} onChange={(e) => setClimate({...climate, month: parseInt(e.target.value)})} />
              <span className="range-value">{months[climate.month]}</span>
            </div>
            <div className="col-6">
              <label>Time</label>
              <input type="range" className="form-range" min="0" max="23" value={climate.hour} onChange={(e) => setClimate({...climate, hour: parseInt(e.target.value)})} />
              <span className="range-value">{climate.hour.toString().padStart(2,'0')}:45</span>
            </div>
          </div>
          <div className="time-display">
            <span className="badge">
              {fullMonths[climate.month]}, {climate.hour.toString().padStart(2,'0')}:45
            </span>
          </div>
          <label className="form-check form-switch mt-3">
            <input type="checkbox" checked={climate.castShadows} onChange={(e) => setClimate({...climate, castShadows: e.target.checked})} />
            <span>Cast shadows</span>
          </label>
        </div>
      )}
    </div>
  )
}
