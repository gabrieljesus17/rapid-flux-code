import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

// Componente para o ícone do avião estilizado, agora usando a imagem
const AviatorIcon = ({ isActive }: { isActive: boolean }) => (
  <div
    className={cn(
      "absolute flex items-center justify-center transition-all duration-500 ease-in-out",
      isActive
        ? "top-8 h-12 w-12" // Posição superior e tamanho menor
        : "inset-0 h-20 w-20" // Centralizado e tamanho maior
    )}
  >
    <img
      src="/AviatorSpribeLasy.jpg"
      alt="Aviator Plane"
      className="object-contain w-full h-full"
    />
  </div>
);

const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

interface HistoryEntry {
  text: string;
  cashout: string;
  time: string;
}

type AppState = "IDLE" | "PREDICTION_READY" | "AWAITING_ENTRY" | "ENTRY_COMPLETE";

export default function PredictionCircle() {
  const [appState, setAppState] = useState<AppState>("IDLE");
  const [timer, setTimer] = useState(0);
  const [cashoutText, setCashoutText] = useState("");

  const saveToHistory = useCallback((text: string, cashout: string) => {
    const history: HistoryEntry[] = JSON.parse(localStorage.getItem("aviator_history") || "[]");
    const newEntry: HistoryEntry = { text, cashout, time: new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }) };
    const updatedHistory = [newEntry, ...history].slice(0, 10);
    localStorage.setItem("aviator_history", JSON.stringify(updatedHistory));
  }, []);

  // Efeito para gerar a predição quando o estado muda para PREDICTION_READY
  useEffect(() => {
    if (appState === "PREDICTION_READY") {
      setTimer(getRandom(25, 50));
      const minCashout = getRandom(150, 800) / 100;
      const maxCashout = getRandom(Math.floor(minCashout * 100) + 50, 1000) / 100;
      const cashoutString = `Realizar saída entre ${minCashout.toFixed(2)}x até ${maxCashout.toFixed(2)}x`;
      const predictionText = "💰 Cashout cedo sugerido";
      setCashoutText(cashoutString);
      saveToHistory(predictionText, cashoutString);
    }
  }, [appState, saveToHistory]);

  // Efeito principal para controlar os timers e transições de estado
  useEffect(() => {
    if (appState === "IDLE" || appState === "ENTRY_COMPLETE") return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (appState === "PREDICTION_READY") {
            setAppState("AWAITING_ENTRY");
            setTimer(getRandom(20, 40));
          } else if (appState === "AWAITING_ENTRY") {
            setAppState("ENTRY_COMPLETE");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [appState]);

  // Efeito para o estado final, que reseta o app após 5 segundos
  useEffect(() => {
    if (appState === "ENTRY_COMPLETE") {
      const timeout = setTimeout(() => {
        setAppState("IDLE");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [appState]);

  const handleGenerateClick = () => {
    if (appState === "IDLE") {
      setAppState("PREDICTION_READY");
    }
  };

  const renderContent = () => {
    switch (appState) {
      case "PREDICTION_READY":
        return {
          title: "Predição Detectada 🔥",
          subtitle: "Entrada disponível em:",
          showTimer: true,
          circleClass: "bg-black animate-flame border-2 border-transparent",
          buttonText: "Gerar Predição",
          buttonDisabled: true,
          showButton: true,
        };
      case "AWAITING_ENTRY":
        return {
          title: "Entrada em andamento...",
          subtitle: null,
          showTimer: true,
          circleClass: "bg-black animate-flame border-2 border-transparent",
          buttonText: "",
          buttonDisabled: true,
          showButton: false,
        };
      case "ENTRY_COMPLETE":
        return {
          title: "Entrada em andamento...",
          subtitle: null,
          showTimer: false,
          circleClass: "bg-black animate-flame border-2 border-transparent",
          buttonText: "Entrada Concluída ✅",
          buttonDisabled: true,
          showButton: true,
        };
      case "IDLE":
      default:
        return {
          title: "Clique no botão para gerar um sinal",
          subtitle: "Após gerar o sinal, aguarde o tempo acabar para fazer a Aposta!",
          showTimer: false,
          circleClass: "bg-black border-2 border-red-600 animate-glow",
          buttonText: "Gerar Predição",
          buttonDisabled: false,
          showButton: true,
        };
    }
  };

  const { title, subtitle, showTimer, circleClass, buttonText, buttonDisabled, showButton } = renderContent();
  const isActive = appState !== "IDLE";

  return (
    <div className="flex flex-col items-center justify-center w-full gap-2">
      <h2 className="text-3xl font-bold text-center">{title}</h2>
      {subtitle && <p className="text-lg text-gray-400 h-6 text-center">{subtitle}</p>}
      
      {showTimer && <div className="text-7xl font-bold text-red-500 my-4">{timer}s</div>}

      <div className={cn("relative w-80 h-80 rounded-full flex flex-col items-center justify-center text-center p-4 transition-all duration-300 mt-4", circleClass)}>
        <AviatorIcon isActive={isActive} />
        {isActive && appState !== "AWAITING_ENTRY" && appState !== "ENTRY_COMPLETE" && (
          <div className="flex flex-col gap-4 mt-24 text-center">
            <p className="text-2xl font-semibold text-white font-montserrat">💰 Cashout cedo sugerido</p>
            <p className="text-lg font-bold text-yellow-300">{cashoutText}</p>
          </div>
        )}
      </div>

      {showButton && (
        <Button
          onClick={handleGenerateClick}
          disabled={buttonDisabled}
          className={cn(
            "w-full max-w-md font-bold text-xl p-7 mt-6 transition-colors",
            appState === "IDLE" ? "bg-black border border-red-500 text-white hover:bg-red-900/50" : "bg-gray-800 cursor-not-allowed text-gray-500"
          )}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}