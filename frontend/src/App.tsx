import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import Servicos from './pages/Servicos'
import Agendar from './pages/Agendar'
import AgendamentosPage from './pages/AgendamentosPage'
import AdminServicos from './pages/AdminServicos'
import { ToastContainer } from 'react-toastify'
import AdminHorarios from './pages/AdminHorarios'
import MinhaBarbearia from './pages/MinhaBarbearia'
import 'react-datepicker/dist/react-datepicker.css';
import PainelAdminAgendamentos from './pages/admin/PainelAdminAgendamentos'
import PainelResumoAgendamentos from "./pages/admin/PainelResumoAgendamentos";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/servicos" element={<Servicos />} />
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/meus-agendamentos" element={<AgendamentosPage />} />
        <Route path="/admin/servicos" element={<AdminServicos />} />
        <Route path="/admin/horarios" element={<AdminHorarios />} />
        <Route path="/minha_barbearia" element={<MinhaBarbearia />} />
        <Route path="/admin/agendamentos" element={<PainelAdminAgendamentos />} />
        <Route path="/admin/resumo-agendamentos" element={<PainelResumoAgendamentos />} />

      </Routes>

      {/* Toast visível em qualquer rota */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </BrowserRouter>
  )
}
