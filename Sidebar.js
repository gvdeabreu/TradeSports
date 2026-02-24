// components/Sidebar.js
import Link from 'next/link';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 250px;
  background-color: #101c30;
  padding: 20px;
  height: 1405px
`;

const Title = styled.h2`
  color: #00ff95;
  margin-bottom: 2rem;
`;

const NavItem = styled.div`
  margin: 10px 0;

  a {
    color: white;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      color: #00ff95;
    }
  }
`;

export default function Sidebar() {
  return (
    <SidebarContainer>
      <Title>Todos os Mercados</Title>
      <nav>
        <NavItem><Link href="/brasileirao-a">Brasileirão Série A</Link></NavItem>
        <NavItem><Link href="/brasileirao-b">Brasileirão Série B</Link></NavItem>
        <NavItem><Link href="/premierleague-a">Premier League</Link></NavItem>
        <NavItem><Link href="/laliga-a">La Liga</Link></NavItem>
        <NavItem><Link href="/bundesliga">Bundesliga</Link></NavItem>
        <NavItem><Link href="/ligue-1">Ligue 1</Link></NavItem>
        <NavItem><Link href="/eredivisie">Eredivisie</Link></NavItem>
      </nav>
    </SidebarContainer>
  );

  
}

