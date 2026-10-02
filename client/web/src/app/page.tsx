import Image from "next/image";

export default function Home() {
  
  const WS_URI = "ws://127.0.0.1:8080";
  const PING_INTERVAL_MS = 5000
  const output = document.querySelector<HTMLDivElement>("#output");
  if (!output) {
    throw new Error("#output element not found");
  }
  
  const websocket = new WebSocket(WS_URI);
  let pingInterval: ReturnType<typeof setInterval> | undefined;

  function writeToScreen(message: string): void {
    const p = document.createElement("p")
    p.textContent = message;
    output!.prepend(p);
  }

    function sendMessage(message: string): void {
      writeToScreen(`SENT: ${message}`);
      websocket.send(message);
    }

    websocket.onopen = (): void => {
      writeToScreen("CONNECTED");
      sendMessage("ping");
      pingInterval = setInterval(() => {
        sendMessage("ping");
      }, PING_INTERVAL_MS);
    };

    websocket.onclose = (): void => {
      writeToScreen("DISCONNECTED");
      clearInterval(pingInterval);
    }

    websocket.onmessage = (e: MessageEvent<string>): void => {
      writeToScreen(`RECEIVED: ${e.data}`)
    }

    websocket.onerror = (): void => {
      writeToScreen(`ERROR: connection failed`)
    }
  return (
    <div>
      <span>
        WebSocket Test
      </span>
      <p>Ping every 5 seconds</p>
      <div id="output"></div>
    </div>
  );
}
