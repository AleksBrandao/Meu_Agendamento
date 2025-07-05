import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Servicos from './pages/Servicos'
import Agendar from './pages/Agendar'
import AgendamentosPage from './pages/AgendamentosPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/meus-agendamentos" element={<AgendamentosPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
