import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

// Componente para o ícone do avião estilizado
const AviatorIcon = ({ isActive }: { isActive: boolean }) => (
  <div
    className={cn(
      "absolute flex items-center justify-center transition-all duration-500 ease-in-out",
      isActive
        ? "top-8 h-12 w-12" // Posição superior e tamanho menor
        : "inset-0 h-20 w-20" // Centralizado e tamanho maior
    )}
  >
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white transform -rotate-45"
    >
      <path d="M2 12l20-7-9 7 9 7-20-7z" />
    </svg>
  </div>
);

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

interface HistoryEntry {
  text: string;
  cashout: string;
  time: string;
}

type AppState = "IDLE" | "PREDICTION_READY";

export default function PredictionCircle() {
  const [appState, setAppState] = useState<AppState>("IDLE");
  const [timer, setTimer] = useState(0);
  const [cashoutText, setCashoutText] = useState("");
  const [isExpiring, setIsExpiring] = useState(false);
  const [isGenerationFrozen, setIsGenerationFrozen] = useState(false);

  const saveToHistory = useCallback((text: string, cashout: string) => {
    const history: HistoryEntry[] = JSON.parse(localStorage.getItem("aviator_history") || "[]");
    const newEntry: HistoryEntry = {
      text,
      cashout,
      time: new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    localStorage.setItem("aviator_history", JSON.stringify(updatedHistory));
  }, []);

  const triggerPrediction = () => {
    setAppState("PREDICTION_READY");
    const entryTime = Math.floor(getRandom(25, 50));
    setTimer(entryTime);

    const minCashout = getRandom(1.5, 8.0);
    const maxCashout = getRandom(minCashout + 0.5, 10.0);
    const cashoutString = `Realizar saída entre ${minCashout.toFixed(2)}x até ${maxCashout.toFixed(2)}x`;
    const predictionText = "💰 Cashout cedo sugerido";
    
    setCashoutText(cashoutString);
    saveToHistory(predictionText, cashoutString);

    setIsGenerationFrozen(true);
    setTimeout(() => {
      setIsGenerationFrozen(false);
    }, 25000);
  };

  const handleGenerateClick = () => {
    if (isGenerationFrozen) return;
    triggerPrediction();
  };

  useEffect(() => {
    if (appState === "IDLE") return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 6 && prev > 1) setIsExpiring(true);
        if (prev <= 1) {
          setAppState("IDLE");
          setIsExpiring(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [appState]);

  const isActive = appState === "PREDICTION_READY";

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      {isActive ? (
        <>
          <h2 className="text-3xl font-bold">Predição Detectada 🔥</h2>
          <p className="text-xl text-gray-400 h-6">Entrada disponível em:</p>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold">Clique no botão para gerar um sinal</h2>
          <p className="text-lg text-gray-400 h-6">Após gerar o sinal, aguarde o tempo acabar para fazer a Aposta!</p>
        </>
      )}

      {isActive && (
        <div className="text-7xl font-bold text-red-500 my-4">{timer}s</div>
      )}

      <div
        className={cn(
          "relative w-80 h-80 rounded-full flex flex-col items-center justify-center text-center p-4 transition-all duration-300 mt-4",
          isActive
            ? "bg-black animate-flame border-2 border-transparent"
            : "bg-black border-2 border-red-600 animate-glow"
        )}
      >
        <AviatorIcon isActive={isActive} />
        
        {isActive && (
          <div className="flex flex-col gap-4 mt-24 text-center">
            <p className="text-2xl font-semibold text-white">💰 Cashout cedo sugerido</p>
            <p className="text-lg font-bold text-yellow-300">{cashoutText}</p>
          </div>
        )}
      </div>

      {isExpiring && (
        <p className="text-red-500 text-xl font-bold mt-4 animate-pulse">
          ⚠️ Entrada prestes a expirar
        </p>
      )}

      <Button
        onClick={handleGenerateClick}
        disabled={isGenerationFrozen}
        className={cn(
          "w-full max-w-md font-bold text-xl p-7 mt-6 transition-colors",
          isGenerationFrozen
            ? "bg-gray-800 cursor-not-allowed text-gray-500"
            : "bg-black border border-red-500 text-white hover:bg-red-900/50"
        )}
      >
        {isGenerationFrozen ? `Aguarde...` : "Gerar Predição"}
      </Button>
    </div>
  );
}