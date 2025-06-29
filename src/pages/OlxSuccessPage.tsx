import { useEffect, useState } from "react";
import { api } from "../hooks/olx-api";

export function OlxSuccessPage() {
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    api.get<{ connected: boolean }>("/olx/status")
       .then(res => setConnected(res.data.connected))
       .catch(() => setConnected(false));
  }, []);

  if (connected === null) return <p>Ładowanie…</p>;
  return connected
    ? <p>✔ Konto OLX zostało podłączone!</p>
    : <p>❌ Nie udało się podłączyć konta.</p>;
}