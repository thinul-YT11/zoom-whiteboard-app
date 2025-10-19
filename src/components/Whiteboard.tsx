'use client';

import { useEffect, useRef, useState } from 'react';

const Whiteboard = ({ socket }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (socket) {
      socket.on('drawing', (data) => {
        const { x0, y0, x1, y1, color } = data;
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
      });
    }
  }, [socket]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    context.moveTo(offsetX, offsetY);
  };

  const finishDrawing = () => {
    setIsDrawing(false);
    const context = canvasRef.current.getContext('2d');
    context.closePath();
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    const context = canvasRef.current.getContext('2d');
    context.lineTo(offsetX, offsetY);
    context.stroke();

    if (socket) {
      socket.emit('drawing', {
        x0: offsetX - nativeEvent.movementX,
        y0: offsetY - nativeEvent.movementY,
        x1: offsetX,
        y1: offsetY,
        color: 'black',
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
      width={800}
      height={600}
      className="bg-white"
    />
  );
};

export default Whiteboard;
