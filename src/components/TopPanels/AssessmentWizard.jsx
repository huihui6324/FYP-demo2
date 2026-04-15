// src/components/TopPanels/AssessmentWizard.jsx
import React, { useState } from 'react'

export default function AssessmentWizard({ onClose }) {
  const [assessmentStep, setAssessmentStep] = useState(0)
  const [selectedAssessment, setSelectedAssessment] = useState(null)
  const [assessmentConfig, setAssessmentConfig] = useState({
    influenceType: 'shadow',
    analysisDate: '',
    analysisTime: '',
    windDirection: 'north',
    windSpeed: 5,
    noiseSource: 'traffic',
    noiseLevel: 70,
    airPollutant: 'PM2.5',
    emissionRate: 100
  })

  const selectAssessmentType = (type) => {
    setSelectedAssessment(type)
    setAssessmentStep(1)
  }

  const resetAssessmentWizard = () => {
    setAssessmentStep(0)
    setSelectedAssessment(null)
    setAssessmentConfig({
      influenceType: 'shadow',
      analysisDate: '',
      analysisTime: '',
      windDirection: 'north',
      windSpeed: 5,
      noiseSource: 'traffic',
      noiseLevel: 70,
      airPollutant: 'PM2.5',
      emissionRate: 100
    })
  }

  const runAssessment = () => {
    alert(`Running ${selectedAssessment} assessment with config: ${JSON.stringify(assessmentConfig, null, 2)}`)
    setAssessmentStep(3)
  }

  return (
    <div className="top-panel assessment-panel">
      <div className="panel-header">
        <h3><span className="emoji">📊</span> Assessment Wizard</h3>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>
      <div className="panel-content">
        {/* Step 0: 选择评估类型 */}
        {assessmentStep === 0 && (
          <div className="assessment-options">
            <button className="assessment-btn" onClick={() => selectAssessmentType('influence')}>
              <span className="emoji emoji-icon-small">📈</span>
              <span>Influence Analysis</span>
            </button>
            <button className="assessment-btn" onClick={() => selectAssessmentType('ventilation')}>
              <span className="emoji emoji-icon-small">💨</span>
              <span>Air Ventilation</span>
            </button>
            <button className="assessment-btn" onClick={() => selectAssessmentType('noise')}>
              <span className="emoji emoji-icon-small">🔇</span>
              <span>Noise Impact Assessment</span>
            </button>
            <button className="assessment-btn" onClick={() => selectAssessmentType('air')}>
              <span className="emoji emoji-icon-small">🌬️</span>
              <span>Air Impact Assessment</span>
            </button>
          </div>
        )}

        {/* Step 1: 配置参数 */}
        {assessmentStep === 1 && selectedAssessment && (
          <div className="assessment-config">
            <div className="config-header">
              <h4>Configure {selectedAssessment === 'influence' ? 'Influence Analysis' : 
                               selectedAssessment === 'ventilation' ? 'Air Ventilation' :
                               selectedAssessment === 'noise' ? 'Noise Impact' : 'Air Impact'}
              </h4>
              <button className="btn-sm" onClick={resetAssessmentWizard}>✕ Close</button>
            </div>

            {/* Influence Analysis 配置 */}
            {selectedAssessment === 'influence' && (
              <div className="config-form">
                <div className="form-group">
                  <label>Influence Type</label>
                  <select 
                    className="form-select" 
                    value={assessmentConfig.influenceType}
                    onChange={(e) => setAssessmentConfig({...assessmentConfig, influenceType: e.target.value})}
                  >
                    <option value="shadow">Shadow Analysis</option>
                    <option value="sunlight">Sunlight Hours</option>
                    <option value="visibility">Visibility</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Analysis Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={assessmentConfig.analysisDate}
                    onChange={(e) => setAssessmentConfig({...assessmentConfig, analysisDate: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Analysis Time</label>
                  <input 
                    type="time" 
                    className="form-input"
                    value={assessmentConfig.analysisTime}
                    onChange={(e) => setAssessmentConfig({...assessmentConfig, analysisTime: e.target.value})}
                  />
                </div>
              </div>
            )}

            {/* Air Ventilation 配置 */}
            {selectedAssessment === 'ventilation' && (
              <div className="config-form">
                <div className="form-group">
                  <label>Wind Direction</label>
                  <select 
                    className="form-select"
                    value={assessmentConfig.windDirection}
                    onChange={(e) => setAssessmentConfig({...assessmentConfig, windDirection: e.target.value})}
                  >
                    <option value="north">North (0°)</option>
                    <option value="northeast">Northeast (45°)</option>
                    <option value="east">East (90°)</option>
                    <option value="southeast">Southeast (135°)</option>
                    <option value="south">South (180°)</option>
                    <option value="southwest">Southwest (225°)</option>
                    <option value="west">West (270°)</option>
                    <option value="northwest">Northwest (315°)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Wind Speed (m/s)</label>
                  <input 
                    type="range" 
                    className="form-range"
                    min="0" max="30" step="0.5"
                    value={assessmentConfig.windSpeed}
                    onChange={(e) => setAssessmentConfig({...assessmentConfig, windSpeed: parseFloat(e.target.value)})}
                  />
                  <span className="range-value">{assessmentConfig.windSpeed} m/s</span>
                </div>
              </div>
            )}

            {/* Noise Impact 配置 */}
            {selectedAssessment === 'noise' && (
              <div className="config-form">
                <div className="form-group">
                  <label>Noise Source</label>
                  <select 
                    className="form-select"
                    value={assessmentConfig.noiseSource}
                    onChange={(e) => setAssessmentConfig({...assessmentConfig, noiseSource: e.target.value})}
                  >
                    <option value="traffic">Traffic</option>
                    <option value="construction">Construction</option>
                    <option value="industrial">Industrial</option>
                    <option value="airport">Airport</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Noise Level (dB)</label>
                  <input 
                    type="range" 
                    className="form-range"
                    min="30" max="120" step="5"
                    value={assessmentConfig.noiseLevel}
                    onChange={(e) => setAssessmentConfig({...assessmentConfig, noiseLevel: parseInt(e.target.value)})}
                  />
                  <span className="range-value">{assessmentConfig.noiseLevel} dB</span>
                </div>
              </div>
            )}

            {/* Air Impact 配置 */}
            {selectedAssessment === 'air' && (
              <div className="config-form">
                <div className="form-group">
                  <label>Pollutant Type</label>
                  <select 
                    className="form-select"
                    value={assessmentConfig.airPollutant}
                    onChange={(e) => setAssessmentConfig({...assessmentConfig, airPollutant: e.target.value})}
                  >
                    <option value="PM2.5">PM2.5</option>
                    <option value="PM10">PM10</option>
                    <option value="NO2">NO2</option>
                    <option value="SO2">SO2</option>
                    <option value="O3">O3</option>
                    <option value="CO">CO</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Emission Rate (kg/h)</label>
                  <input 
                    type="range" 
                    className="form-range"
                    min="0" max="1000" step="10"
                    value={assessmentConfig.emissionRate}
                    onChange={(e) => setAssessmentConfig({...assessmentConfig, emissionRate: parseInt(e.target.value)})}
                  />
                  <span className="range-value">{assessmentConfig.emissionRate} kg/h</span>
                </div>
              </div>
            )}

            <div className="config-actions">
              <button className="btn-secondary" onClick={() => setAssessmentStep(0)}>← Back</button>
              <button className="btn-primary" onClick={runAssessment}>Run Analysis →</button>
            </div>
          </div>
        )}

        {/* Step 3: 结果展示 */}
        {assessmentStep === 3 && (
          <div className="assessment-results">
            <div className="results-header">
              <h4>✅ Analysis Complete</h4>
              <button className="btn-sm" onClick={resetAssessmentWizard}>✕ Close</button>
            </div>
            <div className="results-content">
              <div className="result-summary">
                <p><strong>Assessment Type:</strong> {selectedAssessment}</p>
                <p><strong>Status:</strong> Completed successfully</p>
                <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              </div>
              <div className="result-viz">
                <div className="placeholder-viz">
                  <span className="emoji">📊</span>
                  <p>Visualization would appear here</p>
                  <p className="help-text">In a production environment, this would show heatmap overlays, charts, or 3D analysis results on the map.</p>
                </div>
              </div>
              <div className="result-actions">
                <button className="btn-secondary" onClick={() => setAssessmentStep(1)}>← Reconfigure</button>
                <button className="btn-primary" onClick={() => alert('Downloading report...')}>📥 Download Report</button>
                <button className="btn-success" onClick={() => alert('Sharing results...')}>📤 Share Results</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
