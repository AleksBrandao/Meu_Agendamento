import { useEffect, useState } from "react";
import axios from "axios";

interface ResumoDia {
  data: string;
  total: number;
  usuarios: number;
  servicos: Record<string, number>;
}

export default function PainelResumoAgendamentos() {
  const [resumo, setResumo] = useState<ResumoDia[]>([]);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:8000/api/resumo-agendamentos/", {
      headers: { Authorization: `Token ${token}` },
    })
    .then((res) => setResumo(res.data))
    .catch(() => setMensagem("Erro ao carregar o resumo de agendamentos."));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">
      <h1 className="text-2xl font-bold mb-4">Resumo de Agendamentos</h1>

      {mensagem && <p className="text-red-600 mb-4">{mensagem}</p>}

      {resumo.length > 0 ? (
        <div className="space-y-4">
          {resumo.map((r) => (
            <div key={r.data} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold mb-2">{r.data}</h2>
              <p><strong>Total:</strong> {r.total}</p>
              <p><strong>Usuários distintos:</strong> {r.usuarios}</p>
              <p className="mt-2 font-medium">Serviços:</p>
              <p><strong>Faturamento estimado:</strong> R$ {r.faturamento.toFixed(2)}</p>

              <ul className="list-disc list-inside">
                {Object.entries(r.servicos).map(([nome, qtd]) => (
                  <li key={nome}>{nome} — {qtd}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>Nenhum dado encontrado.</p>
      )}
    </div>
  );
}
