import { useEffect, useRef, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { PriceData, ConnectionStatus } from "../types";

const WS_URL = "wss://webhqv1.jrjr.com:39801/ws";
const RECONNECT_DELAY = 1000;
const CODES = new Set(["XAU", "XAG"]);

function parseMessage(raw: string): PriceData[] {
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];

    const results: PriceData[] = [];
    for (const item of arr) {
      const code = item.c;
      if (!code || !CODES.has(code)) continue;

      const price = parseFloat(item.p);
      const open = parseFloat(item.o);
      const prevClose = parseFloat(item.nc);
      const high = parseFloat(item.h);
      const low = parseFloat(item.l);

      if (isNaN(price)) continue;

      const change = price - prevClose;
      const changePercent = prevClose ? (change / prevClose) * 100 : 0;

      results.push({ code, price, open, prevClose, high, low, change, changePercent });
    }
    return results;
  } catch {
    return [];
  }
}

export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [prices, setPrices] = useState<Record<string, PriceData>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      ws.send(JSON.stringify({ CONNECTED: "1" }));
    };

    ws.onmessage = (event) => {
      const items = parseMessage(event.data);
      if (items.length > 0) {
        setPrices((prev) => {
          const next = { ...prev };
          for (const item of items) {
            next[item.code] = item;
          }
          // Update tray
          const xau = next["XAU"];
          const xag = next["XAG"];
          const titleParts: string[] = [];
          const tooltipParts: string[] = [];
          if (xau) {
            titleParts.push(`金${xau.price.toFixed(0)}`);
            const s = xau.change >= 0 ? "+" : "";
            tooltipParts.push(`伦敦金: ${xau.price.toFixed(2)} (${s}${xau.change.toFixed(2)})`);
          }
          if (xag) {
            titleParts.push(`银${xag.price.toFixed(2)}`);
            const s = xag.change >= 0 ? "+" : "";
            tooltipParts.push(`伦敦银: ${xag.price.toFixed(3)} (${s}${xag.change.toFixed(3)})`);
          }
          invoke("update_tray", {
            title: titleParts.join(" ") || "金-- 银--",
            tooltip: tooltipParts.join("\n") || "等待数据...",
          }).catch(() => {});
          return next;
        });
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      wsRef.current = null;
      reconnectTimer.current = window.setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { status, xau: prices["XAU"] ?? null, xag: prices["XAG"] ?? null };
}
