// src/components/wizards/AssessmentWizard.jsx
import { useState } from 'react'
import './AssessmentWizard.css'

function AssessmentWizard({ viewer }) {
  const [expandedPanels, setExpandedPanels] = useState({
    viewAssessments: true,
    influence: true,
    upload: false,
    airVentilation: false
  })

  const [assessments, setAssessments] = useState([
    { id: 1, type: 'Noise', date: '2026-02-20', status: 'Completed', file: 'noise_report.pdf' },
    { id: 2, type: 'Air Quality', date: '2026-02-19', status: 'Completed', file: 'air_quality_report.pdf' },
    { id: 3, type: 'Wind', date: '2026-02-18', status: 'Completed', file: 'wind_report.pdf' }
  ])

  const [buffer, setBuffer] = useState(100)
  const [bufferDrawn, setBufferDrawn] = useState(false)

  const togglePanel = (panel) => {
    setExpandedPanels(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }))
  }

  const refreshAssessments = () => {
    alert('🔄 Refreshing assessments...')
    setTimeout(() => {
      const newAssessment = {
        id: Date.now(),
        type: 'New Assessment',
        date: new Date().toISOString().split('T')[0],
        status: 'Completed'
      }
      setAssessments(prev => [newAssessment, ...prev.slice(0, 2)])
      alert('✅ Assessments refreshed!')
    }, 1000)
  }

  const downloadAssessment = (assessment) => {
    alert(`📥 Downloading ${assessment.type} report...`)
    setTimeout(() => {
      alert(`✅ ${assessment.type} report downloaded!`)
    }, 1000)
  }

  const drawBuffer = () => {
    alert('✏️ Draw buffer on map')
    setBufferDrawn(true)
  }

  const deleteBuffer = () => {
    alert('🗑️ Delete buffer')
    setBufferDrawn(false)
  }

  const runInfluenceAnalysis = () => {
    if (!bufferDrawn) {
      alert('⚠️ Please draw buffer first')
      return
    }
    alert('▶️ Running Influence Analysis...')
    setTimeout(() => {
      const newAssessment = {
        id: Date.now(),
        type: 'Influence Analysis',
        date: new Date().toISOString().split('T')[0],
        status: 'Completed'
      }
      setAssessments(prev => [newAssessment, ...prev.slice(0, 2)])
      alert('✅ Analysis completed!')
    }, 2000)
  }

  const startSimulation = () => {
    alert('▶️ Starting Air Ventilation Simulation...')
    setTimeout(() => {
      alert('✅ Simulation completed!')
    }, 3000)
  }

  return (
    <div className="assessment-wizard">
      {/* View Assessments Panel */}
      <div className="sub-panel">
        <div className="model-section-header" onClick={() => togglePanel('viewAssessments')}>
          <span>📊 View Assessments</span>
          <i className={`fa-solid ${expandedPanels.viewAssessments ? 'fa-minus' : 'fa-plus'} ms-auto`}></i>
        </div>

        {expandedPanels.viewAssessments && (
          <div className="model-section-content p-3">
            <div className="assessments-header">
              <span>3 most recent assessments</span>
              <button className="btn btn-sm btn-primary" onClick={refreshAssessments}>
                <i className="fa-solid fa-sync-alt"></i> Refresh
              </button>
            </div>

            <div className="assessments-list">
              {assessments.map(assessment => (
                <div key={assessment.id} className="assessment-item">
                  <span className="assessment-type">{assessment.type}</span>
                  <span className="assessment-date">{assessment.date}</span>
                  <span className="assessment-status">{assessment.status}</span>
                  <button
                    className="btn btn-sm"
                    onClick={() => downloadAssessment(assessment)}
                  >
                    📥 Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Influence Analysis Panel */}
      <div className="sub-panel">
        <div className="model-section-header" onClick={() => togglePanel('influence')}>
          <span>📍 Influence Analysis</span>
          <i className={`fa-solid ${expandedPanels.influence ? 'fa-minus' : 'fa-plus'} ms-auto`}></i>
        </div>

        {expandedPanels.influence && (
          <div className="model-section-content p-3">
            <div className="form-group">
              <label>Buffer Distance (meters)</label>
              <div className="buffer-control">
                <input
                  type="range"
                  className="buffer-slider"
                  min="0"
                  max="716"
                  value={buffer}
                  onChange={(e) => setBuffer(parseInt(e.target.value))}
                />
                <input
                  type="number"
                  className="buffer-input"
                  value={buffer}
                  onChange={(e) => setBuffer(parseInt(e.target.value))}
                  min="0"
                  max="716"
                />
                <span>m</span>
              </div>
              <div className="buffer-actions">
                <button className="btn btn-sm btn-primary" onClick={drawBuffer}>
                  ✏️ Draw
                </button>
                <button
                  className="btn btn-sm"
                  onClick={deleteBuffer}
                  disabled={!bufferDrawn}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={runInfluenceAnalysis}
              disabled={!bufferDrawn}
            >
              ▶️ Run
            </button>
          </div>
        )}
      </div>

      {/* Upload Assessment Result Panel */}
      <div className="sub-panel">
        <div className="model-section-header" onClick={() => togglePanel('upload')}>
          <span>📤 Upload Assessment Result</span>
          <small>(.png, .jpeg, .csv, .geoJson, .zip)</small>
          <i className={`fa-solid ${expandedPanels.upload ? 'fa-minus' : 'fa-plus'} ms-auto`}></i>
        </div>

        {expandedPanels.upload && (
          <div className="model-section-content p-3">
            <input type="file" className="form-control my-2" accept=".csv,.geojson,.zip,.png,.jpeg" />
            <div className="coordinates-section">
              <div className="coordinate-group">
                <label>Top Left Coordinates</label>
                <div className="coordinate-inputs">
                  <input type="number" className="form-control" placeholder="Latitude" step="0.0001" />
                  <input type="number" className="form-control" placeholder="Longitude" step="0.0001" />
                  <input type="number" className="form-control" placeholder="Altitude (mPD)" step="2" />
                </div>
              </div>
              <div className="coordinate-group">
                <label>Bottom Right Coordinates</label>
                <div className="coordinate-inputs">
                  <input type="number" className="form-control" placeholder="Latitude" step="0.0001" />
                  <input type="number" className="form-control" placeholder="Longitude" step="0.0001" />
                  <input type="number" className="form-control" placeholder="Altitude (mPD)" step="2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Air Ventilation Panel */}
      <div className="sub-panel">
        <div className="model-section-header" onClick={() => togglePanel('airVentilation')}>
          <span>💨 Air Ventilation</span>
          <i className={`fa-solid ${expandedPanels.airVentilation ? 'fa-minus' : 'fa-plus'} ms-auto`}></i>
        </div>

        {expandedPanels.airVentilation && (
          <div className="model-section-content p-3">
            <div className="form-group">
              <label>Simulation method</label>
              <select className="form-control">
                <option value="boltzmann">Boltzmann</option>
                <option value="navier-stokes">Navier-Stokes</option>
                <option value="open-foam">OpenFOAM</option>
              </select>
            </div>
            <div className="form-group">
              <label>Wind speed</label>
              <input type="number" className="form-control" min="0.1" max="50" step="0.1" defaultValue="12" />
            </div>
            <button className="btn btn-primary btn-sm" onClick={startSimulation}>
              Start simulation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AssessmentWizard