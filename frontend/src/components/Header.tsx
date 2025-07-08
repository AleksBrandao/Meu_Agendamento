import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header() {
  const [token, setToken] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    setToken(storedToken)
  }, [])

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
    navigate('/login')
  }

  return (
    <header className="w-full px-6 py-4 flex justify-between items-center bg-gray-900 text-white shadow">
      <Link to="/" className="text-2xl font-bold">
        fsw-barber
      </Link>

      <nav className="flex gap-4 text-sm items-center">
        <Link to="/servicos" className="hover:text-gray-300 transition">
          Serviços
        </Link>

        {token && (
          <>
            <Link to="/agendar" className="hover:text-gray-300 transition">
              Agendar
            </Link>
            <Link
              to="/meus-agendamentos"
              className="hover:text-gray-300 transition"
            >
              Meus Agendamentos
            </Link>
            <Link to="/admin/servicos" className="hover:text-gray-300 transition">
              Admin
            </Link>
            <Link to="/admin/horarios">Gerenciar horários</Link>
            <button
              onClick={handleLogout}
              className="ml-2 bg-red-600 px-3 py-1 rounded text-white hover:bg-red-500 transition"
            >
              Sair
            </button>
          </>
        )}

        {!token && (
          <>
            <Link to="/login" className="hover:text-gray-300 transition">
              Login
            </Link>
            <Link to="/cadastro" className="hover:text-gray-300 transition">
              Cadastro
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
