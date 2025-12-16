import React from 'react';
import { UnitConfig, UnitType, Texture } from '../types';
import { TEXTURES } from '../constants';

interface UnitRendererProps {
  unit: UnitConfig;
  calculatedWidth: number;
  height: number;
  isSelected: boolean;
  onSelect: () => void;
}

const getTexture = (id: string): Texture => {
  return TEXTURES.find(t => t.id === id) || TEXTURES[0];
};

export const UnitRenderer: React.FC<UnitRendererProps> = ({
  unit,
  calculatedWidth,
  height,
  isSelected,
  onSelect,
}) => {
  const texture = getTexture(unit.textureId);
  const topCabinetHeight = unit.hasTopCabinet ? (unit.topCabinetHeight || 500) : 0;
  // bottomHeight is handled by flex-1
  
  const boardThickness = 6; // Visual thickness in pixels (simulating 18mm scaled down)

  // -- Visual Styles --
  const materialStyle = {
    background: texture.cssValue,
  };
  
  // The "Cut Edge" style (e.g., the front facing edge of a board)
  const edgeStyle = {
    backgroundColor: texture.boardColor,
    borderColor: 'rgba(0,0,0,0.05)'
  };

  // The "Inside" style (darker to simulate depth)
  const innerStyle = {
    backgroundColor: texture.innerColor,
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)' // Deep shadow inside
  };

  // -- Helper Renders --

  const renderShelves = (count: number = 0) => {
    if (count <= 0) return null;
    // Distribute shelves evenly
    const shelves = [];
    for (let i = 1; i <= count; i++) {
        shelves.push(
            <div 
                key={i} 
                className="absolute w-full flex flex-col"
                style={{ 
                    top: `${(i / (count + 1)) * 100}%`, 
                    height: `${boardThickness}px`,
                    zIndex: 5
                }}
            >
                {/* Shelf Front Edge */}
                <div className="w-full h-full border-y border-black/5" style={edgeStyle}></div>
                {/* Shelf Shadow underneath */}
                <div className="w-full h-2 bg-gradient-to-b from-black/20 to-transparent absolute top-full"></div>
            </div>
        );
    }
    return <>{shelves}</>;
  };

  const renderCabinetBox = (h: string | number, shelfCount: number, hasDoor: boolean) => {
    return (
        <div className="w-full h-full relative flex flex-col" style={{ height: h }}>
            {/* 1. Main Carcass (The Box) */}
            <div className="absolute inset-0 flex flex-row z-0">
                {/* Left Panel Edge */}
                <div className="h-full border-r border-black/10" style={{ width: `${boardThickness}px`, ...edgeStyle }}></div>
                
                {/* Internal Space (Back Panel) */}
                <div className="flex-1 h-full relative overflow-hidden" style={innerStyle}>
                     {/* Shelves */}
                     {!hasDoor && renderShelves(shelfCount)}
                </div>

                {/* Right Panel Edge */}
                <div className="h-full border-l border-black/10" style={{ width: `${boardThickness}px`, ...edgeStyle }}></div>
            </div>

            {/* Top Board Edge */}
            <div className="absolute top-0 inset-x-0 border-b border-black/10 z-10" style={{ height: `${boardThickness}px`, ...edgeStyle }}></div>
            {/* Bottom Board Edge */}
            <div className="absolute bottom-0 inset-x-0 border-t border-black/10 z-10" style={{ height: `${boardThickness}px`, ...edgeStyle }}></div>

            {/* 2. Door (Overlay) */}
            {hasDoor && (
                <div 
                    className="absolute inset-0 z-20 transition-opacity duration-500 flex"
                    style={{ ...materialStyle, top: boardThickness/2, bottom: boardThickness/2, left: boardThickness/2, right: boardThickness/2 }}
                >
                    {/* Door Detail */}
                    <div className="w-full h-full border border-black/5 relative shadow-md">
                         <div className="absolute top-1/2 right-3 w-1 h-12 bg-gray-400 rounded-sm shadow-sm"></div>
                    </div>
                </div>
            )}
        </div>
    );
  };

  // -- Main Logic Switch --

  const renderContent = () => {
    switch (unit.type) {
      case UnitType.TV_SPACE:
        return (
          <div className="w-full h-full flex flex-col items-center justify-end relative">
             <div className="absolute inset-0 z-0" style={{ backgroundColor: '#f0f0f0', border: '1px solid #ddd' }}></div>
             <div className="mb-[25%] w-[80%] aspect-video bg-black rounded-lg shadow-2xl flex items-center justify-center border-4 border-gray-800 relative z-10">
                <span className="text-gray-600 font-bold opacity-30">TV</span>
             </div>
             {/* Lowboard */}
             <div className="w-full h-[25%] relative z-10" style={materialStyle}>
                 <div className="absolute top-0 w-full h-1 bg-black/10"></div>
                 <div className="w-full h-full flex items-center justify-center border-t border-white/20">
                    <div className="w-16 h-1 bg-black/10 rounded-full"></div>
                 </div>
             </div>
          </div>
        );

      case UnitType.CORNER:
         return renderCabinetBox('100%', unit.shelfCount || 0, !!unit.hasDoor); // Reuse logic for now

      case UnitType.DRAWERS:
        return (
           <div className="w-full h-full flex flex-col relative">
                {/* Frame */}
                <div className="absolute inset-0 border-x border-black/10" style={{ borderWidth: `${boardThickness}px`, borderColor: texture.boardColor }}></div>
                <div className="flex-1 flex flex-col mx-1 my-1">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="flex-1 mb-0.5 border border-black/5 relative shadow-sm" style={materialStyle}>
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-gray-400/50 rounded"></div>
                        </div>
                    ))}
                </div>
           </div>
        );
        
      case UnitType.OPEN_SHELF:
         return renderCabinetBox('100%', unit.shelfCount || 4, false);

      case UnitType.CABINET_DOOR:
      default:
        // Use the new Box Renderer
        return renderCabinetBox('100%', unit.shelfCount || 3, !!unit.hasDoor);
    }
  };

  const columnStyle = {
    width: calculatedWidth,
    height: '100%'
  };

  return (
    <div 
      onClick={onSelect}
      className={`relative box-border transition-all duration-200 flex flex-col group ${isSelected ? 'z-20' : 'hover:z-10'}`}
      style={{
         ...columnStyle,
         // Selection Highlight (Outside the box)
         boxShadow: isSelected ? '0 0 0 2px #3b82f6' : 'none'
      }}
    >
        {/* Top Cabinet Section */}
        {unit.hasTopCabinet && (
            <div className="w-full relative" style={{ height: `${(topCabinetHeight / height) * 100}%` }}>
                 {renderCabinetBox('100%', 0, true)}
            </div>
        )}

        {/* Main Section */}
        <div className="w-full relative flex-1">
            {renderContent()}
        </div>

        {/* Dimensions Label (Only when hovered or selected) */}
        <div className={`absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 ${isSelected ? 'opacity-100' : ''} pointer-events-none transition-opacity whitespace-nowrap z-50`}>
           {unit.name} <span className="text-gray-400">|</span> {Math.round(calculatedWidth)}mm
        </div>
    </div>
  );
};