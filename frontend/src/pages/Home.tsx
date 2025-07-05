import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-2xl font-bold">fsw-barber</h1>
        <nav>
          <a
            href="#services"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Serviços
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4 py-20">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
          Agende seu corte com estilo
        </h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Agendamentos rápidos, cortes modernos, barbearia profissional.
        </p>
        <a
          href="/agendar"
          className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition"
        >
          Agendar agora
        </a>

        <Link to="/meus-agendamentos" className="text-white underline">
          Ver meus agendamentos
        </Link>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-8">
        © {new Date().getFullYear()} fsw-barber. Todos os direitos reservados.
      </footer>
    </div>
  );
}
