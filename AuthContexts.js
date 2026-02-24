import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token');
    if (tokenSalvo) {
      setToken(tokenSalvo);
      axios.get('http://localhost:4001/usuario/atual', {
        headers: { Authorization: `Bearer ${tokenSalvo}` }
      })
      .then(response => {
    if (response.data) {
    setUsuario(response.data);
     } else {
    setUsuario(null);
    localStorage.removeItem('token');
     }
     })
      .catch(error => {
        console.error('[AuthContext] Erro ao buscar usuário atual:', error);
        localStorage.removeItem('token');
        setUsuario(null);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (usuarioData, tokenData) => {
    localStorage.setItem('token', tokenData);
    setToken(tokenData);
    setUsuario(usuarioData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, token, setToken, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};