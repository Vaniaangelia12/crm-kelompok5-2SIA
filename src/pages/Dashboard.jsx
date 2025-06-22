import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  Users, ShoppingCart, Package, MessageSquare, 
  DollarSign, TrendingUp, Activity, AlertCircle
} from 'lucide-react';
import { TransaksiDummy } from '../data/TransaksiDummy';
import { UserDummy } from '../data/UserDummy';
import { ProductDummy } from '../data/ProductDummy';
import { UmpanBalikDummy } from '../data/UmpanBalikDummy';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  // Data dan logika perhitungan tetap sama
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  const monthlyIncome = Array(12).fill(0);
  const monthlyUserSet = Array(12).fill(null).map(() => new Set());
  let totalOverallIncome = 0;

  TransaksiDummy.forEach((trx) => {
    const date = new Date(trx.tanggalPembelian);
    const month = date.getMonth();

    const totalHarga = trx.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    monthlyIncome[month] += totalHarga;
    monthlyUserSet[month].add(trx.userId);
    totalOverallIncome += totalHarga;
  });

  const monthlyIncomeInThousands = monthlyIncome.map(income => income / 1000);
  const monthlyCustomerCounts = monthlyUserSet.map((userSet) => userSet.size);

  const totalCustomers = UserDummy.filter(user => user.role === "user").length;
  const totalActiveProducts = ProductDummy.filter(product => product.active).length;
  const totalFeedback = UmpanBalikDummy.length;
  const pendingOrders = TransaksiDummy.filter(trx => trx.status === 'pending').length;

  // Warna tema
  const primaryColor = '#E81F25'; // Merah Fresh Mart
  const secondaryColor = '#3F9540'; // Hijau Fresh Mart
  const lightRed = '#FFEBEE';
  const lightGreen = '#E8F5E9';

  // Statistik utama dengan ikon
  const stats = [
    { 
      label: "Total Pelanggan", 
      value: totalCustomers.toLocaleString('id-ID'), 
      icon: <Users className="text-white" size={24} />,
      bgColor: secondaryColor,
      trend: '10% ▲' 
    },
    { 
      label: "Total Pendapatan", 
      value: `Rp${(totalOverallIncome).toLocaleString('id-ID')}`, 
      icon: <DollarSign className="text-white" size={24} />,
      bgColor: primaryColor,
      trend: '15% ▲' 
    },
    { 
      label: "Produk Aktif", 
      value: totalActiveProducts.toLocaleString('id-ID'), 
      icon: <Package className="text-white" size={24} />,
      bgColor: secondaryColor,
      trend: '5% ▲' 
    },
    { 
      label: "Pesanan Pending", 
      value: pendingOrders.toLocaleString('id-ID'), 
      icon: <AlertCircle className="text-white" size={24} />,
      bgColor: primaryColor,
      trend: '2% ▼' 
    },
  ];

  // Data untuk grafik batang (pendapatan)
  const barData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Pendapatan (ribu Rp)",
        data: monthlyIncomeInThousands,
        backgroundColor: primaryColor,
        borderRadius: 6,
        hoverBackgroundColor: '#C2181B'
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: { 
        display: true, 
        text: 'Pendapatan Bulanan',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + 'k';
          }
        }
      }
    }
  };

  // Data untuk grafik garis (pelanggan)
  const lineData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Pelanggan Unik",
        data: monthlyCustomerCounts,
        borderColor: secondaryColor,
        backgroundColor: 'rgba(63, 149, 64, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: secondaryColor,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: { 
        display: true, 
        text: 'Pertumbuhan Pelanggan',
        font: {
          size: 16
        }
      },
    }
  };

  // Data untuk grafik pie (kategori produk)
  const productCategories = ProductDummy.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(productCategories),
    datasets: [
      {
        data: Object.values(productCategories),
        backgroundColor: [
          primaryColor,
          secondaryColor,
          '#FFC107',
          '#2196F3',
          '#9C27B0'
        ],
        borderWidth: 0,
        hoverOffset: 10
      },
    ],
  };

  return (
    <div className="p-6 min-h-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Admin Fresh Mart</h1>
      
      {/* Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div 
              className="h-2 w-full"
              style={{ backgroundColor: stat.bgColor }}
            ></div>
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <h2 className="text-2xl font-bold mt-1">{stat.value}</h2>
                  <p className={`text-xs mt-1 ${
                    stat.trend.includes('▲') ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.trend} dari bulan lalu
                  </p>
                </div>
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Baris Pertama: Pendapatan dan Pelanggan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Grafik Pendapatan */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-gray-700 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Pendapatan Bulanan</h2>
          </div>
          <div className="h-80">
            <Bar options={barOptions} data={barData} />
          </div>
        </div>

        {/* Grafik Pelanggan */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center mb-4">
            <Activity className="text-gray-700 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Pertumbuhan Pelanggan</h2>
          </div>
          <div className="h-80">
            <Line options={lineOptions} data={lineData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;