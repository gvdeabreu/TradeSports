// components/ToastProvider.js
import { createContext, useContext, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const adicionarToast = (mensagem, tipo = 'info', duracao = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, mensagem, tipo }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duracao);
  };

  return (
    <ToastContext.Provider value={{ adicionarToast }}>
      {children}
      <Container>
        {toasts.map(toast => (
          <Toast key={toast.id} $tipo={toast.tipo}>
            {toast.mensagem}
          </Toast>
        ))}
      </Container>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// Styled
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(20%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Container = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Toast = styled.div`
  background-color: ${({ $tipo }) =>
    $tipo === 'erro' ? '#ef4444' : $tipo === 'sucesso' ? '#22c55e' : '#3b82f6'};
  color: white;
  padding: 0.8rem 1.2rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  animation: ${slideIn} 0.3s ease forwards;
`;
