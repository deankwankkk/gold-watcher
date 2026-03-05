import { useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { PriceCard } from "./components/PriceCard";
import { PositionForm } from "./components/PositionForm";
import type { Position } from "./types";

function App() {
  const [positions, setPositions] = useState<Position[]>([]);
  const { status, xau, xag } = useWebSocket();

  const statusLabel =
    status === "connected" ? "已连接" :
    status === "connecting" ? "连接中..." : "已断开";

  return (
    <div className="app">
      <header>
        <h1>伦敦金银实时行情</h1>
        <div className={`status ${status}`}>
          <span className="dot" />
          {statusLabel}
        </div>
      </header>
      <main>
        <PriceCard label="伦敦金 (XAU)" data={xau} />
        <PriceCard label="伦敦银 (XAG)" data={xag} />
      </main>
      <PositionForm positions={positions} onChange={setPositions} xau={xau} xag={xag} />
    </div>
  );
}

export default App;
