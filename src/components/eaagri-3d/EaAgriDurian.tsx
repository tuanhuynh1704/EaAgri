'use client';
import { useEffect, useRef } from 'react';
import { createEaAgriScene } from './viewer.mjs';
import type { EaAgriData, EaAgriViewer, Selection } from './viewer.d.mts';
import './viewer.css';

export interface EaAgriDurianProps {
  assetBaseUrl?: string;
  posterUrl?: string;
  data?: EaAgriData;
  onSelect?: (e: Selection) => void;
  quality?: 'auto' | 'high' | 'mobile';
  showCards?: boolean;
  showHotspots?: boolean;
  showFarmer?: boolean;
  autoRotate?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function EaAgriDurian({
  assetBaseUrl = '/eaagri-3d/assets/',
  posterUrl = '/eaagri-3d/assets/poster.png',
  data = {
    source: 'demo',
    treeName: 'Sầu riêng Ri6 EaAgri',
    growthStage: 'Giai đoạn nuôi trái (90 ngày)',
    moistureTop: 68,
    moistureDeep: 72,
    temperature: 28,
    rainMm: 12,
    pumpOn: true,
    diseaseNote: 'Lá xanh dày, phát triển tối ưu',
  },
  onSelect,
  quality = 'auto',
  showCards = false,
  showHotspots = true,
  showFarmer = true,
  autoRotate = false,
  className = '',
  style,
}: EaAgriDurianProps) {
  const host = useRef<HTMLDivElement>(null);
  const viewer = useRef<EaAgriViewer | null>(null);
  const callback = useRef(onSelect);
  const currentData = useRef(data);
  callback.current = onSelect;
  currentData.current = data;

  useEffect(() => {
    if (!host.current) return;
    const scene = createEaAgriScene(host.current, {
      assetBaseUrl,
      posterUrl,
      quality,
      showCards,
      showHotspots,
      showFarmer,
      autoRotate,
      data: currentData.current,
      onSelect: (event) => callback.current?.(event),
    });
    viewer.current = scene;

    return () => {
      scene.destroy();
      if (viewer.current === scene) viewer.current = null;
    };
  }, [assetBaseUrl, posterUrl, quality, showCards, showHotspots, showFarmer, autoRotate]);

  useEffect(() => {
    viewer.current?.setData(data);
  }, [data]);

  return (
    <div
      ref={host}
      className={`eaagri-durian-3d-container ${className}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '380px',
        position: 'relative',
        ...style,
      }}
    />
  );
}
