import { useEffect, useState } from 'react'
import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_URL;

type Agendamento = {
  id: number
  servico: {
    nome: string
    preco: string
  }
  data: string
  hora: string
}

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')

    // axios.get('https://5f0cb843e5a8.ngrok-free.app/api/agendamentos/', {
      
    axios.get('http://localhost:8000/api/agendamentos/', {
      headers: {
        Authorization: `Token ${token}`
      }
    })
    .then(res => setAgendamentos(res.data))
    .catch(() => setErro('Erro ao carregar seus agendamentos.'))
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Meus Agendamentos</h1>

      {erro && <p className="text-red-500 text-center">{erro}</p>}

      {agendamentos.length === 0 ? (
        <p className="text-center text-gray-400">Você ainda não fez nenhum agendamento.</p>
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {agendamentos.map(ag => (
            <div key={ag.id} className="bg-gray-800 rounded-lg p-4 shadow-md">
              <h2 className="text-xl font-semibold">{ag.servico.nome}</h2>
              <p className="text-gray-300">💰 R$ {parseFloat(ag.servico.preco).toFixed(2)}</p>
              <p className="text-gray-400">📅 {ag.data} às {ag.hora}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
