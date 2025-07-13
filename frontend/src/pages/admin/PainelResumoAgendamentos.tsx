import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import ptBR from "date-fns/locale/pt-BR";
import { format, isWithinInterval, parseISO } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
const apiUrl = import.meta.env.VITE_API_URL;

interface DetalheServico {
  data: string;
  hora: string;
  usuario_nome: string;
  servico_nome: string;
  preco: string | number;
}

export default function PainelResumoAgendamentos() {
  const [detalhes, setDetalhes] = useState<DetalheServico[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [inicio, setInicio] = useState<Date | null>(null);
  const [fim, setFim] = useState<Date | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:8000/api/agendamentos/", {
      headers: { Authorization: `Token ${token}` },
    })
    .then((res) => setDetalhes(res.data))
    .catch(() => setMensagem("Erro ao carregar os detalhes dos agendamentos."));
  }, []);

  const detalhesFiltrados = detalhes
    .filter((d) => {
      if (!inicio || !fim) return true;
      const dataAg = new Date(d.data);
      return isWithinInterval(dataAg, { start: inicio, end: fim });
    })
    .sort((a, b) => {
      const dataA = parseISO(`${a.data}T${a.hora}`);
      const dataB = parseISO(`${b.data}T${b.hora}`);
      return dataA.getTime() - dataB.getTime();
    });

  const total = detalhesFiltrados.reduce((acc, d) => {
    const preco = typeof d.preco === 'number' ? d.preco : parseFloat(d.preco);
    return acc + (isNaN(preco) ? 0 : preco);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">
      <h1 className="text-2xl font-bold mb-4">Detalhes dos Agendamentos</h1>

      <div className="flex gap-4 items-end mb-6">
        <div>
          <label className="block mb-1">Data inicial:</label>
          <DatePicker
            selected={inicio}
            onChange={(date) => setInicio(date)}
            locale={ptBR}
            dateFormat="yyyy-MM-dd"
            className="border p-2 rounded"
            maxDate={fim || undefined}
          />
        </div>
        <div>
          <label className="block mb-1">Data final:</label>
          <DatePicker
            selected={fim}
            onChange={(date) => setFim(date)}
            locale={ptBR}
            dateFormat="yyyy-MM-dd"
            className="border p-2 rounded"
            minDate={inicio || undefined}
          />
        </div>
      </div>

      {mensagem && <p className="text-red-600 mb-4">{mensagem}</p>}

      {detalhesFiltrados.length > 0 ? (
        <div>
          <table className="w-full bg-white rounded shadow mb-4">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 text-left">Data</th>
                <th className="p-2 text-left">Hora</th>
                <th className="p-2 text-left">Usuário</th>
                <th className="p-2 text-left">Serviço</th>
                <th className="p-2 text-left">Valor</th>
              </tr>
            </thead>
            <tbody>
              {detalhesFiltrados.map((d, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{d.data}</td>
                  <td className="p-2">{d.hora}</td>
                  <td className="p-2">{d.usuario_nome}</td>
                  <td className="p-2">{d.servico_nome}</td>
                  <td className="p-2">
                    {typeof d.preco === 'number' ? `R$ ${d.preco.toFixed(2)}` : `R$ ${parseFloat(d.preco).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-right font-bold text-lg">
            Total: R$ {total.toFixed(2)}
          </div>
        </div>
      ) : (
        <p>Nenhum agendamento encontrado.</p>
      )}
    </div>
  );
}
