import React, { useMemo, useRef, useState } from 'react'
import './ImageRecognition.css'

const BASE_URL = import.meta.env.BASE_URL || '/'
const DEFAULT_MODEL_PATH = `${BASE_URL}models/best.onnx`
const DEFAULT_BACKEND_URL = 'http://localhost:5000/api/predict'
const INPUT_SIZE = 640
const CONF_THRESHOLD = 0.25
const IOU_THRESHOLD = 0.45
const ORT_LOCAL = `${BASE_URL}vendor/ort.min.js`
const ORT_CDN = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js'

const DEFAULT_CLASS_NAMES = ['bird', 'non-bird']

function resolveClassName(classId) {
  return DEFAULT_CLASS_NAMES[classId] || `class_${classId}`
}

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

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = src
    el.async = true
    el.onload = () => resolve()
    el.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(el)
  })
}

async function ensureOrtLoaded() {
  if (window.ort) return { ort: window.ort, source: 'global' }

  try {
    await loadScript(ORT_LOCAL)
    if (window.ort) return { ort: window.ort, source: 'local' }
  } catch {
    // ignore and fallback to CDN
  }

  await loadScript(ORT_CDN)
  if (!window.ort) {
    throw new Error('onnxruntime-web 加载失败，请在 public/vendor 放置 ort.min.js 或检查网络策略')
  }

  return { ort: window.ort, source: 'cdn' }
}


