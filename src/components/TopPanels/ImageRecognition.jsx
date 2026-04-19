import React, { useState, useRef } from 'react'
import './ImageRecognition.css'

export default function ImageRecognition({ onClose }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
        setResult(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePredict = async () => {
    if (!selectedImage) return

    setLoading(true)
    setError(null)

    try {
      // Convert image to base64
      const base64Image = previewUrl

      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed')
      }

      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="top-panel image-recognition-panel">
      <div className="panel-header">
        <h3><span className="emoji">🔍</span> Image Recognition</h3>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>
      
      <div className="panel-content">
        {/* Upload Section */}
        <div className="upload-section">
          <label>Upload Image for Recognition</label>
          <p className="help-text">Supported formats: JPG, PNG, JPEG</p>
          
          <div className="file-input-wrapper">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>
        </div>

        {/* Preview Section */}
        {previewUrl && (
          <div className="preview-section">
            <div className="image-container">
              <img src={previewUrl} alt="Preview" className="preview-image" />
            </div>
            
            <div className="action-buttons">
              <button 
                className="btn btn-primary" 
                onClick={handlePredict}
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Run Recognition'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleClear}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Running inference...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p className="error-message">⚠️ {error}</p>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="results-section">
            <div className="results-header">
              <h4>Recognition Results</h4>
              <span className="detection-count">{result.count} objects detected</span>
            </div>

            {/* Annotated Image */}
            {result.annotated_image && (
              <div className="annotated-image-container">
                <img 
                  src={result.annotated_image} 
                  alt="Annotated Result" 
                  className="annotated-image" 
                />
              </div>
            )}

            {/* Detection List */}
            {result.detections && result.detections.length > 0 && (
              <div className="detections-list">
                <h5>Detections:</h5>
                <ul>
                  {result.detections.map((detection, index) => (
                    <li key={index} className="detection-item">
                      <span className="class-name">{detection.class_name}</span>
                      <span className="confidence">
                        {(detection.confidence * 100).toFixed(2)}%
                      </span>
                      <span className="bbox">
                        [{detection.bbox.map(b => b.toFixed(1)).join(', ')}]
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.detections && result.detections.length === 0 && (
              <p className="empty-state">No objects detected</p>
            )}
          </div>
        )}

        {/* Empty State */}
        {!previewUrl && !loading && !result && (
          <div className="empty-state">
            <p>Upload an image to start recognition</p>
          </div>
        )}
      </div>
    </div>
  )
}
