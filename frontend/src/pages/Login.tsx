import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const response = await api.post('/auth/token/login/', {
        username: email,
        password: senha,
      });
  
      const token = response.data.auth_token;
      localStorage.setItem('token', token);
  
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (err) {
      toast.error('Usuário ou senha inválidos.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={handleLogin} className="bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Entrar</h2>
        <input
          type="email"
          placeholder="E-mail"
          className="w-full p-3 rounded mb-4 bg-gray-800 text-white"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          className="w-full p-3 rounded mb-4 bg-gray-800 text-white"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-white text-black py-2 rounded hover:bg-gray-200 transition">
          Entrar
        </button>
      </form>
    </div>
  );
}
