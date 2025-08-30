import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MadeWithLasy } from "@/components/made-with-lasy";

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("aviator_user");
    if (user) {
      navigate("/predictions");
    }
  }, [navigate]);

  const handleLogin = () => {
    if (name.trim() && whatsapp.trim()) {
      const userData = { name, whatsapp };
      localStorage.setItem("aviator_user", JSON.stringify(userData));
      navigate("/predictions");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <main className="flex flex-col items-center text-center gap-6 w-full max-w-sm">
        <h1 className="text-5xl font-bold">Predições Aviator</h1>
        <p className="text-xl text-gray-300">
          Receba sinais exclusivos do jogo em tempo real
        </p>
        <div className="w-full space-y-4 mt-4">
          <Input
            type="text"
            placeholder="Seu Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white text-lg p-6 text-center"
          />
          <Input
            type="text"
            placeholder="Seu WhatsApp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white text-lg p-6 text-center"
          />
        </div>
        <Button
          onClick={handleLogin}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-2xl p-8 mt-4"
        >
          Entrar
        </Button>
      </main>
      <div className="absolute bottom-4">
        <MadeWithLasy />
      </div>
    </div>
  );
};

export default Register;