
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Friend, ZonedTime } from '../types';
import { getZonedTime } from '../services/timeService';

interface AnalogClockProps {
  friends: Friend[];
  selectedId: string;
  manualOffset: number;
  onOffsetChange: (delta: number) => void;
  showWorkMode: boolean;
  onDraggingChange: (isDragging: boolean) => void;
}

const AnalogClock: React.FC<AnalogClockProps> = ({
  friends,
  selectedId,
  manualOffset,
  onOffsetChange,
  showWorkMode,
  onDraggingChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const lastAngleRef = useRef(0);

  const getAngle = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return 0;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  };

  const handleStart = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    lastAngleRef.current = getAngle(clientX, clientY);
    onDraggingChange(true);
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    let a = getAngle(clientX, clientY);
    let da = a - lastAngleRef.current;
    if (da > Math.PI) da -= Math.PI * 2;
    if (da < -Math.PI) da += Math.PI * 2;
    onOffsetChange(da * (720 / (Math.PI * 2)));
    lastAngleRef.current = a;
  }, [onOffsetChange]);

  const handleEnd = () => {
    isDraggingRef.current = false;
    onDraggingChange(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      const now = new Date();
      const travelTime = new Date(now.getTime() + manualOffset * 60000);
      const focusFriend = friends.find(f => f.id === selectedId) || friends[0];
      const fLoc = getZonedTime(travelTime, focusFriend?.timezone || 'UTC');
      const pulse = (Math.sin(Date.now() / 500) + 1) / 2;

      ctx.clearRect(0, 0, 500, 500);
      ctx.save();
      ctx.translate(250, 250);

      // Draw dial numbers
      ctx.font = "24px Futura, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (let i = 1; i <= 12; i++) {
        const ang = i * Math.PI / 6 - Math.PI / 2;
        ctx.fillText(i.toString(), Math.cos(ang) * 220, Math.sin(ang) * 220);
      }

      // Draw hands for each friend
      friends.forEach(f => {
        const pLoc = getZonedTime(travelTime, f.timezone);
        const isSelected = f.id === selectedId;
        const ang = ((pLoc.hour % 12) + pLoc.minute / 60) * Math.PI / 6 - Math.PI / 2;
        const dayDiff = Math.round(pLoc.absDay - fLoc.absDay);
        const isWork = pLoc.hour >= 9 && pLoc.hour < 17;
        
        let color = isSelected ? "#F54927" : (pLoc.hour < 12 ? "white" : "rgba(255,255,255,0.4)");
        
        ctx.save();
        ctx.rotate(ang);

        // Highlight work hours with a glow
        if (showWorkMode && isWork) {
          ctx.shadowBlur = 5 + (pulse * 25);
          ctx.shadowColor = color;
        }

        ctx.strokeStyle = color;
        ctx.lineWidth = isSelected ? 5 : 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(165, 0);
        ctx.stroke();

        // Label
        ctx.rotate(-ang);
        ctx.shadowBlur = 0;
        ctx.fillStyle = isSelected ? "white" : color;
        ctx.font = isSelected ? "bold 16px sans-serif" : "14px sans-serif";
        const label = `${(showWorkMode && isWork) ? "💼 " : ""}${f.name}`;
        const suffix = dayDiff !== 0 ? ` ${dayDiff > 0 ? '+' : ''}${dayDiff}D` : '';
        ctx.fillText(label + suffix, Math.cos(ang) * 200, Math.sin(ang) * 200);
        
        ctx.restore();
      });

      ctx.restore();
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [friends, selectedId, manualOffset, showWorkMode]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={500}
      className="max-w-[90vw] max-h-[45vh] cursor-grab active:cursor-grabbing"
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={handleEnd}
    />
  );
};

export default AnalogClock;
