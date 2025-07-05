import { useEffect, useState } from 'react'
import axios from 'axios'

type Agendamento = {
  id: number
  servico: {
    nome: string
    preco: string
    duracao_minutos: number
  }
  data: string
  hora: string
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [erro, setErro] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get('http://localhost:8000/api/agendamentos/', {
      headers: {
        Authorization: `Token ${token}`
      }
    })
      .then(res => setAgendamentos(res.data))
      .catch(() => setErro('Erro ao carregar agendamentos.'))
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Meus Agendamentos</h1>

      {erro && <p className="text-red-500 text-center mb-4">{erro}</p>}

      {agendamentos.length === 0 && !erro && (
        <p className="text-center text-gray-400">Você ainda não possui agendamentos.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agendamentos.map((ag) => (
          <div key={ag.id} className="bg-gray-800 rounded-lg p-4 shadow-md">
            <h2 className="text-xl font-semibold">{ag.servico.nome}</h2>
            <p className="text-gray-300">💰 R$ {parseFloat(ag.servico.preco).toFixed(2)}</p>
            <p className="text-gray-400">⏱️ {ag.servico.duracao_minutos} min</p>
            <p className="text-white mt-2">📅 {ag.data}</p>
            <p className="text-white">🕒 {ag.hora}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
