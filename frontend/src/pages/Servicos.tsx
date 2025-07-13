import { useEffect, useState } from 'react';
import api from '../api';

type Servico = {
  id: number;
  nome: string;
  preco: string;
  duracao_minutos: number;
};

export default function Servicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [erro, setErro] = useState('');

  useEffect(() => {
    api.get('/api/servicos/')
      .then(response => setServicos(response.data))
      .catch(error => {
        console.error(error);
        setErro('Erro ao carregar os serviços.');
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Serviços Disponíveis</h1>

      {erro && <p className="text-red-500 mb-4 text-center">{erro}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {servicos.map((servico) => (
          <div key={servico.id} className="bg-gray-800 rounded-lg p-6 shadow-md hover:scale-105 transition-transform">
            <h2 className="text-xl font-semibold mb-2">{servico.nome}</h2>
            <p className="text-gray-300 mb-1">💰 R$ {parseFloat(servico.preco).toFixed(2)}</p>
            <p className="text-gray-400">⏱️ {servico.duracao_minutos} min</p>
          </div>
        ))}
      </div>
    </div>
  );
}
