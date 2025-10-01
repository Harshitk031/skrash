import React, { useRef, useEffect, useState } from 'react';
import './Canvas.css';

const Canvas = ({ roomCode, canDraw, penColor, brushSize, socket, onBrushSizeChange }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width - 20;
      canvas.height = rect.height - 20;
      
      // Set default styles
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Socket event listeners for drawing
    const handleOtherPosition = (position) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      
      // Set the drawing context to match the sender's settings
      ctx.lineWidth = position.brushsize || brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = position.color || penColor;
      
      // Draw the line from last position to current position
      ctx.beginPath();
      ctx.moveTo(position.lastX || position.x, position.lastY || position.y);
      ctx.lineTo(position.x, position.y);
      ctx.stroke();
    };

    const handleClearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on('otherPOS', handleOtherPosition);
    socket.on('clearCanvas', handleClearCanvas);

    return () => {
      socket.off('otherPOS', handleOtherPosition);
      socket.off('clearCanvas', handleClearCanvas);
    };
  }, [socket, penColor, brushSize]);

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawing = (pos) => {
    if (!canDraw) return;
    
    setIsDrawing(true);
    setLastPos(pos);
    
    // startPaint removed; drawing sync handled via 'position'
  };

  const draw = (pos) => {
    if (!canDraw || !isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Draw on local canvas
    ctx.beginPath();
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // Emit position to other players with all necessary data
    if (socket) {
      socket.emit('position', {
        roomCode,
        x: pos.x, 
        y: pos.y, 
        lastX: lastPos.x,
        lastY: lastPos.y,
        brushsize: brushSize,
        color: penColor
      });
    }

    setLastPos(pos);
  };

  const stopDrawing = () => {
    if (!canDraw) return;
    
    setIsDrawing(false);
    
    // startPaint removed
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    startDrawing(pos);
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);
    draw(pos);
  };

  const handleMouseUp = () => {
    stopDrawing();
  };

  const handleMouseLeave = () => {
    stopDrawing();
  };

  const handleTouchStart = (e) => {
    // Only prevent default if we're actually drawing
    if (canDraw) {
      e.preventDefault();
    }
    const pos = getTouchPos(e);
    startDrawing(pos);
  };

  const handleTouchMove = (e) => {
    // Only prevent default if we're actually drawing
    if (canDraw) {
      e.preventDefault();
    }
    const pos = getTouchPos(e);
    draw(pos);
  };

  const handleTouchEnd = (e) => {
    // Only prevent default if we're actually drawing
    if (canDraw) {
      e.preventDefault();
    }
    stopDrawing();
  };

  const handleWheel = (e) => {
    // Handle brush size change with scroll wheel
    if (canDraw && onBrushSizeChange) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -1 : 1;
      const newSize = Math.max(1, Math.min(20, brushSize + delta));
      if (newSize !== brushSize) {
        onBrushSizeChange(newSize);
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="drawing-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{ cursor: canDraw ? 'crosshair' : 'default' }}
    />
  );
};

export default Canvas;
