import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Header from "../components/Header"

export default function Home() {
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("user") // supondo que você salva isso no login
    if (storedUser) {
      setUsername(storedUser)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Saudação */}
      <div className="text-center mt-4">
        {username ? (
          <p className="text-green-400">Olá, {username} 👋</p>
        ) : (
          <p className="text-gray-400">Você não está logado.</p>
        )}
      </div>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4 py-20">
        <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
          Agende seu corte com estilo
        </h2>
        <p className="text-gray-400 mb-8 max-w-md">
          Agendamentos rápidos, cortes modernos, barbearia profissional.
        </p>

        <Link
          to="/agendar"
          className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-200 transition mb-4"
        >
          Agendar agora
        </Link>

        <Link to="/meus-agendamentos" className="text-white underline">
          Ver meus agendamentos
        </Link>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-8">
        © {new Date().getFullYear()} fsw-barber. Todos os direitos reservados.
      </footer>
    </div>
  )
}
