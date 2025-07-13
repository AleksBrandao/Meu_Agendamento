// src/api.ts
import axios from 'axios';

// Cria instância do axios com baseURL do .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // para CSRF e cookies, se necessário
});

// Interceptador para adicionar token de autenticação (opcional)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // ou sessionStorage
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador para tratamento global de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `Erro na API [${error.response.status}]:`,
        error.response.data
      );
    } else if (error.request) {
      console.error('Nenhuma resposta recebida da API:', error.request);
    } else {
      console.error('Erro ao configurar a requisição:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
