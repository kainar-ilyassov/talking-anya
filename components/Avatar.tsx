import React, { useEffect, useState } from 'react';

interface AvatarProps {
  modelVolume: number; // 0-1
  isListening: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ modelVolume, isListening }) => {
  const [blink, setBlink] = useState(false);

  // Random Blink Logic
  useEffect(() => {
    const triggerBlink = () => {
        setBlink(true);
        setTimeout(() => setBlink(false), 200);
        // Schedule next blink randomly between 2s and 6s
        timeoutId = setTimeout(triggerBlink, 2000 + Math.random() * 4000);
    };

    let timeoutId = setTimeout(triggerBlink, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  // Smooth Mouth Animation Calculation
  // We amplify the volume but clamp it to avoid looking unhinged
  const jawOpen = Math.min(1, Math.max(0, modelVolume * 2.5)); 
  
  // Mouth shape interpolation
  // Resting mouth: A gentle curve
  // Open mouth: An oval shape
  const mouthWidth = 40;
  const mouthCenterY = 285;
  const mouthCenterX = 200;
  
  // Calculate control points for the mouth path
  // Top lip arch (goes up slightly when opening)
  const topLipY = mouthCenterY - (jawOpen * 10);
  // Bottom lip arch (goes down significantly when opening)
  const bottomLipY = mouthCenterY + (jawOpen * 35);
  
  // Path construction
  // M startX startY Q controlX controlY endX endY
  const mouthPath = jawOpen < 0.05 
    ? `M ${mouthCenterX - 15},${mouthCenterY} Q ${mouthCenterX},${mouthCenterY + 5} ${mouthCenterX + 15},${mouthCenterY}` // Closed smile
    : `M ${mouthCenterX - mouthWidth/2},${mouthCenterY} 
       Q ${mouthCenterX},${topLipY} ${mouthCenterX + mouthWidth/2},${mouthCenterY} 
       Q ${mouthCenterX},${bottomLipY} ${mouthCenterX - mouthWidth/2},${mouthCenterY}`;

  return (
    <div className="relative w-full h-full flex items-center justify-center transition-all duration-500">
      {/* Dynamic Glow Background */}
      <div 
        className={`absolute inset-0 bg-blue-500/20 rounded-full blur-[100px] transition-all duration-500 ease-out`} 
        style={{ 
            opacity: isListening ? 0.6 : 0.2,
            transform: isListening ? 'scale(1.1)' : 'scale(1)'
        }} 
      />
      
      <svg 
        viewBox="0 0 400 400" 
        className="w-full h-full drop-shadow-2xl animate-float"
        style={{ maxHeight: '600px', maxWidth: '600px' }} // Ensure it doesn't get too massive on huge screens
      >
        <defs>
            {/* Skin Gradient */}
            <linearGradient id="skinGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFF0E6" />
                <stop offset="100%" stopColor="#E6C8B8" />
            </linearGradient>
            
            {/* Hair Gradient */}
            <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5E3C" /> {/* Chestnut Brown */}
                <stop offset="100%" stopColor="#5D3A22" />
            </linearGradient>

            {/* Hair Highlight */}
            <linearGradient id="hairHighlight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A67B5B" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#8B5E3C" stopOpacity="0"/>
            </linearGradient>

            {/* Eye Gradient */}
            <linearGradient id="eyeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ADE80" /> {/* Emerald Green */}
                <stop offset="100%" stopColor="#15803D" />
            </linearGradient>

             {/* Shirt Gradient */}
             <linearGradient id="shirtGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
        </defs>

        {/* --- Back Layer --- */}

        {/* Back Hair */}
        <path d="M100,150 Q50,250 60,380 L340,380 Q350,250 300,150" fill="url(#hairGrad)" />

        {/* Neck */}
        <rect x="170" y="280" width="60" height="80" fill="#E6C8B8" />
        <path d="M170,320 Q200,360 230,320" fill="#D4B09E" opacity="0.3" /> {/* Neck shadow */}

        {/* Shoulders / Shirt */}
        <path d="M100,400 L300,400 L300,360 Q260,340 200,360 Q140,340 100,360 Z" fill="url(#shirtGrad)" />
        <path d="M170,360 Q200,380 230,360 L230,345 Q200,365 170,345 Z" fill="#E0F2FE" /> {/* Collar/Undershirt */}

        {/* --- Head Layer --- */}

        {/* Face Shape */}
        <path 
            d="M120,150 
               C120,80 160,50 200,50 
               C240,50 280,80 280,150 
               L280,220 
               Q280,290 200,310 
               Q120,290 120,220 
               Z" 
            fill="url(#skinGrad)" 
        />

        {/* Blush */}
        <ellipse cx="150" cy="240" rx="15" ry="8" fill="#FF8888" opacity="0.2" />
        <ellipse cx="250" cy="240" rx="15" ry="8" fill="#FF8888" opacity="0.2" />

        {/* --- Facial Features --- */}

        {/* Eyes Container - Scaled on Y for blink */}
        <g transform={`translate(0, ${blink ? 20 : 0}) scale(1, ${blink ? 0.1 : 1})`} style={{ transformOrigin: '200px 200px', transition: 'transform 0.1s ease-in-out' }}>
            
            {/* Left Eye */}
            <g transform="translate(145, 200)">
                <ellipse cx="0" cy="0" rx="22" ry="16" fill="white" /> {/* Sclera */}
                <circle cx="0" cy="0" r="11" fill="url(#eyeGrad)" /> {/* Iris */}
                <circle cx="0" cy="0" r="5" fill="#0f172a" /> {/* Pupil */}
                <circle cx="5" cy="-4" r="3" fill="white" opacity="0.8" /> {/* Highlight */}
                {/* Eyelashes */}
                <path d="M-22,-2 Q-10,-18 22,-2" fill="none" stroke="#3D2518" strokeWidth="4" strokeLinecap="round" />
            </g>

            {/* Right Eye */}
            <g transform="translate(255, 200)">
                <ellipse cx="0" cy="0" rx="22" ry="16" fill="white" />
                <circle cx="0" cy="0" r="11" fill="url(#eyeGrad)" />
                <circle cx="0" cy="0" r="5" fill="#0f172a" />
                <circle cx="5" cy="-4" r="3" fill="white" opacity="0.8" />
                <path d="M-22,-2 Q-10,-18 22,-2" fill="none" stroke="#3D2518" strokeWidth="4" strokeLinecap="round" />
            </g>
        </g>

        {/* Eyebrows (Static but expressive) */}
        <path d="M125,175 Q145,165 165,175" fill="none" stroke="#5D3A22" strokeWidth="3" strokeLinecap="round" opacity={blink ? 0.8 : 1} transform={`translate(0, ${blink ? 5 : 0})`} />
        <path d="M235,175 Q255,165 275,175" fill="none" stroke="#5D3A22" strokeWidth="3" strokeLinecap="round" opacity={blink ? 0.8 : 1} transform={`translate(0, ${blink ? 5 : 0})`} />

        {/* Nose */}
        <path d="M200,230 Q205,245 195,250" fill="none" stroke="#D4B09E" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>

        {/* Mouth - Dynamic */}
        <path 
            d={mouthPath} 
            fill={jawOpen > 0.1 ? "#9F4545" : "transparent"} 
            stroke="#C06060" 
            strokeWidth={jawOpen > 0.1 ? "0" : "3"} 
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-75"
        />
        {/* Teeth hint when mouth is wide open */}
        {jawOpen > 0.3 && (
            <path 
                d={`M ${mouthCenterX - 10},${mouthCenterY + 5} Q ${mouthCenterX},${mouthCenterY + 8} ${mouthCenterX + 10},${mouthCenterY + 5}`}
                fill="white"
                opacity="0.8"
            />
        )}


        {/* --- Front Hair --- */}
        
        {/* Bangs Main Body */}
        <path 
            d="M120,150 
               C100,100 120,40 200,40 
               C280,40 300,100 280,150 
               C280,100 240,60 200,60
               C160,60 120,100 120,150" 
            fill="url(#hairGrad)" 
        />
        
        {/* Bang Strands */}
        <path d="M200,60 Q180,120 140,160 L160,100 Z" fill="url(#hairGrad)" />
        <path d="M200,60 Q220,120 260,160 L240,100 Z" fill="url(#hairGrad)" />
        <path d="M200,60 Q200,100 200,140" stroke="#5D3A22" strokeWidth="1" fill="none" opacity="0.3" />

        {/* Hair Highlight Sheen */}
        <path d="M140,80 Q200,60 260,80" fill="none" stroke="url(#hairHighlight)" strokeWidth="8" strokeLinecap="round" opacity="0.5" />

      </svg>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
