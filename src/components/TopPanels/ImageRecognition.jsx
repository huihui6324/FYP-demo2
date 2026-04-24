import React, { useMemo, useRef, useState } from 'react'
import './ImageRecognition.css'

const MODEL_PATH = '/models/best.onnx'
const INPUT_SIZE = 640
const CONF_THRESHOLD = 0.25
const IOU_THRESHOLD = 0.45

const ORT_CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js'

function iou(a, b) {
  const x1 = Math.max(a.x1, b.x1)
  const y1 = Math.max(a.y1, b.y1)
  const x2 = Math.min(a.x2, b.x2)
  const y2 = Math.min(a.y2, b.y2)
  const w = Math.max(0, x2 - x1)
  const h = Math.max(0, y2 - y1)
  const inter = w * h
  const areaA = Math.max(0, a.x2 - a.x1) * Math.max(0, a.y2 - a.y1)
  const areaB = Math.max(0, b.x2 - b.x1) * Math.max(0, b.y2 - b.y1)
  return inter / (areaA + areaB - inter + 1e-6)
}

function nms(boxes, iouThreshold) {
  const sorted = [...boxes].sort((a, b) => b.confidence - a.confidence)
  const keep = []
  while (sorted.length) {
    const best = sorted.shift()
    keep.push(best)
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      if (best.class_id !== sorted[i].class_id) continue
      if (iou(best, sorted[i]) > iouThreshold) sorted.splice(i, 1)
    }
  }
  return keep
}

function ensureOrtLoaded() {
  if (window.ort) return Promise.resolve(window.ort)

  const existing = document.getElementById('ort-web-cdn')
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(window.ort), { once: true })
      existing.addEventListener('error', () => reject(new Error('Failed to load onnxruntime-web from CDN')), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = 'ort-web-cdn'
    script.src = ORT_CDN
    script.async = true
    script.onload = () => resolve(window.ort)
    script.onerror = () => reject(new Error('Failed to load onnxruntime-web from CDN'))
    document.head.appendChild(script)
  })
}

function imageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = dataUrl
  })
}

function preprocessImage(image, size = INPUT_SIZE) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const scale = Math.min(size / image.width, size / image.height)
  const resizedW = Math.round(image.width * scale)
  const resizedH = Math.round(image.height * scale)
  const dx = Math.floor((size - resizedW) / 2)
  const dy = Math.floor((size - resizedH) / 2)

  ctx.fillStyle = 'rgb(114, 114, 114)'
  ctx.fillRect(0, 0, size, size)
  ctx.drawImage(image, dx, dy, resizedW, resizedH)

  const { data } = ctx.getImageData(0, 0, size, size)
  const input = new Float32Array(1 * 3 * size * size)

  let px = 0
  const plane = size * size
  for (let i = 0; i < data.length; i += 4) {
    input[px] = data[i] / 255
    input[plane + px] = data[i + 1] / 255
    input[plane * 2 + px] = data[i + 2] / 255
    px += 1
  }

  return {
    input,
    ratio: scale,
    padX: dx,
    padY: dy,
    modelW: size,
    modelH: size,
    originW: image.width,
    originH: image.height,
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function decodeYoloOutput(outputTensor, meta) {
  const { data, dims } = outputTensor

  if (dims.length === 3 && dims[2] === 6) {
    const rows = dims[1]
    const detections = []
    for (let i = 0; i < rows; i += 1) {
      const offset = i * 6
      const x1 = data[offset]
      const y1 = data[offset + 1]
      const x2 = data[offset + 2]
      const y2 = data[offset + 3]
      const confidence = data[offset + 4]
      const classId = Math.round(data[offset + 5])
      if (confidence < CONF_THRESHOLD) continue

      detections.push({
        x1: clamp((x1 - meta.padX) / meta.ratio, 0, meta.originW),
        y1: clamp((y1 - meta.padY) / meta.ratio, 0, meta.originH),
        x2: clamp((x2 - meta.padX) / meta.ratio, 0, meta.originW),
        y2: clamp((y2 - meta.padY) / meta.ratio, 0, meta.originH),
        confidence,
        class_id: classId,
      })
    }
    return nms(detections, IOU_THRESHOLD)
  }

  let channels
  let candidates
  let channelMajor = true

  if (dims.length === 3 && dims[1] > dims[2]) {
    channels = dims[1]
    candidates = dims[2]
    channelMajor = true
  } else if (dims.length === 3) {
    channels = dims[2]
    candidates = dims[1]
    channelMajor = false
  } else {
    throw new Error(`Unsupported ONNX output dims: [${dims.join(', ')}]`)
  }

  if (channels < 6) {
    throw new Error(`Unexpected YOLO output channels: ${channels}`)
  }

  const classCount = channels - 4
  const detections = []

  for (let i = 0; i < candidates; i += 1) {
    const getter = (c) => (channelMajor ? data[c * candidates + i] : data[i * channels + c])

    const cx = getter(0)
    const cy = getter(1)
    const w = getter(2)
    const h = getter(3)

    let bestClass = 0
    let bestScore = 0
    for (let cls = 0; cls < classCount; cls += 1) {
      const score = getter(4 + cls)
      if (score > bestScore) {
        bestScore = score
        bestClass = cls
      }
    }

    if (bestScore < CONF_THRESHOLD) continue

    const x1 = cx - w / 2
    const y1 = cy - h / 2
    const x2 = cx + w / 2
    const y2 = cy + h / 2

    detections.push({
      x1: clamp((x1 - meta.padX) / meta.ratio, 0, meta.originW),
      y1: clamp((y1 - meta.padY) / meta.ratio, 0, meta.originH),
      x2: clamp((x2 - meta.padX) / meta.ratio, 0, meta.originW),
      y2: clamp((y2 - meta.padY) / meta.ratio, 0, meta.originH),
      confidence: bestScore,
      class_id: bestClass,
    })
  }

  return nms(detections, IOU_THRESHOLD)
}

function drawDetections(dataUrl, detections) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const ctx = canvas.getContext('2d')

      ctx.drawImage(image, 0, 0)
      ctx.lineWidth = 2
      ctx.font = '16px sans-serif'

      detections.forEach((det) => {
        ctx.strokeStyle = '#00E676'
        ctx.fillStyle = '#00E676'

        const width = det.x2 - det.x1
        const height = det.y2 - det.y1

        ctx.strokeRect(det.x1, det.y1, width, height)

        const text = `${det.class_name} ${(det.confidence * 100).toFixed(1)}%`
        const metrics = ctx.measureText(text)
        const textHeight = 20
        const tx = det.x1
        const ty = Math.max(0, det.y1 - textHeight)

        ctx.fillRect(tx, ty, metrics.width + 10, textHeight)
        ctx.fillStyle = '#000'
        ctx.fillText(text, tx + 5, ty + 15)
      })

      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    image.onerror = reject
    image.src = dataUrl
  })
}

