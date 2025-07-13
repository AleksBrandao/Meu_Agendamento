import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";
import api from '../api';

export default function Agendar() {
  const [servicos, setServicos] = useState<any[]>([]);
  const [servicoId, setServicoId] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [horariosParaDia, setHorariosParaDia] = useState<string[]>([]);
  const [diasComHorarios, setDiasComHorarios] = useState<number[]>([]);
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const isDiaPermitido = (date: Date) => {
    const dia = date.getDay();
    return diasComHorarios.includes(dia);
  };

  useEffect(() => {
    // Requisição 1: carregar serviços
    api
      .get('/api/servicos/')
      .then((res) => setServicos(res.data))
      .catch(() => setMensagem('Erro ao carregar serviços.'));
  
    // Requisição 2: carregar dias com horários disponíveis
    api
      .get('/api/horarios-disponiveis/')
      .then((res) => {
        const dias = [...new Set(res.data.map((h: any) => h.dia_semana))];
        setDiasComHorarios(dias);
      })
      .catch(() =>
        setMensagem('Erro ao carregar dias com horários disponíveis.')
      );
  }, []);

  useEffect(() => {
    if (!data) return;
  
    const fetchHorariosParaData = async () => {
      try {
        const res = await api.get(`/api/horarios-disponiveis-por-data/?data=${data}`);
        setHorariosParaDia(res.data);
      } catch (err) {
        console.error(err);
        setHorariosParaDia([]);
      }
    };
  
    fetchHorariosParaData();
  }, [data]);

  async function handleAgendamento(e: React.FormEvent) {
    e.preventDefault();
    setMensagem("");
  
    try {
      await api.post("/api/agendamentos/", {
        servico: servicoId,
        data,
        hora,
      });
  
      setMensagem("✅ Agendamento realizado com sucesso!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao agendar:", error);
      setMensagem("❌ Não foi possível agendar. Verifique os dados.");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center">
      <form
        onSubmit={handleAgendamento}
        className="bg-gray-900 p-8 rounded-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Agendar Serviço</h2>

        {mensagem && <p className="text-sm mb-4 text-center">{mensagem}</p>}

        <select
          className="w-full p-3 rounded mb-4 bg-gray-800 text-white"
          value={servicoId}
          onChange={(e) => setServicoId(e.target.value)}
          required
        >
          <option value="">Selecione um serviço</option>
          {servicos.map((servico) => (
            <option key={servico.id} value={servico.id}>
              {servico.nome} - R$ {servico.preco}
            </option>
          ))}
        </select>

        <DatePicker
          selected={dataSelecionada}
          onChange={(date: Date) => {
            setDataSelecionada(date);
            const dataStr = date.toISOString().split("T")[0];
            setData(dataStr);
          }}
          filterDate={isDiaPermitido}
          minDate={new Date()} // ⬅️ Aqui bloqueia datas anteriores a hoje
          placeholderText="Selecione uma data"
          className="w-full p-3 rounded mb-4 bg-gray-800 text-white"
          locale={ptBR}
          dateFormat="dd/MM/yyyy"
        />

        {horariosParaDia.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {horariosParaDia.map((h) => (
              <button
                type="button"
                key={h}
                onClick={() => setHora(h)}
                className={`px-4 py-2 rounded ${
                  hora === h ? "bg-purple-600" : "bg-gray-700"
                } text-white`}
              >
                {h}
              </button>
            ))}
          </div>
        ) : (
          data && (
            <p className="text-sm mb-4">
              Nenhum horário disponível para este dia.
            </p>
          )
        )}

        {hora && (
          <p className="text-sm mb-4">
            Horário selecionado: <strong>{hora}</strong>
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-white text-black py-2 rounded hover:bg-gray-200 transition"
          disabled={!hora || !servicoId}
        >
          Confirmar Agendamento
        </button>
      </form>
    </div>
  );
}
