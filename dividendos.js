export default function Dividendos() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:4001/usuario/dividendos', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setDados(res.data))
    .catch(() => setDados([]));
  }, []);

  return (
    <Container>
      <h1>Meus Dividendos</h1>
      {dados.length === 0 ? (
        <p>Você ainda não recebeu dividendos.</p>
      ) : (
        <Tabela>
          <thead>
            <tr>
              <th>Data</th>
              <th>Clube</th>
              <th>Cotas</th>
              <th>Valor por cota</th>
              <th>Total recebido</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((d, i) => (
              <tr key={i}>
                <td>{new Date(d.data).toLocaleDateString()}</td>
                <td>{d.clubeId.nome}</td>
                <td>{d.quantidade}</td>
                <td>R$ {d.valorUnitario.toFixed(2)}</td>
                <td>R$ {d.totalPago.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Tabela>
      )}
    </Container>
  );
}
