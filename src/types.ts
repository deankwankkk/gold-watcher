export interface PriceData {
  code: string;
  price: number;
  open: number;
  prevClose: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export type Direction = "long" | "short";

export interface Position {
  code: "XAU" | "XAG";
  direction: Direction;
  entryPrice: number;
  lots: number;
}
