import { useState } from "react";
import type { Position, Direction } from "../types";
import type { PriceData } from "../types";
import { calcProfit } from "../profit";

interface Props {
  positions: Position[];
  onChange: (positions: Position[]) => void;
  xau: PriceData | null;
  xag: PriceData | null;
}

export function PositionForm({ positions, onChange, xau, xag }: Props) {
  const [code, setCode] = useState<"XAU" | "XAG">("XAU");
  const [direction, setDirection] = useState<Direction>("long");
  const [entryPrice, setEntryPrice] = useState("");
  const [lots, setLots] = useState("");

  const handleAdd = () => {
    const price = parseFloat(entryPrice);
    const l = parseFloat(lots);
    if (isNaN(price) || price <= 0 || isNaN(l) || l <= 0) return;
    onChange([...positions, { code, direction, entryPrice: price, lots: l }]);
    setEntryPrice("");
    setLots("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  const handleRemove = (index: number) => {
    onChange(positions.filter((_, i) => i !== index));
  };

  const getPrice = (c: string) => (c === "XAU" ? xau?.price : xag?.price);

  let total = 0;
  for (const p of positions) {
    const cur = getPrice(p.code);
    if (cur != null) total += calcProfit(p, cur);
  }

  return (
    <div className="position-panel">
      <div className="panel-header">
        <h3>持仓管理</h3>
        {positions.length > 0 && (
          <span className={`profit-total ${total >= 0 ? "profit-up" : "profit-down"}`}>
            {total >= 0 ? "+" : ""}{total.toFixed(2)} USD
          </span>
        )}
      </div>
      <div className="form-row">
        <select value={code} onChange={(e) => setCode(e.target.value as "XAU" | "XAG")}>
          <option value="XAU">伦敦金</option>
          <option value="XAG">伦敦银</option>
        </select>
        <select value={direction} onChange={(e) => setDirection(e.target.value as Direction)}>
          <option value="long">做多</option>
          <option value="short">做空</option>
        </select>
        <input
          type="number"
          placeholder="买入价"
          value={entryPrice}
          onChange={(e) => setEntryPrice(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <input
          type="number"
          placeholder="手数"
          value={lots}
          onChange={(e) => setLots(e.target.value)}
          onKeyDown={handleKeyDown}
          step="0.1"
          min="0.1"
        />
        <button onClick={handleAdd}>添加</button>
      </div>
      {positions.length > 0 && (
        <div className="position-list">
          {positions.map((p, i) => {
            const cur = getPrice(p.code);
            const profit = cur != null ? calcProfit(p, cur) : null;
            return (
              <div key={i} className="position-item">
                <span className="pos-label">
                  <span className="pos-code">{p.code === "XAU" ? "金" : "银"}</span>
                  <span className={p.direction === "long" ? "tag-long" : "tag-short"}>
                    {p.direction === "long" ? "多" : "空"}
                  </span>
                  <span className="pos-detail">{p.lots}手 @ {p.entryPrice}</span>
                </span>
                <span className="pos-right">
                  {profit != null ? (
                    <span className={profit >= 0 ? "profit-up" : "profit-down"}>
                      {profit >= 0 ? "+" : ""}{profit.toFixed(2)}
                    </span>
                  ) : (
                    <span className="profit-wait">--</span>
                  )}
                  <button className="btn-remove" onClick={() => handleRemove(i)}>✕</button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
