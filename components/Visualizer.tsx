import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isActive: boolean;
  volume: number; // 0 to 1
}

export const Visualizer: React.FC<VisualizerProps> = ({ isActive, volume }) => {
  const barsRef = useRef<HTMLDivElement[]>([]);
  
  // Create 5 bars
  const bars = Array.from({ length: 5 });

  return (
    <div className={`flex items-center justify-center gap-2 h-24 transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-30'}`}>
      {bars.map((_, i) => (
        <div
            key={i}
            className="w-3 bg-gradient-to-t from-blue-500 to-cyan-300 rounded-full transition-all duration-75 ease-out"
            style={{
                height: isActive 
                    ? `${Math.max(15, Math.min(100, volume * 400 * (Math.random() * 0.5 + 0.5)))}%` 
                    : '15%',
            }}
        />
      ))}
    </div>
  );
};