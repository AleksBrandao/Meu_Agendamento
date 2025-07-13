import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
const apiUrl = import.meta.env.VITE_API_URL;

export default function PainelAdminAgendamentos() {
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(new Date());
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [diasComHorarios, setDiasComHorarios] = useState<number[]>([]);

  const token = localStorage.getItem("token");

  const isDiaPermitido = (date: Date) => {
    const dia = date.getDay();
    return diasComHorarios.includes(dia);
  };

  useEffect(() => {
    axios.get("http://localhost:8000/api/horarios-disponiveis/", {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => {
      const dias = [...new Set(res.data.map((h: any) => h.dia_semana))];
      setDiasComHorarios(dias);
    })
    .catch(() => setMensagem("Erro ao carregar dias com horários."));
  }, []);

  useEffect(() => {
    if (!dataSelecionada) return;

    const dataStr = format(dataSelecionada, "yyyy-MM-dd");

    axios.get(`http://localhost:8000/api/agendamentos/?data=${dataStr}`, {
      headers: { Authorization: `Token ${token}` },
    })
    .then((res) => {
      const agendamentosOrdenados = res.data.sort((a: any, b: any) => a.hora.localeCompare(b.hora));
      setAgendamentos(agendamentosOrdenados);
    })
    .catch(() => setMensagem("Erro ao carregar agendamentos."));
  }, [dataSelecionada]);

  return (
    <div className="min-h-screen bg-gray-100 text-black p-6">
      <h1 className="text-2xl font-bold mb-4">Painel de Agendamentos</h1>

      <div className="mb-4">
        <label className="block mb-2">Selecionar data:</label>
        <DatePicker
          selected={dataSelecionada}
          onChange={(date: Date) => setDataSelecionada(date)}
          dateFormat="dd/MM/yyyy"
          locale={ptBR}
          filterDate={isDiaPermitido}
          minDate={new Date()}
          className="p-2 border rounded w-full max-w-xs"
        />
      </div>

      {mensagem && <p className="text-red-600 mb-4">{mensagem}</p>}

      {agendamentos.length > 0 ? (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Horário</th>
              <th className="p-2">Usuário</th>
              <th className="p-2">Serviço</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.map((a, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{a.hora}</td>
                <td className="p-2">{a.usuario_nome || a.usuario}</td>
                <td className="p-2">{a.servico_nome || a.servico}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum agendamento para esta data.</p>
      )}
    </div>
  );
}
