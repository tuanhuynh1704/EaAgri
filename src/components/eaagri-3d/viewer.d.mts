export type HotspotId='overview'|'soil'|'weather'|'disease'|'irrigation'|'assistant';
export interface EaAgriData {
  source?:'none'|'demo'|'live';
  treeName?:string; growthStage?:string; moistureTop?:number; moistureDeep?:number;
  temperature?:number; rainMm?:number; pumpOn?:boolean; diseaseNote?:string;
}
export interface Selection {id:HotspotId;label:string;data:EaAgriData}
export interface Options {
  assetBaseUrl?:string; modelUrl?:string; posterUrl?:string|null; quality?:'auto'|'high'|'mobile';
  showCards?:boolean; showHotspots?:boolean; showFarmer?:boolean; autoRotate?:boolean;
  lazy?:boolean; maxDpr?:number; data?:EaAgriData;
  onSelect?:(event:Selection)=>void; onReady?:(event:{quality:string})=>void; onError?:(error:unknown)=>void;
}
export interface EaAgriViewer {
  ready:Promise<{ok:boolean;quality?:string;error?:unknown;reason?:string}>;
  setData(data:Partial<EaAgriData>):void; select(id:HotspotId):boolean; reset():void;
  setPaused(value:boolean):void; setCardsVisible(value:boolean):void;
  getStats():{loaded:boolean;quality:string;drawCalls:number;triangles:number;paused:boolean;reducedMotion:boolean};
  capture(options?:{width?:number;height?:number}):Promise<Blob>;
  destroy():void;
}
export const HOTSPOT_IDS:readonly HotspotId[];
export function createEaAgriScene(container:HTMLElement,options?:Options):EaAgriViewer;
