import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const PREDICTION_TEXTS = [
  "✅ Sinal positivo: entrada recomendada",
  "⚠️ Atenção: rodada de risco alto",
  "⏳ Cashout cedo sugerido",
];

type AppState = "ANALYZING" | "PREDICTION_READY" | "ENTRY_EXPIRING";

const Predictions = () => {
  const [appState, setAppState] = useState<AppState>("ANALYZING");
  const [analysisTimer, setAnalysisTimer] = useState(0);
  const [entryTimer, setEntryTimer] = useState(0);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [cashout, setCashout] = useState<string | null>(null);

  const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

  const saveToHistory = useCallback((newPrediction: string, newCashout: string) => {
    const history = JSON.parse(localStorage.getItem("aviator_history") || "[]");
    const newEntry = {
      text: newPrediction,
      cashout: newCashout,
      time: new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    localStorage.setItem("aviator_history", JSON.stringify(updatedHistory));
  }, []);

  const generatePredictionDetails = useCallback(() => {
    // Gera a predição
    const newPrediction = PREDICTION_TEXTS[Math.floor(Math.random() * PREDICTION_TEXTS.length)];
    setPrediction(newPrediction);

    // Gera o cashout
    const x = getRandom(1.5, 8.0);
    const y = getRandom(x + 0.5, 10.0);
    const newCashout = `Realizar saída entre ${x.toFixed(2)}x até ${y.toFixed(2)}x`;
    setCashout(newCashout);

    // Salva no histórico
    saveToHistory(newPrediction, newCashout);

    // Define o tempo de entrada e muda o estado
    setEntryTimer(Math.floor(getRandom(10, 25)));
    setAppState("PREDICTION_READY");
  }, [saveToHistory]);

  const startNewAnalysisCycle = useCallback(() => {
    setAppState("ANALYZING");
    setPrediction(null);
    setCashout(null);
    setAnalysisTimer(Math.floor(getRandom(14, 120)));
  }, []);

  // Efeito para iniciar o ciclo na primeira vez
  useEffect(() => {
    startNewAnalysisCycle();
  }, [startNewAnalysisCycle]);

  // Efeito principal para os cronômetros
  useEffect(() => {
    const interval = setInterval(() => {
      if (appState === "ANALYZING") {
        setAnalysisTimer((prev) => {
          if (prev <= 1) {
            generatePredictionDetails();
            return 0;
          }
          return prev - 1;
        });
      } else if (appState === "PREDICTION_READY" || appState === "ENTRY_EXPIRING") {
        setEntryTimer((prev) => {
          if (prev <= 6 && prev > 1) {
            setAppState("ENTRY_EXPIRING");
          }
          if (prev <= 1) {
            startNewAnalysisCycle();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [appState, generatePredictionDetails, startNewAnalysisCycle]);

  const handleManualGeneration = () => {
    generatePredictionDetails();
  };

  const renderTimer = () => {
    if (appState === "ANALYZING") {
      const minutes = Math.floor(analysisTimer / 60);
      const seconds = analysisTimer % 60;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
    return `${entryTimer}s`;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <h2 className="text-3xl font-bold">
        {appState === "ANALYZING" ? "Próxima Predição em:" : "Entrada disponível em:"}
      </h2>
      
      <p className="text-xl text-gray-400 h-6">
        {appState === "ANALYZING" ? "Analisando predição..." : "Predição detectada 🔥"}
      </p>

      <div className="text-7xl font-bold text-red-500 my-4">{renderTimer()}</div>

      <div className="relative w-80 h-80 bg-red-600 rounded-full flex flex-col items-center justify-center text-center p-4 shadow-lg">
        <Send size={60} className="text-white absolute top-10" />
        {appState !== "ANALYZING" && prediction && cashout && (
          <div className="flex flex-col gap-4 mt-16">
            <p className="text-2xl font-semibold text-white">{prediction}</p>
            <p className="text-lg font-bold text-yellow-300">{cashout}</p>
          </div>
        )}
      </div>
      
      {appState === "ENTRY_EXPIRING" && (
        <p className="text-red-500 text-xl font-bold mt-4 animate-pulse">
          ⚠️ Entrada prestes a expirar
        </p>
      )}

      <Button
        onClick={handleManualGeneration}
        className="w-full max-w-md bg-gray-700 hover:bg-gray-600 text-white font-bold text-xl p-7 mt-6"
      >
        Gerar Manualmente
      </Button>
    </div>
  );
};

export default Predictions;