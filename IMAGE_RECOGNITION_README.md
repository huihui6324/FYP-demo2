# 图像识别 API 使用说明

## 概述

本项目已集成 YOLO 图像识别模型，提供 RESTful API 供前端调用。

## 文件结构

```
/workspace
├── server.py                          # Flask API 服务器
├── model/
│   ├── best.pt                        # YOLO 模型权重文件
│   ├── run(基本執行程式).py           # 原始测试脚本
│   ├── test.jpg                       # 测试图片
│   └── requirements.txt               # Python 依赖
└── src/components/TopPanels/
    ├── ImageRecognition.jsx           # React 图像识别组件
    └── ImageRecognition.css           # 组件样式
```

## 后端部署

### 1. 安装依赖

```bash
cd /workspace
pip install flask flask-cors ultralytics opencv-python-headless Pillow
```

### 2. 启动 API 服务器

```bash
python server.py
```

服务器将在 `http://localhost:5000` 启动

### 3. API 端点

#### 健康检查
```bash
GET http://localhost:5000/api/health
```

响应:
```json
{
  "status": "ok",
  "model_loaded": true
}
```

#### 图像识别
```bash
POST http://localhost:5000/api/predict
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

或者使用表单上传:
```bash
POST http://localhost:5000/api/predict
Content-Type: multipart/form-data

image: [file]
```

响应:
```json
{
  "success": true,
  "detections": [
    {
      "bbox": [x1, y1, x2, y2],
      "confidence": 0.95,
      "class_id": 0,
      "class_name": "person"
    }
  ],
  "annotated_image": "data:image/jpeg;base64,...",
  "count": 1
}
```

## 前端使用

### 1. 访问图像识别功能

在地图页面 (`/map`)，点击顶部工具栏的 🖼️ 图标即可打开图像识别面板。

### 2. 使用流程

1. 点击上传按钮选择图片
2. 预览图片确认无误
3. 点击 "Run Recognition" 开始识别
4. 查看识别结果和标注图片

## 注意事项

1. **磁盘空间**: 确保服务器有足够的磁盘空间 (建议至少 2GB)
2. **CORS**: API 已配置 CORS，允许前端跨域访问
3. **模型路径**: 确保 `best.pt` 文件位于 `/workspace/model/` 目录
4. **生产环境**: 生产部署时请使用 Gunicorn 或 uWSGI

## 故障排除

### 问题：模块未找到
```bash
# 重新安装依赖
pip install -r model/requirements.txt
```

### 问题：端口被占用
```bash
# 修改 server.py 中的端口号
app.run(host='0.0.0.0', port=5001, debug=True)
```

### 问题：模型加载失败
确保 `best.pt` 文件完整且未损坏，可重新下载或训练模型。

## 扩展功能

如需添加更多功能，可修改:
- `server.py`: 添加新的 API 端点
- `ImageRecognition.jsx`: 修改前端 UI 和交互逻辑
- `ImageRecognition.css`: 自定义样式

## 导出可在网页侧运行的 ONNX 模型

> 说明：网页侧通常使用 `onnxruntime-web` 推理，因此建议导出 **静态尺寸**、`opset=17` 的 ONNX。

### 1) 安装 Python 依赖

```bash
cd /workspace/FYP-demo2
python3 -m pip install -r src/model/requirements.txt
```

### 2) 导出 ONNX

```bash
cd /workspace/FYP-demo2/src/model
python3 export_web_onnx.py --weights best.pt --imgsz 640 --opset 17 --simplify
```

导出后会得到 `best.onnx`（默认在当前目录）。

### 3) （可选）导出时把 NMS 融进模型

```bash
python3 export_web_onnx.py --weights best.pt --imgsz 640 --opset 17 --simplify --nms
```

如果你的前端已经自己做后处理（NMS），建议不要加 `--nms`，保持模型输出更通用。

## 已整合到网页端（浏览器本地 ONNX 推理）

现在 `src/components/TopPanels/ImageRecognition.jsx` 已改为直接在浏览器中运行 ONNX：

1. 将导出的 `best.onnx` 放到：`public/models/best.onnx`
2. 启动前端：

```bash
npm run dev
```

3. 进入地图页面，打开图像识别面板后即可直接在网页侧推理（不再依赖 `/api/predict`）。

> 说明：组件会自动从 CDN 加载 `onnxruntime-web`，首次推理会稍慢。

### CDN 被拦截 / 模型 404 的处理

如果浏览器控制台出现：
- `Tracking Prevention blocked ... onnxruntime-web ...`
- `models/best.onnx 404`

可按以下方式处理：

1. **ONNX Runtime 本地化（推荐）**：将 `ort.min.js` 放到 `public/vendor/ort.min.js`，前端会优先加载本地文件。
2. **模型路径问题**：确认模型在 `public/models/best.onnx`，或在界面里直接上传 `.onnx` 文件。
3. **快速兜底**：切换到 `Backend API` 模式，填写 `http://localhost:5000/api/predict`，走原 Flask 推理链路。
