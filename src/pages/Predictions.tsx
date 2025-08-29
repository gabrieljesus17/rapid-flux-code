import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";

const PREDICTIONS = [
  "⚠️ Atenção: rodada de risco alto",
  "✅ Sinal positivo: entrada recomendada",
  "⏳ Cashout cedo sugerido",
];

const Predictions = () => {
  const [prediction, setPrediction] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);

  const saveToHistory = (newPrediction: string) => {
    const history = JSON.parse(localStorage.getItem("aviator_history") || "[]");
    const newEntry = {
      text: newPrediction,
      time: new Date().toLocaleTimeString("pt-BR"),
    };
    const updatedHistory = [newEntry, ...history].slice(0, 10); // Mantém apenas os últimos 10
    localStorage.setItem("aviator_history", JSON.stringify(updatedHistory));
  };

  const generatePrediction = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * PREDICTIONS.length);
    const newPrediction = PREDICTIONS[randomIndex];
    setPrediction(newPrediction);
    saveToHistory(newPrediction);
    setTimer(30); // Reinicia o cronômetro
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          generatePrediction();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [generatePrediction]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 w-full">
      <h2 className="text-4xl font-bold">Próxima Predição em:</h2>
      <div className="text-8xl font-bold text-red-500">{timer}s</div>

      {prediction && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg w-full max-w-md">
          <p className="text-3xl font-semibold">{prediction}</p>
        </div>
      )}

      <Button
        onClick={generatePrediction}
        className="w-full max-w-md bg-red-600 hover:bg-red-700 text-white font-bold text-2xl p-8 mt-8"
      >
        Gerar Previsão Agora
      </Button>
    </div>
  );
};

export default Predictions;