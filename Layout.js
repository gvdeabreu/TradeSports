// components/Layout.js
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';
import styled from 'styled-components';


const Container = styled.div`
  display: flex;
  height: flex;
`;

const Main = styled.div`
  flex: 1;
  background-color: #0c1c2c;
  color: white;
  padding: 20px;
`;

export default function Layout({ children }) {
  return (
    <>
      <Topbar />
      <Container>
        <Sidebar />
        <Main>{children}</Main>
      </Container>
    </>
  );
}
