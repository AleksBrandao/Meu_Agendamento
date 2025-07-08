import React, { useState } from 'react'
import {
  addDays,
  addMinutes,
  format,
  isBefore,
  setHours,
  setMinutes,
  startOfDay
} from 'date-fns'

const diasDaSemana = [
  { label: 'Domingo', value: 0 },
  { label: 'Segunda', value: 1 },
  { label: 'Terça', value: 2 },
  { label: 'Quarta', value: 3 },
  { label: 'Quinta', value: 4 },
  { label: 'Sexta', value: 5 },
  { label: 'Sábado', value: 6 },
]

type GradeHorarios = {
  [hora: string]: {
    [dia: number]: {
      ativo: boolean
      duracao: number
    }
  }
}

const DURACOES = [30, 45, 60, 90, 120]

function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

function minutosParaHora(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export default function AdminHorarios() {
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([1, 2, 3, 4, 5])
  const [inicio, setInicio] = useState('08:00')
  const [fim, setFim] = useState('18:00')
  const [semanas, setSemanas] = useState(1)
  const [grade, setGrade] = useState<GradeHorarios>({})
  const [editando, setEditando] = useState<{ hora: string, dia: number } | null>(null)

  function toggleDia(dia: number) {
    setDiasSelecionados(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    )
  }

  function gerarGradeBase() {
    const novaGrade: GradeHorarios = {}
    const iniMin = horaParaMinutos(inicio)
    const fimMin = horaParaMinutos(fim)

    for (let min = iniMin; min < fimMin; min += 60) {
      const horaStr = minutosParaHora(min)
      novaGrade[horaStr] = {}
      diasDaSemana.forEach(({ value }) => {
        novaGrade[horaStr][value] = {
          ativo: diasSelecionados.includes(value),
          duracao: 60
        }
      })
    }

    setGrade(novaGrade)
  }

  function haConflito(hora: string, dia: number, novaDuracao: number): boolean {
    const horaMin = horaParaMinutos(hora)
    const novaFim = horaMin + novaDuracao

    return Object.entries(grade).some(([outraHora, colDias]) => {
      if (outraHora === hora) return false
      const item = colDias[dia]
      if (!item?.ativo) return false

      const outraIni = horaParaMinutos(outraHora)
      const outraFim = outraIni + item.duracao

      return (horaMin < outraFim && novaFim > outraIni)
    })
  }

  function toggleCelula(hora: string, dia: number) {
    if (!grade[hora]?.[dia]?.ativo && haConflito(hora, dia, 60)) {
      alert('Conflito com outro horário ativo.')
      return
    }

    setGrade(prev => ({
      ...prev,
      [hora]: {
        ...prev[hora],
        [dia]: prev[hora][dia]?.ativo
          ? { ativo: false, duracao: 60 }
          : { ativo: true, duracao: 60 }
      }
    }))
  }

  function editarDuracao(hora: string, dia: number, duracao: number) {
    if (haConflito(hora, dia, duracao)) {
      alert('Conflito com outro horário ativo.')
      return
    }

    setGrade(prev => ({
      ...prev,
      [hora]: {
        ...prev[hora],
        [dia]: {
          ...prev[hora][dia],
          duracao
        }
      }
    }))
    setEditando(null)
  }

  function replicarSemanas() {
    const hoje = startOfDay(new Date())
    const replicados: { data: string, hora: string, duracao: number }[] = []

    for (let s = 0; s < semanas; s++) {
      Object.entries(grade).forEach(([hora, dias]) => {
        Object.entries(dias).forEach(([diaStr, config]) => {
          const dia = Number(diaStr)
          if (config.ativo) {
            const base = addDays(hoje, s * 7 + (dia - hoje.getDay() + 7) % 7)
            const [h, m] = hora.split(':').map(Number)
            const completo = setMinutes(setHours(base, h), m)
            replicados.push({
              data: format(completo, 'yyyy-MM-dd'),
              hora: format(completo, 'HH:mm'),
              duracao: config.duracao
            })
          }
        })
      })
    }

    console.log('Horários finais:', replicados)
    alert(`${replicados.length} horários replicados para ${semanas} semana(s).`)
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Gerador de Horários</h2>

      <div className="flex flex-wrap gap-2">
        {diasDaSemana.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => toggleDia(value)}
            className={`px-3 py-1 rounded-full border ${
              diasSelecionados.includes(value) ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label>
          Início:
          <input type="time" value={inicio} onChange={e => setInicio(e.target.value)} className="w-full" />
        </label>
        <label>
          Fim:
          <input type="time" value={fim} onChange={e => setFim(e.target.value)} className="w-full" />
        </label>
        <label>
          Semanas para replicar:
          <input type="number" value={semanas} onChange={e => setSemanas(+e.target.value)} className="w-full" />
        </label>
      </div>

      <div className="flex gap-4">
        <button onClick={gerarGradeBase} className="px-4 py-2 bg-green-600 text-white rounded shadow">
          Gerar Grade Base
        </button>
        <button onClick={replicarSemanas} className="px-4 py-2 bg-indigo-600 text-white rounded shadow">
          Replicar para {semanas} semana(s)
        </button>
      </div>

      {Object.keys(grade).length > 0 && (
        <div className="overflow-auto mt-6">
          <table className="min-w-full border text-center">
            <thead>
              <tr>
                <th className="border p-1">Horário</th>
                {diasDaSemana.map(({ label, value }) => (
                  <th key={value} className="border px-2 py-1">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grade).map(([hora, dias]) => (
                <tr key={hora}>
                  <td className="border px-2 py-1 font-semibold">{hora}</td>
                  {diasDaSemana.map(({ value }) => (
                    <td key={value} className="border px-2 py-1">
                      {dias[value]?.ativo ? (
                        editando?.hora === hora && editando.dia === value ? (
                          <select
                            value={dias[value].duracao}
                            onChange={e => editarDuracao(hora, value, +e.target.value)}
                            className="text-sm"
                          >
                            {DURACOES.map(d => <option key={d} value={d}>{d} min</option>)}
                          </select>
                        ) : (
                          <div className="flex flex-col items-center">
                            <button
                              onClick={() => setEditando({ hora, dia: value })}
                              className="bg-blue-100 text-blue-800 px-2 rounded-full text-sm hover:bg-blue-200"
                            >
                              {dias[value].duracao} min ✎
                            </button>
                            <button
                              onClick={() => toggleCelula(hora, value)}
                              className="text-red-600 text-xs hover:text-red-800"
                            >
                              ✕
                            </button>
                          </div>
                        )
                      ) : (
                        <button
                          onClick={() => toggleCelula(hora, value)}
                          className="text-gray-300 text-sm hover:text-green-500"
                        >
                          +
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
