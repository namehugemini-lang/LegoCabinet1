import { Texture, UnitConfig, UnitType, Scenario } from './types';

export const TEXTURES: Texture[] = [
  {
    id: 'walnut_dark',
    name: '黑胡桃木 (IKEA风)',
    // CSS for the surface texture
    cssValue: `
      background-color: #5d4b3e;
      background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E"),
                        linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(0,0,0,0.1));
    `,
    boardColor: '#4a3b32', // Edge color
    innerColor: '#3e3129'  // Darker back panel color
  },
  {
    id: 'oak_light',
    name: '原木橡木',
    cssValue: `
      background-color: #dccbb1;
      background-image: linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.05) 100%);
    `,
    boardColor: '#c4b092',
    innerColor: '#bca686'
  },
  {
    id: 'white_matte',
    name: '极简暖白',
    cssValue: `background-color: #f3f4f6;`,
    boardColor: '#e5e7eb',
    innerColor: '#d1d5db'
  }
];

export const SCENARIOS: Scenario[] = [
  {
    id: 's_ikea_pax',
    name: 'IKEA PAX 风格 (双列)',
    config: {
      layoutMode: 'linear',
      totalWidth: 1500, // 750 + 750 roughly
      height: 2360,
      depth: 580,
      units: [
        { 
          id: 'pax_1', 
          name: '左侧柜体', 
          type: UnitType.CABINET_DOOR, 
          width: 750, 
          isElastic: true, 
          textureId: 'walnut_dark', 
          hasTopCabinet: false,
          shelfCount: 5, // 5 shelves internally
          hasDoor: false // Open state like the screenshot
        },
        { 
          id: 'pax_2', 
          name: '右侧柜体', 
          type: UnitType.CABINET_DOOR, 
          width: 750, 
          isElastic: true, 
          textureId: 'walnut_dark', 
          hasTopCabinet: false,
          shelfCount: 5,
          hasDoor: false
        }
      ]
    }
  },
  {
    id: 's_standard',
    name: '标准电视柜 (3米)',
    config: {
      layoutMode: 'linear',
      totalWidth: 3000,
      height: 2400,
      depth: 450,
      units: [
        { id: 'u_1', name: '左高柜', type: UnitType.CABINET_DOOR, width: 450, isElastic: true, textureId: 'oak_light', shelfCount: 4, hasDoor: true },
        { id: 'u_2', name: '电视区', type: UnitType.TV_SPACE, width: 1600, isElastic: false, textureId: 'white_matte', hasTopCabinet: true, topCabinetHeight: 450 },
        { id: 'u_3', name: '右高柜', type: UnitType.CABINET_DOOR, width: 450, isElastic: true, textureId: 'oak_light', shelfCount: 4, hasDoor: true }
      ]
    }
  }
];

export const INITIAL_UNITS = SCENARIOS[0].config.units;