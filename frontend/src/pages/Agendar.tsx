import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Agendar() {
  const [servicos, setServicos] = useState<any[]>([])
  const [servicoId, setServicoId] = useState('')
  const [data, setData] = useState('')
  const [hora, setHora] = useState('')
  const [mensagem, setMensagem] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get('http://localhost:8000/api/servicos/')
      .then(res => setServicos(res.data))
      .catch(() => setMensagem('Erro ao carregar serviços.'))
  }, [])

  async function handleAgendamento(e: React.FormEvent) {
    e.preventDefault()
    setMensagem('')
    try {
      await axios.post('http://localhost:8000/api/agendamentos/', {
        servico: servicoId,
        data,
        hora,
      }, {
        headers: {
          Authorization: `Token ${token}`
        }
      })
      setMensagem('✅ Agendamento realizado com sucesso!')
      navigate('/')
    } catch {
      setMensagem('❌ Não foi possível agendar. Verifique os dados.')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center">
      <form onSubmit={handleAgendamento} className="bg-gray-900 p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Agendar Serviço</h2>

        {mensagem && <p className="text-sm mb-4 text-center">{mensagem}</p>}

        <select
          className="w-full p-3 rounded mb-4 bg-gray-800 text-white"
          value={servicoId}
          onChange={e => setServicoId(e.target.value)}
          required
        >
          <option value="">Selecione um serviço</option>
          {servicos.map(servico => (
            <option key={servico.id} value={servico.id}>
              {servico.nome} - R$ {servico.preco}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="w-full p-3 rounded mb-4 bg-gray-800 text-white"
          value={data}
          onChange={e => setData(e.target.value)}
          required
        />
        <input
          type="time"
          className="w-full p-3 rounded mb-4 bg-gray-800 text-white"
          value={hora}
          onChange={e => setHora(e.target.value)}
          required
        />

        <button type="submit" className="w-full bg-white text-black py-2 rounded hover:bg-gray-200 transition">
          Agendar
        </button>
      </form>
    </div>
  )
}