export default function ImageRecognition({ onClose }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [runtimeReady, setRuntimeReady] = useState(false)
  const fileInputRef = useRef(null)
  const sessionRef = useRef(null)

  const modelHint = useMemo(() => `请将模型放在 public${MODEL_PATH}`, [])

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSelectedImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result)
      setResult(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const ensureSession = async () => {
    if (sessionRef.current) return sessionRef.current

    const ort = await ensureOrtLoaded()
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/'
    const session = await ort.InferenceSession.create(MODEL_PATH, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    })
    sessionRef.current = { ort, session }
    setRuntimeReady(true)
    return sessionRef.current
  }

  const handlePredict = async () => {
    if (!selectedImage || !previewUrl) return

    setLoading(true)
    setError(null)

    try {
      const { ort, session } = await ensureSession()
      const image = await imageFromDataUrl(previewUrl)
      const prep = preprocessImage(image)
      const inputName = session.inputNames[0]
      const tensor = new ort.Tensor('float32', prep.input, [1, 3, INPUT_SIZE, INPUT_SIZE])

      const outputMap = await session.run({ [inputName]: tensor })
      const outputName = session.outputNames[0]
      const outputTensor = outputMap[outputName]

      const detections = decodeYoloOutput(outputTensor, prep).map((det) => ({
        ...det,
        class_name: `class_${det.class_id}`,
        bbox: [det.x1, det.y1, det.x2, det.y2],
      }))

      const annotatedImage = await drawDetections(previewUrl, detections)

      setResult({
        success: true,
        count: detections.length,
        detections,
        annotated_image: annotatedImage,
      })
    } catch (err) {
      setError(
        `${err.message || 'Inference failed'}。请确认 ${MODEL_PATH} 存在且是通过 export_web_onnx.py 导出的 YOLO ONNX 文件。`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="top-panel image-recognition-panel">
      <div className="panel-header">
        <h3><span className="emoji">🔍</span> Image Recognition (Web ONNX)</h3>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>

      <div className="panel-content">
        <div className="runtime-hint">
          <span className={`status-dot ${runtimeReady ? 'ready' : 'pending'}`} />
          <span>{runtimeReady ? 'ONNX Runtime 已就绪（浏览器本地推理）' : '首次运行会自动加载 ONNX Runtime'}</span>
        </div>

        <div className="upload-section">
          <label>Upload Image for Recognition</label>
          <p className="help-text">{modelHint}</p>
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

        {previewUrl && (
          <div className="preview-section">
            <div className="image-container">
              <img src={previewUrl} alt="Preview" className="preview-image" />
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={handlePredict} disabled={loading}>
                {loading ? 'Analyzing...' : 'Run Recognition (ONNX in Browser)'}
              </button>
              <button className="btn btn-secondary" onClick={handleClear} disabled={loading}>
                Clear
              </button>
              <button className="btn btn-secondary" onClick={handleClear} disabled={loading}>Clear</button>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>Running ONNX inference in browser...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <p className="error-message">⚠️ {error}</p>
          </div>
        )}

        {result && (
          <div className="results-section">
            <div className="results-header">
              <h4>Recognition Results</h4>
              <span className="detection-count">{result.count} objects detected</span>
            </div>

            {result.annotated_image && (
              <div className="annotated-image-container">
                <img src={result.annotated_image} alt="Annotated Result" className="annotated-image" />
              </div>
            )}

            {result.detections && result.detections.length > 0 && (
              <div className="detections-list">
                <h5>Detections:</h5>
                <ul>
                  {result.detections.map((detection, index) => (
                    <li key={index} className="detection-item">
                      <span className="class-name">{detection.class_name}</span>
                      <span className="confidence">{(detection.confidence * 100).toFixed(2)}%</span>
                      <span className="bbox">[{detection.bbox.map((b) => b.toFixed(1)).join(', ')}]</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.detections && result.detections.length === 0 && <p className="empty-state">No objects detected</p>}
          </div>
        )}

        {!previewUrl && !loading && !result && (
          <div className="empty-state">
            <p>Upload an image to start recognition</p>
          </div>
        )}
      </div>
    </div>
  )
}
