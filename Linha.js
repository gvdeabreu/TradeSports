// components/Linha.js
import styled from 'styled-components';

const Linha = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0.6rem;
  margin-bottom: 4px;
  border-radius: 4px;
  background-color: ${({ tipo }) => (tipo === 'compra' ? '#14532d' : '#7f1d1d')};
  color: white;
  font-size: 0.95rem;
`;

export default Linha;