async function assertModelReachable(modelPath) {
  const response = await fetch(modelPath, { method: 'HEAD' })
  if (!response.ok) {
    throw new Error(`模型文件不可访问: ${modelPath} (HTTP ${response.status})`) 
  }
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
  const input = new Float32Array(3 * size * size)

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
    originW: image.width,
    originH: image.height,
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function sigmoid(x) {
  const z = Math.max(-50, Math.min(50, x))
  return 1 / (1 + Math.exp(-z))
}

function normalizeScore(raw) {
  if (Number.isNaN(raw)) return 0
  if (raw >= 0 && raw <= 1) return raw
  return sigmoid(raw)
}

function decodeYoloOutput(outputTensor, meta) {
  const { data, dims } = outputTensor

  if (dims.length === 3 && dims[2] === 6) {
    const rows = dims[1]
    const detections = []
    for (let i = 0; i < rows; i += 1) {
      const offset = i * 6
      const confidence = normalizeScore(data[offset + 4])
      if (confidence < CONF_THRESHOLD) continue

      detections.push({
        x1: clamp((data[offset] - meta.padX) / meta.ratio, 0, meta.originW),
        y1: clamp((data[offset + 1] - meta.padY) / meta.ratio, 0, meta.originH),
        x2: clamp((data[offset + 2] - meta.padX) / meta.ratio, 0, meta.originW),
        y2: clamp((data[offset + 3] - meta.padY) / meta.ratio, 0, meta.originH),
        confidence,
        class_id: Math.round(data[offset + 5]),
      })
    }
    return nms(detections, IOU_THRESHOLD)
  }

  let channels
  let candidates
  let channelMajor = true

  if (dims.length !== 3) {
    throw new Error(`Unsupported ONNX output dims: [${dims.join(', ')}]`)
  }

  // channels is usually small (e.g. 84/85), candidates is usually large (e.g. 8400)
  if (dims[1] <= 256) {
    channels = dims[1]
    candidates = dims[2]
    channelMajor = true
  } else {
    channels = dims[2]
    candidates = dims[1]
    channelMajor = false
  }

  if (channels < 5) {
    throw new Error(`Unexpected YOLO output channels: ${channels}. 请确认导出的是检测模型（detect）且未选错输出张量。`)
  }

  const detections = []

  for (let i = 0; i < candidates; i += 1) {
    const getter = (c) => (channelMajor ? data[c * candidates + i] : data[i * channels + c])

    const cx = getter(0)
    const cy = getter(1)
    const w = getter(2)
    const h = getter(3)

    // Strategy A: YOLOv8-style (no objectness): [x, y, w, h, cls...]
    let bestClassA = 0
    let bestScoreA = 0
    for (let cls = 0; cls < channels - 4; cls += 1) {
      const score = normalizeScore(getter(4 + cls))
      if (score > bestScoreA) {
        bestScoreA = score
        bestClassA = cls
      }
    }

    // Strategy B: YOLOv5-style (with objectness): [x, y, w, h, obj, cls...]
    let bestClassB = 0
    let bestScoreB = 0
    // For binary YOLOv8 heads (e.g. 4 + 2 classes => 6 channels),
    // index 4 is a class score, not objectness.
    // Only enable v5-style objectness branch when channels clearly allow [x,y,w,h,obj,cls...].
    if (channels >= 7) {
      const objectness = normalizeScore(getter(4))
      for (let cls = 0; cls < channels - 5; cls += 1) {
        const clsScore = normalizeScore(getter(5 + cls))
        const score = objectness * clsScore
        if (score > bestScoreB) {
          bestScoreB = score
          bestClassB = cls
        }
      }
    }

    const useObjHead = bestScoreB > bestScoreA
    const bestScore = useObjHead ? bestScoreB : bestScoreA
    const bestClass = useObjHead ? bestClassB : bestClassA

    if (bestScore < CONF_THRESHOLD) continue

    detections.push({
      x1: clamp((cx - w / 2 - meta.padX) / meta.ratio, 0, meta.originW),
      y1: clamp((cy - h / 2 - meta.padY) / meta.ratio, 0, meta.originH),
      x2: clamp((cx + w / 2 - meta.padX) / meta.ratio, 0, meta.originW),
      y2: clamp((cy + h / 2 - meta.padY) / meta.ratio, 0, meta.originH),
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

        ctx.strokeRect(det.x1, det.y1, det.x2 - det.x1, det.y2 - det.y1)

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
  const [runtimeSource, setRuntimeSource] = useState('unloaded')
  const [mode, setMode] = useState('browser')
  const [modelPath, setModelPath] = useState(DEFAULT_MODEL_PATH)
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL)
  const [modelFile, setModelFile] = useState(null)

  const fileInputRef = useRef(null)
  const modelInputRef = useRef(null)
  const sessionRef = useRef(null)
  const modelUrlRef = useRef(null)

  const modelHint = useMemo(() => `默认模型路径：${DEFAULT_MODEL_PATH}（也可直接上传 onnx 文件）`, [])

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

  const handleModelFileChange = (e) => {
    const file = e.target.files[0]
    setModelFile(file || null)
    sessionRef.current = null
    setRuntimeReady(false)
  }

  const ensureBrowserSession = async () => {
    if (sessionRef.current) return sessionRef.current

    const { ort, source } = await ensureOrtLoaded()
    ort.env.wasm.wasmPaths = source === 'local' ? `${BASE_URL}vendor/` : 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/'

    let resolvedModel = modelPath
    if (modelFile) {
      if (modelUrlRef.current) URL.revokeObjectURL(modelUrlRef.current)
      modelUrlRef.current = URL.createObjectURL(modelFile)
      resolvedModel = modelUrlRef.current
    } else {
      await assertModelReachable(resolvedModel)
    }

    const ortSession = await ort.InferenceSession.create(resolvedModel, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    })

    sessionRef.current = { ort, session: ortSession }
    setRuntimeReady(true)
    setRuntimeSource(source)
    return sessionRef.current
  }

  const runBrowserPredict = async () => {
    const browserRuntime = await ensureBrowserSession()
    const ort = browserRuntime.ort
    const ortSession = browserRuntime.session
    const image = await imageFromDataUrl(previewUrl)
    const prep = preprocessImage(image)
    const inputName = ortSession.inputNames[0]
    const tensor = new ort.Tensor('float32', prep.input, [1, 3, INPUT_SIZE, INPUT_SIZE])

    const outputMap = await ortSession.run({ [inputName]: tensor })

    // Some exports provide multiple outputs (e.g. boxes/scores separated).
    // Prefer a tensor that looks like YOLO logits: [1, C, N] or [1, N, C] with C >= 5.
    const outputTensors = Object.values(outputMap)
    const preferredTensor = outputTensors.find((t) => {
      const d = t.dims || []
      if (d.length !== 3) return false
      const looksLikeChannelsFirst = d[1] <= 256 && d[1] >= 5
      const looksLikeChannelsLast = d[2] <= 256 && d[2] >= 5
      return looksLikeChannelsFirst || looksLikeChannelsLast
    })

    const outputTensor = preferredTensor || outputMap[ortSession.outputNames[0]]

    const detections = decodeYoloOutput(outputTensor, prep).map((det) => ({
      ...det,
      class_name: resolveClassName(det.class_id),
      bbox: [det.x1, det.y1, det.x2, det.y2],
    }))

    const annotatedImage = await drawDetections(previewUrl, detections)

    return {
      success: true,
      count: detections.length,
      detections,
      annotated_image: annotatedImage,
    }
  }

  const runBackendPredict = async () => {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: previewUrl }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Backend prediction failed')
    return data
  }

  const handlePredict = async () => {
    if (!selectedImage || !previewUrl) return

    setLoading(true)
    setError(null)

    try {
      const data = mode === 'browser' ? await runBrowserPredict() : await runBackendPredict()
      setResult(data)
    } catch (err) {
      setError(
        `${err.message || 'Inference failed'}。` +
          '若提示模型不可访问，请确认 public/models/best.onnx 并重启 npm run dev；若提示 external data file，请用导出脚本加 --inline-weights；若 CDN 被拦截，请把 ort.min.js 放到 public/vendor/。'
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
        <div className="runtime-mode-row">
          <label>
            <input type="radio" checked={mode === 'browser'} onChange={() => setMode('browser')} /> Browser ONNX
          </label>
          <label>
            <input type="radio" checked={mode === 'backend'} onChange={() => setMode('backend')} /> Backend API
          </label>
        </div>

        {mode === 'browser' && (
          <>
            <div className="runtime-hint">
              <span className={`status-dot ${runtimeReady ? 'ready' : 'pending'}`} />
              <span>
                {runtimeReady ? `ONNX Runtime 已就绪（来源: ${runtimeSource}）` : '首次运行会加载 ONNX Runtime（优先本地 /vendor/ort.min.js）'}
              </span>
            </div>

            <div className="upload-section compact">
              <label>ONNX Model Path</label>
              <input
                type="text"
                value={modelPath}
                onChange={(e) => {
                  setModelPath(e.target.value)
                  sessionRef.current = null
                  setRuntimeReady(false)
                }}
                placeholder={DEFAULT_MODEL_PATH}
                disabled={loading || !!modelFile}
              />
              <p className="help-text">{modelHint}</p>
              <p className="help-text">当前请求 URL: <code>{modelPath}</code></p>
              <input
                ref={modelInputRef}
                type="file"
                accept=".onnx"
                onChange={handleModelFileChange}
                disabled={loading}
              />
            </div>
          </>
        )}

        {mode === 'backend' && (
          <div className="upload-section compact">
            <label>Backend API URL</label>
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://localhost:5000/api/predict"
              disabled={loading}
            />
          </div>
        )}

        <div className="upload-section">
          <label>Upload Image for Recognition</label>
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
                {loading ? 'Analyzing...' : mode === 'browser' ? 'Run Browser ONNX' : 'Run Backend API'}
              </button>
              <button className="btn btn-secondary" onClick={handleClear} disabled={loading}>Clear</button>
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <p>{mode === 'browser' ? 'Running ONNX in browser...' : 'Calling backend API...'}</p>
          </div>
        )}

        {error && <div className="error-state"><p className="error-message">⚠️ {error}</p></div>}

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
          </div>
        )}
      </div>
    </div>
  )
}
