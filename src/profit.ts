import type { Position } from "./types";

export function calcProfit(position: Position, currentPrice: number): number {
  const multiplier = position.code === "XAU" ? 100 : 5000;
  const raw = position.lots * multiplier * (currentPrice - position.entryPrice);
  return position.direction === "short" ? -raw : raw;
}
