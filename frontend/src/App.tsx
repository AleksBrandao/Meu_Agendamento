import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Servicos from './pages/Servicos'
import Agendar from './pages/Agendar'
import AgendamentosPage from './pages/AgendamentosPage'
import AdminServicos from './pages/AdminServicos'

function App() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    setToken(storedToken)
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/servicos" element={<Servicos />} />

        {/* Rotas protegidas */}
        <Route
          path="/agendar"
          element={token ? <Agendar /> : <Navigate to="/login" />}
        />
        <Route
          path="/meus-agendamentos"
          element={token ? <AgendamentosPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin/servicos"
          element={token ? <AdminServicos /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
