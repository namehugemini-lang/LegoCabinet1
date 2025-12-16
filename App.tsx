import React, { useState, useMemo } from 'react';
import { UnitConfig, UnitType, SolutionConfig } from './types';
import { INITIAL_UNITS, TEXTURES, SCENARIOS } from './constants';
import { calculateUnitWidths } from './utils/layout';
import { UnitRenderer } from './components/UnitRenderer';
import { 
  PlusIcon, 
  TrashIcon, 
  CubeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  EyeIcon,
  EyeSlashIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

export default function App() {
  // --- State ---
  const [config, setConfig] = useState<SolutionConfig>(SCENARIOS[0].config);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(
    SCENARIOS[0].config.units.length > 0 ? SCENARIOS[0].config.units[0].id : null
  ); 
  const [activeScenarioId, setActiveScenarioId] = useState<string>(SCENARIOS[0].id);

  // --- Computed ---
  const unitWidths = useMemo(() => {
    return calculateUnitWidths(config.totalWidth, config.units);
  }, [config.totalWidth, config.units]);

  const selectedUnit = config.units.find(u => u.id === selectedUnitId);

  // For L-Shape: Split units into Left Wall, Corner, Right Wall
  const lShapeSplit = useMemo(() => {
    if (config.layoutMode !== 'L_shape') return null;
    
    const cornerIndex = config.units.findIndex(u => u.type === UnitType.CORNER);
    if (cornerIndex === -1) return { left: config.units, corner: null, right: [] };

    return {
      left: config.units.slice(0, cornerIndex),
      corner: config.units[cornerIndex],
      right: config.units.slice(cornerIndex + 1)
    };
  }, [config.units, config.layoutMode]);

  // --- Actions ---

  const applyScenario = (scenarioId: string) => {
    const s = SCENARIOS.find(x => x.id === scenarioId);
    if (s) {
      setConfig(s.config);
      setActiveScenarioId(scenarioId);
      if (s.config.units.length > 0) {
        setSelectedUnitId(s.config.units[0].id);
      }
    }
  };

  const updateGlobal = (key: keyof SolutionConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateUnit = (id: string, updates: Partial<UnitConfig>) => {
    setConfig(prev => ({
      ...prev,
      units: prev.units.map(u => u.id === id ? { ...u, ...updates } : u)
    }));
  };

  const addUnit = () => {
    const newId = `u_${Date.now()}`;
    const newUnit: UnitConfig = {
      id: newId,
      name: `新单元柜`,
      type: UnitType.CABINET_DOOR,
      width: 450,
      isElastic: true,
      textureId: 'walnut_dark',
      shelfCount: 3,
      hasDoor: false
    };
    setConfig(prev => ({ ...prev, units: [...prev.units, newUnit] }));
    setSelectedUnitId(newId);
  };

  const removeUnit = (id: string) => {
    setConfig(prev => {
      const newUnits = prev.units.filter(u => u.id !== id);
      return { ...prev, units: newUnits };
    });
    setSelectedUnitId(null);
  };

  const moveUnit = (id: string, direction: 'left' | 'right') => {
    const idx = config.units.findIndex(u => u.id === id);
    if (idx === -1) return;
    
    const newUnits = [...config.units];
    if (direction === 'left' && idx > 0) {
      [newUnits[idx - 1], newUnits[idx]] = [newUnits[idx], newUnits[idx - 1]];
    } else if (direction === 'right' && idx < newUnits.length - 1) {
      [newUnits[idx + 1], newUnits[idx]] = [newUnits[idx], newUnits[idx + 1]];
    }
    setConfig(prev => ({ ...prev, units: newUnits }));
  };

  const getTypeName = (type: UnitType) => {
    switch(type) {
      case UnitType.CABINET_DOOR: return '标准储物柜';
      case UnitType.TV_SPACE: return '电视区域';
      case UnitType.DRAWERS: return '抽屉柜';
      case UnitType.OPEN_SHELF: return '开放展示架';
      case UnitType.CORNER: return '转角柜';
      default: return type;
    }
  };

  // --- Render ---
  const previewScale = 0.22; 

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-gray-50">
      
      {/* LEFT: Preview Area */}
      <div className="flex-1 relative flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 p-6 z-20 w-full flex justify-between items-start pointer-events-none">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 pointer-events-auto">
            <CubeIcon className="w-8 h-8 text-brand-600"/>
            积木柜 <span className="text-gray-400 font-normal text-sm">Design Pro</span>
          </h1>
          
          <div className="pointer-events-auto bg-white/90 backdrop-blur shadow-sm rounded-lg p-2 border border-gray-200">
             <div className="flex gap-2">
               {SCENARIOS.map(s => (
                 <button
                   key={s.id}
                   onClick={() => applyScenario(s.id)}
                   className={`px-3 py-1.5 text-xs rounded-md transition-all ${activeScenarioId === s.id ? 'bg-gray-800 text-white shadow' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                 >
                   {s.name}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Canvas Background */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-10 pt-24 pb-20 bg-gray-100" onClick={() => setSelectedUnitId(null)}>
          
          {/* Main Rendering Stage */}
          <div 
             className="relative transition-all duration-300"
             style={{ 
               width: config.layoutMode === 'L_shape' ? 'auto' : `${config.totalWidth * previewScale}px`,
               height: `${config.height * previewScale}px` 
             }}
             onClick={(e) => e.stopPropagation()}
          >
             {/* Floor Visual */}
             <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[120%] h-24 bg-gradient-to-t from-gray-300 to-transparent z-0 opacity-50 blur-sm rounded-[100%]"></div>
             
             {config.layoutMode === 'L_shape' && lShapeSplit ? (
                /* L-Shape Render (Simplified for this update to focus on depth) */
                <div className="flex items-end justify-center perspective-container" style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}>
                    <div style={{ transform: 'rotateY(-15deg)', transformOrigin: 'right bottom' }} className="flex items-end bg-white shadow-2xl">
                       {lShapeSplit.left.map(u => <UnitRenderer key={u.id} unit={u} calculatedWidth={unitWidths[u.id] * previewScale} height={config.height} isSelected={selectedUnitId === u.id} onSelect={() => setSelectedUnitId(u.id)} />)}
                    </div>
                    {lShapeSplit.corner && (
                      <div style={{ transform: 'translateZ(20px)' }} className="bg-white shadow-2xl relative z-10">
                        <UnitRenderer unit={lShapeSplit.corner} calculatedWidth={unitWidths[lShapeSplit.corner.id] * previewScale} height={config.height} isSelected={selectedUnitId === lShapeSplit.corner.id} onSelect={() => setSelectedUnitId(lShapeSplit.corner.id)} />
                      </div>
                    )}
                    <div style={{ transform: 'rotateY(15deg)', transformOrigin: 'left bottom' }} className="flex items-end bg-white shadow-2xl">
                       {lShapeSplit.right.map(u => <UnitRenderer key={u.id} unit={u} calculatedWidth={unitWidths[u.id] * previewScale} height={config.height} isSelected={selectedUnitId === u.id} onSelect={() => setSelectedUnitId(u.id)} />)}
                    </div>
                </div>
             ) : (
                /* Standard Linear Render */
                <div className="w-full h-full flex items-end shadow-2xl bg-white relative z-10">
                    {config.units.map(unit => (
                      <UnitRenderer 
                        key={unit.id}
                        unit={unit}
                        calculatedWidth={unitWidths[unit.id] * previewScale} 
                        height={config.height}
                        isSelected={selectedUnitId === unit.id}
                        onSelect={() => setSelectedUnitId(unit.id)}
                      />
                    ))}
                </div>
             )}

             {/* Dimensions Overlay */}
             <div className="absolute -top-12 inset-x-0 flex justify-center">
                <div className="bg-white px-3 py-1 rounded-full shadow text-xs font-bold text-gray-600 border border-gray-100">
                   总宽 {config.totalWidth} mm
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Configuration Panel */}
      <div className="w-80 bg-white border-l border-gray-200 shadow-xl flex flex-col z-30">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">配置详情</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Global Dimensions */}
          <section className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <label className="text-xs font-bold text-gray-400 block mb-2">整体尺寸</label>
             <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">宽度</span>
                <input 
                  type="number" 
                  value={config.totalWidth}
                  onChange={(e) => updateGlobal('totalWidth', parseInt(e.target.value))}
                  className="w-20 border rounded px-2 py-1 text-sm text-right"
                />
             </div>
             <input 
               type="range" min="1000" max="5000" step="50"
               value={config.totalWidth}
               onChange={(e) => updateGlobal('totalWidth', parseInt(e.target.value))}
               className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-800"
             />
          </section>

          {/* Unit Specific Config */}
          <section>
             <div className="flex justify-between items-center mb-3">
               <h3 className="text-xs font-bold text-gray-400">
                 {selectedUnit ? '当前选中模块' : '请选择模块进行编辑'}
               </h3>
               {selectedUnit && (
                 <div className="flex gap-1">
                    <button onClick={() => moveUnit(selectedUnit.id, 'left')} className="p-1 rounded hover:bg-gray-100"><ChevronLeftIcon className="w-4 h-4 text-gray-500"/></button>
                    <button onClick={() => moveUnit(selectedUnit.id, 'right')} className="p-1 rounded hover:bg-gray-100"><ChevronRightIcon className="w-4 h-4 text-gray-500"/></button>
                 </div>
               )}
             </div>

             {selectedUnit ? (
               <div className="space-y-4 animate-fadeIn">
                  
                  {/* Internal Structure (New for IKEA feel) */}
                  {(selectedUnit.type === UnitType.CABINET_DOOR || selectedUnit.type === UnitType.OPEN_SHELF) && (
                     <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                        <label className="text-xs font-bold text-gray-700 block mb-2 flex items-center gap-2">
                           <Bars3Icon className="w-3 h-3"/> 内部结构
                        </label>
                        
                        {/* Shelf Count */}
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-xs text-gray-500">层板数量</span>
                           <div className="flex items-center gap-3">
                              <button 
                                onClick={() => updateUnit(selectedUnit.id, { shelfCount: Math.max(0, (selectedUnit.shelfCount || 0) - 1) })}
                                className="w-6 h-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
                              >-</button>
                              <span className="text-sm font-mono w-4 text-center">{selectedUnit.shelfCount || 0}</span>
                              <button 
                                onClick={() => updateUnit(selectedUnit.id, { shelfCount: (selectedUnit.shelfCount || 0) + 1 })}
                                className="w-6 h-6 rounded bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200"
                              >+</button>
                           </div>
                        </div>

                        {/* Door Toggle */}
                        {selectedUnit.type === UnitType.CABINET_DOOR && (
                           <button 
                             onClick={() => updateUnit(selectedUnit.id, { hasDoor: !selectedUnit.hasDoor })}
                             className={`w-full py-2 text-xs rounded border flex items-center justify-center gap-2 transition-colors ${selectedUnit.hasDoor ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-300 border-dashed'}`}
                           >
                              {selectedUnit.hasDoor ? <><EyeSlashIcon className="w-3 h-3"/> 隐藏门板 (查看内部)</> : <><EyeIcon className="w-3 h-3"/> 安装门板</>}
                           </button>
                        )}
                     </div>
                  )}

                  {/* Width & Type */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="text-[10px] text-gray-400">类型</label>
                            <select 
                                value={selectedUnit.type}
                                onChange={(e) => updateUnit(selectedUnit.id, { type: e.target.value as UnitType })}
                                className="w-full text-xs border rounded p-1"
                            >
                                <option value={UnitType.CABINET_DOOR}>储物柜</option>
                                <option value={UnitType.OPEN_SHELF}>开放架</option>
                                <option value={UnitType.DRAWERS}>抽屉柜</option>
                                <option value={UnitType.TV_SPACE}>电视区</option>
                            </select>
                          </div>
                          <div>
                             <label className="text-[10px] text-gray-400">宽度 (mm)</label>
                             <div className="flex items-center">
                                <input 
                                  type="number" 
                                  disabled={selectedUnit.isElastic}
                                  value={selectedUnit.width}
                                  onChange={(e) => updateUnit(selectedUnit.id, { width: parseInt(e.target.value) })}
                                  className={`w-full text-xs border rounded p-1 ${selectedUnit.isElastic ? 'bg-gray-100 text-gray-400' : ''}`}
                                />
                             </div>
                          </div>
                      </div>
                      <label className="flex items-center gap-2 text-xs cursor-pointer">
                         <input 
                           type="checkbox" 
                           checked={selectedUnit.isElastic}
                           onChange={(e) => updateUnit(selectedUnit.id, { isElastic: e.target.checked })}
                         />
                         <span>自动适应剩余宽度 (弹性)</span>
                      </label>
                  </div>

                  {/* Texture Picker */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-2">材质风格</label>
                    <div className="grid grid-cols-3 gap-2">
                       {TEXTURES.map(tex => (
                         <button 
                           key={tex.id}
                           onClick={() => updateUnit(selectedUnit.id, { textureId: tex.id })}
                           className={`h-10 rounded border-2 overflow-hidden relative ${selectedUnit.textureId === tex.id ? 'border-gray-800' : 'border-transparent'}`}
                         >
                            <div className="absolute inset-0" style={{ background: tex.cssValue }}></div>
                            <span className="absolute bottom-0 w-full bg-white/80 text-[8px] truncate px-1">{tex.name}</span>
                         </button>
                       ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => removeUnit(selectedUnit.id)}
                    className="w-full py-2 text-red-500 text-xs border border-red-100 rounded hover:bg-red-50 flex items-center justify-center gap-1"
                  >
                    <TrashIcon className="w-3 h-3"/> 删除模块
                  </button>

               </div>
             ) : (
               <div className="py-10 text-center text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                  点击左侧柜子<br/>配置内部结构
               </div>
             )}
          </section>

          {/* Add Button */}
          <button onClick={addUnit} className="w-full py-3 bg-gray-800 text-white rounded-lg shadow-lg hover:bg-gray-900 flex items-center justify-center gap-2">
            <PlusIcon className="w-5 h-5"/> 添加新柜体
          </button>
          
        </div>
      </div>
    </div>
  );
}