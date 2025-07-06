import { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

type Horario = {
  id: number
  dia_semana: number
  hora: string
}

const diasSemana = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
]

export default function AdminHorarios() {
  const [diaSemana, setDiaSemana] = useState('0')
  const [hora, setHora] = useState('')
  const [horarios, setHorarios] = useState<Horario[]>([])
  const [barbeariaId, setBarbeariaId] = useState<string>('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    carregarHorarios()
  }, [])

  useEffect(() => {
    async function buscarBarbearia() {
      try {
        const res = await axios.get('http://localhost:8000/api/minha-barbearia/', {
          headers: { Authorization: `Token ${token}` },
        })
        setBarbeariaId(res.data.id.toString())
      } catch {
        toast.error('Erro ao carregar barbearia.')
      }
    }

    buscarBarbearia()
  }, [])

  async function carregarHorarios() {
    try {
      const res = await axios.get('http://localhost:8000/api/horarios-disponiveis/', {
        headers: { Authorization: `Token ${token}` }
      })
      setHorarios(res.data)
    } catch {
      toast.error('Erro ao carregar horários.')
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!barbeariaId) {
      toast.error('Nenhuma barbearia carregada.')
      return
    }

    try {
      await axios.post(
        'http://localhost:8000/api/horarios-disponiveis/',
        {
          barbearia: Number(barbeariaId),
          dia_semana: Number(diaSemana),
          hora
        },
        { headers: { Authorization: `Token ${token}` } }
      )
      toast.success('Horário cadastrado!')
      setHora('')
      setDiaSemana('0')
      carregarHorarios()
    } catch {
      toast.error('Erro ao salvar horário (evite duplicados).')
    }
  }

  async function excluirHorario(id: number) {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return
    try {
      await axios.delete(`http://localhost:8000/api/horarios-disponiveis/${id}/`, {
        headers: { Authorization: `Token ${token}` }
      })
      toast.success('Horário excluído.')
      carregarHorarios()
    } catch {
      toast.error('Erro ao excluir.')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Horários Disponíveis</h1>

      <form onSubmit={handleSalvar} className="max-w-md mx-auto mb-8">
        <select
          className="w-full p-2 mb-4 rounded bg-gray-800"
          value={diaSemana}
          onChange={(e) => setDiaSemana(e.target.value)}
        >
          {diasSemana.map((dia, index) => (
            <option key={index} value={index}>
              {dia}
            </option>
          ))}
        </select>
        <input
          type="time"
          className="w-full p-2 mb-4 rounded bg-gray-800"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-white text-black py-2 rounded">
          Adicionar Horário
        </button>
      </form>

      <div className="max-w-2xl mx-auto">
        {horarios.map((h) => (
          <div key={h.id} className="bg-gray-800 p-4 rounded mb-2 flex justify-between items-center">
            <span>
              {diasSemana[h.dia_semana]} - {h.hora.slice(0, 5)}
            </span>
            <button onClick={() => excluirHorario(h.id)} className="text-red-400">
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
