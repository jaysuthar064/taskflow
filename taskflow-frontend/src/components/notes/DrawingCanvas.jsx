import React, { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 320;

const DrawingCanvas = ({ value = "", onChange, className = "" }) => {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 3;
    context.strokeStyle = "#e8eaed";

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (!value) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = value;
  }, [value]);

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) {
      return null;
    }

    const rect = wrapper.getBoundingClientRect();
    const clientX = "touches" in event ? event.touches[0]?.clientX : event.clientX;
    const clientY = "touches" in event ? event.touches[0]?.clientY : event.clientY;

    if (clientX == null || clientY == null) {
      return null;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (event) => {
    const point = getPoint(event);
    const context = canvasRef.current?.getContext("2d");

    if (!point || !context) {
      return;
    }

    event.preventDefault();
    context.beginPath();
    context.moveTo(point.x, point.y);
    setIsDrawing(true);
  };

  const continueDrawing = (event) => {
    if (!isDrawing) {
      return;
    }

    const point = getPoint(event);
    const context = canvasRef.current?.getContext("2d");

    if (!point || !context) {
      return;
    }

    event.preventDefault();
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) {
      return;
    }

    setIsDrawing(false);
    onChange(canvasRef.current?.toDataURL("image/png") || "");
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        ref={wrapperRef}
        className="overflow-hidden rounded-[1.25rem] border border-[#5f6368] bg-[#232427] shadow-inner"
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={startDrawing}
          onMouseMove={continueDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={continueDrawing}
          onTouchEnd={stopDrawing}
          className="block h-[220px] w-full touch-none bg-transparent"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#9aa0a6]">
          Draw with your mouse or finger. The sketch saves with the task.
        </p>
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center rounded-full border border-[#5f6368] px-3 py-2 text-xs font-semibold text-[#e8eaed] transition-colors hover:border-[#8ab4f8] hover:text-[#8ab4f8]"
        >
          <Eraser size={14} className="mr-2" />
          Clear
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas;
