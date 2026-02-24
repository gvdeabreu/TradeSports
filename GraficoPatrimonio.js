// components/GraficoPatrimonio.js
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export default function GraficoPatrimonio({ historico }) {
  if (!historico || historico.length === 0) return null;

  const datas = historico.map(item =>
    new Date(item.data).toLocaleDateString('pt-BR')
  );

  const valores = historico.map(item =>
    (item.quantidade * item.preco).toFixed(2)
  );

  const data = {
    labels: datas,
    datasets: [
      {
        label: 'Valor das Ordens Executadas',
        data: valores,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          callback: (valor) => `R$ ${valor}`,
          color: '#fff'
        },
        grid: {
          color: '#334155'
        }
      },
      x: {
        ticks: {
          color: '#94a3b8'
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `R$ ${context.raw}`
        }
      }
    }
  };

  return <Line data={data} options={options} />;
}
