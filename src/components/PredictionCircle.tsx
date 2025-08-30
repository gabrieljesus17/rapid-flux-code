import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

// Componente para o ícone do avião estilizado
const AviatorIcon = () => (
  <svg
    width="60"
    height="60"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-white transform -rotate-45" // Inclinação para cima
  >
    <path d="M2 12l20-7-9 7 9 7-20-7z" />
  </svg>
);

const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

interface HistoryEntry {
  text: string;
  cashout: string;
  time: string;
}

export default function PredictionCircle() {
  const [predictionActive, setPredictionActive] = useState(false);
  const [timer, setTimer] = useState(0);
  const [cashoutText, setCashoutText] = useState("");
  const [analysisTimer, setAnalysisTimer] = useState(Math.floor(getRandom(14, 120)));
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

  const triggerPrediction = useCallback(() => {
    if (isGenerationFrozen) return;

    setPredictionActive(true);
    const entryTime = Math.floor(getRandom(25, 50)); // Ajustado para 25-50s
    setTimer(entryTime);

    const minCashout = getRandom(1.5, 8.0);
    const maxCashout = getRandom(minCashout + 0.5, 10.0);
    const cashoutString = `Realizar saída entre ${minCashout.toFixed(2)}x até ${maxCashout.toFixed(2)}x`;
    const predictionText = "💰 Cashout cedo sugerido";
    
    setCashoutText(cashoutString);
    saveToHistory(predictionText, cashoutString);

    // Congela a geração manual por 25 segundos
    setIsGenerationFrozen(true);
    setTimeout(() => {
      setIsGenerationFrozen(false);
    }, 25000);

  }, [saveToHistory, isGenerationFrozen]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (predictionActive) {
        setTimer(prev => {
          if (prev <= 6 && prev > 1) setIsExpiring(true);
          if (prev <= 1) {
            setPredictionActive(false);
            setIsExpiring(false);
            setAnalysisTimer(Math.floor(getRandom(14, 120)));
            return 0;
          }
          return prev - 1;
        });
      } else {
        setAnalysisTimer(prev => {
          if (prev <= 1) {
            triggerPrediction();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [predictionActive, triggerPrediction]);

  const renderTimer = () => {
    if (predictionActive) {
      return `${timer}s`;
    }
    const minutes = Math.floor(analysisTimer / 60);
    const seconds = analysisTimer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      {predictionActive ? (
        <>
          <h2 className="text-3xl font-bold">Predição Detectada 🔥</h2>
          <p className="text-xl text-gray-400 h-6">Entrada disponível em:</p>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold">Próxima Predição em:</h2>
          <p className="text-xl text-gray-400 h-6">Analisando predição...</p>
        </>
      )}

      <div className="text-7xl font-bold text-red-500 my-4">{renderTimer()}</div>

      <div
        className={cn(
          "relative w-80 h-80 rounded-full flex flex-col items-center justify-center text-center p-4 transition-all duration-300",
          predictionActive
            ? "bg-red-600 animate-flame"
            : "bg-gray-800 border-2 border-red-600 animate-glow"
        )}
      >
        <div className="absolute top-10">
          <AviatorIcon />
        </div>
        
        {predictionActive && (
          <div className="flex flex-col gap-4 mt-20 text-center">
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
        onClick={triggerPrediction}
        disabled={isGenerationFrozen}
        className="w-full max-w-md bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl p-7 mt-6 disabled:bg-gray-800 disabled:cursor-not-allowed"
      >
        {isGenerationFrozen ? `Aguarde...` : "Gerar Manualmente"}
      </Button>
    </div>
  );
}