import React, { useState, useEffect, useCallback } from 'react';
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
  DollarSign, TrendingUp, Activity, AlertCircle, Loader2
} from 'lucide-react';
import { supabase } from '../supabase'; // Import Supabase client

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
  // State untuk data yang diambil dari Supabase
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [feedbackCount, setFeedbackCount] = useState(0); // Hanya butuh hitungan
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Warna tema Fresh Mart
  const primaryColor = '#E81F25'; // Merah Fresh Mart
  const secondaryColor = '#3F9540'; // Hijau Fresh Mart
  // const lightRed = '#FFEBEE'; // Not directly used in charts, but for reference
  // const lightGreen = '#E8F5E9'; // Not directly used in charts, but for reference

  // Fungsi untuk mengambil semua data yang dibutuhkan dari Supabase
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transaksi')
        .select('id, id_pengguna, tanggal_pembelian, total_harga');

      if (transactionsError) throw transactionsError;

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('pengguna')
        .select('id, role, tanggal_bergabung');

      if (usersError) throw usersError;

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('produk')
        .select('id, nama, kategori, aktif');

      if (productsError) throw productsError;

      // Fetch feedback count
      const { count: feedbackRowsCount, error: feedbackError } = await supabase
        .from('umpan_balik')
        .select('*', { count: 'exact', head: true }); // 'head: true' makes it faster by not returning data

      if (feedbackError) throw feedbackError;

      setTransactions(transactionsData);
      setUsers(usersData);
      setProducts(productsData);
      setFeedbackCount(feedbackRowsCount);

    } catch (err) {
      console.error("Error fetching dashboard data:", err.message);
      setError("Gagal memuat data dashboard: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect untuk memanggil fungsi fetch data saat komponen dimuat
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Logika perhitungan data untuk grafik dan statistik
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const monthlyIncome = Array(12).fill(0);
  const monthlyUserSet = Array(12).fill(null).map(() => new Set());
  let totalOverallIncome = 0;

  transactions.forEach((trx) => {
    const date = new Date(trx.tanggal_pembelian);
    const month = date.getMonth();

    monthlyIncome[month] += trx.total_harga; // Menggunakan total_harga langsung
    monthlyUserSet[month].add(trx.id_pengguna); // Menggunakan id_pengguna
    totalOverallIncome += trx.total_harga;
  });

  const monthlyIncomeInThousands = monthlyIncome.map(income => income / 1000);
  const monthlyCustomerCounts = monthlyUserSet.map((userSet) => userSet.size);

  const totalCustomers = users.filter(user => user.role === "user").length;
  const totalActiveProducts = products.filter(product => product.aktif).length; // Menggunakan 'aktif'
  // const pendingOrders = TransaksiDummy.filter(trx => trx.status === 'pending').length; // Dihapus karena tidak ada kolom status

  // Statistik utama dengan ikon (diperbarui)
  const stats = [
    {
      label: "Total Pelanggan",
      value: totalCustomers.toLocaleString('id-ID'),
      icon: <Users className="text-white" size={24} />,
      bgColor: secondaryColor,
      trend: '10% ▲' // Placeholder, perlu data riil untuk tren
    },
    {
      label: "Total Pendapatan",
      value: `Rp${(totalOverallIncome).toLocaleString('id-ID')}`,
      icon: <DollarSign className="text-white" size={24} />,
      bgColor: primaryColor,
      trend: '15% ▲' // Placeholder
    },
    {
      label: "Produk Aktif",
      value: totalActiveProducts.toLocaleString('id-ID'),
      icon: <Package className="text-white" size={24} />,
      bgColor: secondaryColor,
      trend: '5% ▲' // Placeholder
    },
    {
      label: "Total Umpan Balik", // Mengganti 'Pesanan Pending'
      value: feedbackCount.toLocaleString('id-ID'),
      icon: <MessageSquare className="text-white" size={24} />, // Mengganti ikon
      bgColor: primaryColor, // Warna yang sesuai
      trend: 'X% ▲' // Placeholder
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
  const productCategories = products.reduce((acc, product) => {
    acc[product.kategori] = (acc[product.kategori] || 0) + 1; // Menggunakan 'kategori'
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
          '#FFC107', // Kuning
          '#2196F3', // Biru
          '#9C27B0', // Ungu
          '#FF5722', // Oranye
          '#795548', // Coklat
          '#00BCD4', // Cyan
          '#CDDC39', // Hijau Lemon
          '#607D8B'  // Biru keabu-abuan
        ].slice(0, Object.keys(productCategories).length), // Sesuaikan jumlah warna dengan jumlah kategori
        borderWidth: 0,
        hoverOffset: 10
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <Loader2 className="animate-spin h-10 w-10 text-[#E81F25] mx-auto mb-4" />
          <p className="text-gray-700">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center border border-red-400 bg-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error!</h2>
          <p className="text-red-700">{error}</p>
          <button onClick={() => fetchDashboardData()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Coba Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-full bg-gray-100"> {/* Tambahkan bg-gray-100 untuk latar belakang */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Admin Fresh Mart</h1>

      {/* Statistik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
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
        <div className="bg-white rounded-xl shadow-md p-6 transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-gray-700 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Pendapatan Bulanan</h2>
          </div>
          <div className="h-80 w-full flex justify-center items-center">
            <Bar options={barOptions} data={barData} />
          </div>
        </div>

        {/* Grafik Pelanggan */}
        <div className="bg-white rounded-xl shadow-md p-6 transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg">
          <div className="flex items-center mb-4">
            <Activity className="text-gray-700 mr-2" size={20} />
            <h2 className="text-lg font-semibold">Pertumbuhan Pelanggan</h2>
          </div>
          <div className="h-80 w-full flex justify-center items-center">
            <Line options={lineOptions} data={lineData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
