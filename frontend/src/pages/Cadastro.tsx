import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Cadastro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const navigate = useNavigate();

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/auth/users/', {
        username: email,
        email: email,
        password: senha,
      });
  
      alert('Cadastro realizado com sucesso!');
      setErro('');
      navigate('/login');
    } catch (err: any) {
      if (err.response && err.response.data) {
        console.error('Erro de cadastro:', err.response.data);
        const mensagem = Object.values(err.response.data)
          .flat()
          .join(' | ');
        setErro(mensagem);
      } else {
        setErro('Erro inesperado ao cadastrar.');
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleCadastro}
        className="bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Cadastro</h2>
        {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
        <input
          type="email"
          placeholder="E-mail"
          className="w-full p-3 rounded mb-4 bg-gray-800 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full p-3 rounded mb-4 bg-gray-800 text-white"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-white text-black py-2 rounded hover:bg-gray-200 transition"
        >
          Cadastrar
        </button>
      </form>
    </div>
  );
}
