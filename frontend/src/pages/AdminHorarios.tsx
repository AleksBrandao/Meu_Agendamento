import React, { useState } from "react";
import {
  addDays,
  addMinutes,
  format,
  isBefore,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";

const diasDaSemana = [
  { label: "Domingo", value: 0 },
  { label: "Segunda", value: 1 },
  { label: "Terça", value: 2 },
  { label: "Quarta", value: 3 },
  { label: "Quinta", value: 4 },
  { label: "Sexta", value: 5 },
  { label: "Sábado", value: 6 },
];

const DURACOES = [30, 45, 60, 90, 120];

function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function minutosParaHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

type GradeHorarios = {
  [hora: string]: {
    [dia: number]: {
      ativo: boolean;
      duracao: number;
    };
  };
};

export default function AdminHorarios() {
  const [diasSelecionados, setDiasSelecionados] = useState<number[]>([
    1, 2, 3, 4, 5,
  ]);
  const [inicio, setInicio] = useState("08:00");
  const [fim, setFim] = useState("18:00");
  const [duracaoPadrao, setDuracaoPadrao] = useState(60)
  const [semanas, setSemanas] = useState(1);
  const [almocoInicio, setAlmocoInicio] = useState("12:00");
  const [almocoFim, setAlmocoFim] = useState("13:00");
  const [usarAlmoco, setUsarAlmoco] = useState(false);
  const [usarIntervaloEntreHorarios, setUsarIntervaloEntreHorarios] =
    useState(false);
  const [intervaloEntreHorarios, setIntervaloEntreHorarios] = useState(30);
  const [grade, setGrade] = useState<GradeHorarios>({});
  const [editando, setEditando] = useState<{
    hora: string;
    dia: number;
  } | null>(null);

  const intervaloMinutos = 30; // visual de 30 em 30 sempre

  function toggleDia(dia: number) {
    setDiasSelecionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  }

  function gerarGradeBase() {
    const novaGrade: GradeHorarios = { ...grade }
    const iniMin = horaParaMinutos(inicio)
    const fimMin = horaParaMinutos(fim)
    const almocoIniMin = horaParaMinutos(almocoInicio)
    const almocoFimMin = horaParaMinutos(almocoFim)
    const duracao = duracaoPadrao // ← usa valor selecionado
  
    let atual = iniMin
    while (atual + duracao <= fimMin) {
      const estaNoAlmoco = usarAlmoco && (
        (atual >= almocoIniMin && atual < almocoFimMin) ||
        (atual + duracao > almocoIniMin && atual < almocoFimMin)
      )
  
      if (!estaNoAlmoco) {
        const horaStr = minutosParaHora(atual)
        if (!novaGrade[horaStr]) novaGrade[horaStr] = {}
  
        diasDaSemana.forEach(({ value }) => {
          if (
            diasSelecionados.includes(value) &&
            novaGrade[horaStr][value] === undefined
          ) {
            novaGrade[horaStr][value] = {
              ativo: true,
              duracao
            }
          }
        })
  
        atual += duracao
        if (usarIntervaloEntreHorarios) atual += intervaloEntreHorarios
      } else {
        atual += 30
      }
    }
  
    setGrade(novaGrade)
  }
  
  async function handleSalvarHorarios() {
    const horariosParaSalvar = []
    Object.entries(grade).forEach(([hora, dias]) => {
      Object.entries(dias).forEach(([dia, info]) => {
        if (info.ativo) {
          horariosParaSalvar.push({
            diaSemana: Number(dia),
            hora,
            duracao: info.duracao
          })
        }
      })
    })

    try {
      const res = await fetch('/api/salvar-horarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(horariosParaSalvar)
      })

      if (res.ok) alert('Horários salvos com sucesso!')
      else alert('Erro ao salvar. Verifique o backend.')
    } catch (err) {
      console.error(err)
      alert('Erro de conexão com o servidor.')
    }
  }

  
  

  function haConflito(hora: string, dia: number, novaDuracao: number): boolean {
    const horaMin = horaParaMinutos(hora);
    const novaFim = horaMin + novaDuracao;
    return Object.entries(grade).some(([outraHora, colDias]) => {
      if (outraHora === hora) return false;
      const item = colDias[dia];
      if (!item?.ativo) return false;
      const outraIni = horaParaMinutos(outraHora);
      const outraFim = outraIni + item.duracao;
      return horaMin < outraFim && novaFim > outraIni;
    });
  }

  function toggleCelula(hora: string, dia: number, criarSeInexistente = false) {
    setGrade(prev => {
      const novaGrade = { ...prev }
  
      // recria linha se necessário
      if (!novaGrade[hora]) {
        if (!criarSeInexistente) return prev;
        novaGrade[hora] = {};
      }
  
      // força cópia da linha para garantir reatividade
      const novaLinha = { ...novaGrade[hora] };
  
      // criar nova célula se clicado em '+'
      if (!novaLinha[dia]) {
        if (!criarSeInexistente) return prev;
  
        novaLinha[dia] = {
          ativo: true,
          duracao: 60
        };
  
        novaGrade[hora] = novaLinha;
        return { ...novaGrade };
      }
  
      // se ativa, excluir
      if (novaLinha[dia].ativo) {
        delete novaLinha[dia];
  
        // se linha vazia, remover também
        if (Object.keys(novaLinha).length === 0) {
          delete novaGrade[hora];
        } else {
          novaGrade[hora] = novaLinha;
        }
  
        return { ...novaGrade };
      }
  
      return prev;
    });
  }
  
  
  
  
  
  

  function editarDuracao(hora: string, dia: number, duracao: number) {
    if (haConflito(hora, dia, duracao)) {
      alert("Conflito com outro horário ativo.");
      return;
    }
    setGrade((prev) => ({
      ...prev,
      [hora]: {
        ...prev[hora],
        [dia]: {
          ...prev[hora][dia],
          duracao,
        },
      },
    }));
    setEditando(null);
  }

  function limparHorarios() {
    setGrade({});
  }

  const iniMin = horaParaMinutos(inicio);
  const fimMin = horaParaMinutos(fim);
  const horariosMinutos = [];
  for (let min = iniMin; min < fimMin; min += intervaloMinutos) {
    horariosMinutos.push(min);
  }
  const pulos: { [dia_hora: string]: boolean } = {};

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Gerador de Horários</h2>
      <div className="flex flex-wrap gap-2">
        {diasDaSemana.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => toggleDia(value)}
            className={`px-3 py-1 rounded-full border ${
              diasSelecionados.includes(value)
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <label>
          Início:
          <input
            type="time"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="w-full"
          />
        </label>
        <label>
          Fim:
          <input
            type="time"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
            className="w-full"
          />
        </label>
        <label>Duração padrão:
  <select value={duracaoPadrao} onChange={e => setDuracaoPadrao(+e.target.value)} className="w-full">
    {[30, 45, 60, 90, 120].map(d => (
      <option key={d} value={d}>{d} minutos</option>
    ))}
  </select>
</label>
        <label>
          Semanas para replicar:
          <input
            type="number"
            value={semanas}
            onChange={(e) => setSemanas(+e.target.value)}
            className="w-full"
          />
        </label>
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={usarAlmoco}
            onChange={(e) => setUsarAlmoco(e.target.checked)}
          />
          Considerar horário de almoço
        </label>
        {usarAlmoco && (
          <>
            <label>
              Início almoço:
              <input
                type="time"
                value={almocoInicio}
                onChange={(e) => setAlmocoInicio(e.target.value)}
                className="w-full"
              />
            </label>
            <label>
              Fim almoço:
              <input
                type="time"
                value={almocoFim}
                onChange={(e) => setAlmocoFim(e.target.value)}
                className="w-full"
              />
            </label>
          </>
        )}
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={usarIntervaloEntreHorarios}
            onChange={(e) => setUsarIntervaloEntreHorarios(e.target.checked)}
          />
          Incluir intervalo entre horários
        </label>
        {usarIntervaloEntreHorarios && (
          <label>
            Intervalo entre horários (min):
            <input
              type="number"
              value={intervaloEntreHorarios}
              onChange={(e) => setIntervaloEntreHorarios(+e.target.value)}
              className="w-full"
            />
          </label>
        )}
      </div>
      <div className="flex gap-4">
        <button
          onClick={gerarGradeBase}
          className="px-4 py-2 bg-green-600 text-white rounded shadow"
        >
          Gerar Grade Base
        </button>
        <button
          onClick={limparHorarios}
          className="px-4 py-2 bg-red-600 text-white rounded shadow"
        >
          Limpar Horários
        </button>
        
        <button
    onClick={handleSalvarHorarios}
    className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
  >
    Confirmar
  </button>

  
      </div>
      
      <div className="overflow-auto mt-6">
        <table className="min-w-full border text-center">
          <thead>
            <tr>
              <th className="border p-1">Horário</th>
              {diasDaSemana.map(({ label, value }) => (
                <th key={value} className="border px-2 py-1">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horariosMinutos.map((min) => {
              const hora = minutosParaHora(min);
              return (
                <tr key={hora}>
                  <td className="border font-semibold">{hora}</td>
                  {diasDaSemana.map(({ value: dia }) => {
                    const key = `${hora}_${dia}`;
                    if (pulos[key]) return null;

                    const almocoIniMin = horaParaMinutos(almocoInicio);
                    const almocoFimMin = horaParaMinutos(almocoFim); // <--- corrigido
                    const estaNoAlmoco =
                      usarAlmoco && min >= almocoIniMin && min < almocoFimMin;

                      const temHorarioAnterior = Object.entries(grade).some(([h, config]) => {
                        const hMin = horaParaMinutos(h);
                        const conf = config?.[dia];
                        return conf?.ativo && hMin + conf.duracao === min;
                      });
                      
                      const ehIntervalo =
                        usarIntervaloEntreHorarios &&
                        diasSelecionados.includes(dia) &&
                        !estaNoAlmoco &&
                        temHorarioAnterior &&
                        Object.values(grade[minutosParaHora(min)] ?? {}).every((c) => !c.ativo);
                      
                      

                    if (estaNoAlmoco && diasSelecionados.includes(dia)) {
                      return (
                        <td
                          key={dia}
                          className="border bg-gray-100 text-gray-400 text-xs"
                        >
                          Almoço
                        </td>
                      );
                    }

                    if (ehIntervalo) {
                      return (
                        <td
                          key={dia}
                          className="border bg-yellow-50 text-yellow-500 text-xs"
                        >
                          Intervalo
                        </td>
                      );
                    }

                    const info = grade[hora]?.[dia];
                    if (info?.ativo) {
                      const rowSpan = Math.ceil(
                        info.duracao / intervaloMinutos
                      );
                      for (let i = 1; i < rowSpan; i++) {
                        const pular = minutosParaHora(
                          min + i * intervaloMinutos
                        );
                        pulos[`${pular}_${dia}`] = true;
                      }

                      return (
                        <td
                          key={dia}
                          rowSpan={rowSpan}
                          className="border align-middle"
                        >
                          {editando?.hora === hora && editando.dia === dia ? (
                            <select
                              value={info.duracao}
                              onChange={(e) =>
                                editarDuracao(hora, dia, +e.target.value)
                              }
                              className="text-sm"
                            >
                              {DURACOES.map((d) => (
                                <option key={d} value={d}>
                                  {d} min
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <button
                                onClick={() => setEditando({ hora, dia })}
                                className="bg-blue-100 text-blue-800 px-2 rounded-full text-sm hover:bg-blue-200"
                              >
                                {info.duracao} min ✎
                              </button>
                              <button
                                onClick={() => toggleCelula(hora, dia, true)}
                                className="text-red-600 text-xs hover:text-red-800"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    } else {
                      return (
                        <td key={dia} className="border">
                          <button
                            onClick={() => toggleCelula(hora, dia, true)}
                            className="text-gray-300 text-sm hover:text-green-500"
                          >
                            +
                          </button>
                        </td>
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
