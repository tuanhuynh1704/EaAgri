'use client';
import {useEffect,useRef} from 'react';
import {createEaAgriScene} from '../src/viewer.mjs';
import type {EaAgriData,EaAgriViewer,Selection} from '../src/viewer.mjs';
import '../src/viewer.css';

export default function EaAgriDurian({
  assetBaseUrl='/eaagri-3d/assets/',data={source:'none'},onSelect,quality='auto',
}: {
  assetBaseUrl?:string; data?:EaAgriData; onSelect?:(e:Selection)=>void;
  quality?:'auto'|'high'|'mobile';
}){
  const host=useRef<HTMLDivElement>(null),viewer=useRef<EaAgriViewer|null>(null);
  const callback=useRef(onSelect),currentData=useRef(data);
  callback.current=onSelect;currentData.current=data;
  useEffect(()=>{
    if(!host.current)return;
    const scene=createEaAgriScene(host.current,{
      assetBaseUrl,posterUrl:assetBaseUrl+'poster.png',quality,
      data:currentData.current,onSelect:event=>callback.current?.(event),
    });
    viewer.current=scene;
    return()=>{scene.destroy();if(viewer.current===scene)viewer.current=null;};
  },[assetBaseUrl,quality]);
  useEffect(()=>{viewer.current?.setData(data);},[data]);
  return <div ref={host} style={{width:'100%',height:'clamp(400px,44vw,680px)'}} />;
}
