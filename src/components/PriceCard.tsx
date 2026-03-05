import { useEffect, useRef } from "react";
import type { PriceData } from "../types";

interface Props {
  label: string;
  data: PriceData | null;
}

export function PriceCard({ label, data }: Props) {
  const priceRef = useRef<HTMLDivElement>(null);
  const prevPrice = useRef<number | null>(null);

  useEffect(() => {
    if (!data || !priceRef.current) return;
    if (prevPrice.current !== null && prevPrice.current !== data.price) {
      priceRef.current.classList.remove("flash");
      // force reflow to restart animation
      void priceRef.current.offsetWidth;
      priceRef.current.classList.add("flash");
    }
    prevPrice.current = data.price;
  }, [data?.price]);

  if (!data) {
    return (
      <div className="price-card">
        <h2>{label}</h2>
        <div className="loading">等待数据...</div>
      </div>
    );
  }

  const isUp = data.change >= 0;
  const colorClass = isUp ? "up" : "down";
  const sign = isUp ? "+" : "";
  const decimals = data.code === "XAU" ? 2 : 3;

  return (
    <div className={`price-card ${colorClass}`}>
      <h2>{label}</h2>
      <div className="main-price" ref={priceRef}>
        {data.price.toFixed(decimals)}
      </div>
      <div className={`change ${colorClass}`}>
        {sign}{data.change.toFixed(decimals)} ({sign}{data.changePercent.toFixed(2)}%)
      </div>
      <div className="details">
        <div className="detail-row">
          <span>今开</span><span>{data.open.toFixed(decimals)}</span>
        </div>
        <div className="detail-row">
          <span>昨收</span><span>{data.prevClose.toFixed(decimals)}</span>
        </div>
        <div className="detail-row">
          <span>最高</span><span>{data.high.toFixed(decimals)}</span>
        </div>
        <div className="detail-row">
          <span>最低</span><span>{data.low.toFixed(decimals)}</span>
        </div>
      </div>
    </div>
  );
}
