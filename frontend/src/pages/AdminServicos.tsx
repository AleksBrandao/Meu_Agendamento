import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";


type Servico = {
  id: number;
  nome: string;
  preco: string;
  duracao_minutos: number;
};

export default function AdminServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [duracao, setDuracao] = useState("");
  const [editando, setEditando] = useState<null | number>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    carregarServicos();
  }, []);
  
  function carregarServicos() {
    api
      .get("/api/servicos/")
      .then((res) => setServicos(res.data))
      .catch((err) => {
        console.error("Erro ao carregar serviços:", err);
        // opcional: setErro('Erro ao carregar serviços.')
      });
  }
  function limparFormulario() {
    setNome("");
    setPreco("");
    setDuracao("");
    setEditando(null);
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
  
    const dados = {
      nome,
      preco,
      duracao_minutos: Number(duracao),
    };
  
    try {
      if (editando) {
        await api.put(`/api/servicos/${editando}/`, dados);
        toast.success("Serviço atualizado com sucesso!");
      } else {
        await api.post("/api/servicos/", dados);
        toast.success("Serviço criado com sucesso!");
      }
  
      carregarServicos();
      limparFormulario();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
      toast.error("Erro ao salvar serviço.");
    }
  }

  async function handleExcluir(id: number) {
    if (!confirm("Deseja excluir este serviço?")) return;
  
    try {
      await api.delete(`/api/servicos/${id}/`);
      toast.success("Serviço excluído.");
      carregarServicos();
    } catch (error) {
      console.error("Erro ao excluir serviço:", error);
      toast.error("Erro ao excluir serviço.");
    }
  }

  function preencherEdicao(servico: Servico) {
    setNome(servico.nome);
    setPreco(servico.preco);
    setDuracao(String(servico.duracao_minutos));
    setEditando(servico.id);
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin: Serviços</h1>

      <form onSubmit={handleSalvar} className="max-w-md mx-auto mb-10">
        <input
          type="text"
          placeholder="Nome"
          className="w-full p-2 mb-2 bg-gray-800 rounded"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Preço"
          className="w-full p-2 mb-2 bg-gray-800 rounded"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Duração (min)"
          className="w-full p-2 mb-4 bg-gray-800 rounded"
          value={duracao}
          onChange={(e) => setDuracao(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-white text-black py-2 rounded"
        >
          {editando ? "Atualizar Serviço" : "Cadastrar Serviço"}
        </button>
      </form>

      <div className="grid gap-4 max-w-3xl mx-auto">
        {servicos.map((servico) => (
          <div
            key={servico.id}
            className="bg-gray-800 p-4 rounded flex justify-between items-center"
          >
            <div>
              <h2 className="font-bold">{servico.nome}</h2>
              <p className="text-gray-400">
                R$ {servico.preco} • {servico.duracao_minutos} min
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => preencherEdicao(servico)}
                className="text-blue-400"
              >
                Editar
              </button>
              <button
                onClick={() => handleExcluir(servico.id)}
                className="text-red-400"
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
