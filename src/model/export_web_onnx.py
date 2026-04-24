"""Export a YOLO .pt model to ONNX format for browser inference.

Usage:
    python export_web_onnx.py --weights best.pt --imgsz 640 --opset 17
"""

from __future__ import annotations

import argparse
from pathlib import Path
import shutil

from ultralytics import YOLO


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export YOLO model to ONNX for web (onnxruntime-web) use"
    )
    parser.add_argument(
        "--weights",
        type=Path,
        default=Path("best.pt"),
        help="Path to YOLO .pt weights",
    )
    parser.add_argument(
        "--imgsz",
        type=int,
        default=640,
        help="Static image size for export (recommended: 640)",
    )
    parser.add_argument(
        "--opset",
        type=int,
        default=17,
        help="ONNX opset version (recommended: 17 for web)",
    )
    parser.add_argument(
        "--simplify",
        action="store_true",
        help="Whether to run ONNX graph simplification",
    )
    parser.add_argument(
        "--nms",
        action="store_true",
        help="Bake NMS into ONNX graph (optional)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("."),
        help="Directory where exported ONNX will be placed",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if not args.weights.exists():
        raise FileNotFoundError(f"Weights file not found: {args.weights}")

    model = YOLO(str(args.weights))

    output_path = model.export(
        format="onnx",
        imgsz=args.imgsz,
        dynamic=False,
        half=False,
        int8=False,
        simplify=args.simplify,
        opset=args.opset,
        nms=args.nms,
    )

    output_path = Path(output_path)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    target_dir = args.output_dir.resolve()
    if output_path.resolve().parent != target_dir:
        target_path = target_dir / output_path.name
        shutil.move(str(output_path), str(target_path))
        output_path = target_path

    print("✅ Export done:", output_path)


if __name__ == "__main__":
    main()
