import styled from 'styled-components';

export default function OrdemDetalheModal({ ordem, onClose }) {
  if (!ordem) return null;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <Fechar onClick={onClose}>×</Fechar>
        <h2>Detalhes da Ordem</h2>

        <Linha><strong>Tipo:</strong> <Tipo tipo={ordem.tipo}>{ordem.tipo.toUpperCase()}</Tipo></Linha>
        <Linha><strong>Clube:</strong> {ordem.clubeNome}</Linha>
        <Linha><strong>Quantidade:</strong> {ordem.quantidade} cotas</Linha>
        <Linha><strong>Preço Unitário:</strong> R$ {ordem.preco.toFixed(2)}</Linha>
        <Linha><strong>Total:</strong> R$ {(ordem.quantidade * ordem.preco).toFixed(2)}</Linha>
        <Linha><strong>Data:</strong> {new Date(ordem.data).toLocaleString('pt-BR')}</Linha>
        {ordem.usuarioId && <Linha><strong>ID do Usuário:</strong> {ordem.usuarioId}</Linha>}
        {ordem.ordemId && <Linha><strong>ID da Ordem:</strong> {ordem.ordemId}</Linha>}
      </ModalContainer>
    </Overlay>
  );
}

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.6);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContainer = styled.div`
  background: #0f172a;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  color: white;
  position: relative;
  box-shadow: 0 0 20px rgba(0,0,0,0.3);
`;

const Fechar = styled.button`
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;

  &:hover {
    color: white;
  }
`;

const Linha = styled.p`
  margin: 0.5rem 0;

  strong {
    color: #38bdf8;
  }
`;

const Tipo = styled.span`
  color: ${({ tipo }) => (tipo === 'compra' ? '#22c55e' : '#ef4444')};
  font-weight: bold;
`;
