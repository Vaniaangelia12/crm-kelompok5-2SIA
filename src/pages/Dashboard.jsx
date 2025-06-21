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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { TransaksiDummy } from '../data/TransaksiDummy';
import { UserDummy } from '../data/UserDummy';
import { UmpanBalikDummy } from '../data/UmpanBalikDummy';
import { ProductDummy } from '../data/ProductDummy';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
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

  const stats = [
    { label: "Total Pelanggan", value: totalCustomers.toLocaleString('id-ID'), color: "#3F9540" },
    { label: "Total Pendapatan", value: `Rp${(totalOverallIncome).toLocaleString('id-ID')}`, color: "#E81F25" },
    { label: "Total Produk Aktif", value: totalActiveProducts.toLocaleString('id-ID'), color: "#3F9540" },
    { label: "Total Umpan Balik", value: totalFeedback.toLocaleString('id-ID'), color: "#E81F25" },
  ];

  const barData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Pendapatan (ribu Rp)",
        data: monthlyIncomeInThousands,
        backgroundColor: "#E81F25", // Warna utama Fresh Mart
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Pendapatan Bulanan dari Transaksi' },
    },
  };

  const lineData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Jumlah Pelanggan Unik",
        data: monthlyCustomerCounts,
        borderColor: "#3F9540", // Warna hijau Fresh Mart
        backgroundColor: "rgba(63, 149, 64, 0.3)",
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Pertumbuhan Pelanggan Unik per Bulan' },
    },
  };

  return (
    <div className="space-y-8">
      {/* Statistik utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <h2 className="text-2xl font-bold" style={{ color }}>
              {value}
            </h2>
          </div>
        ))}
      </div>

      {/* Grafik Pendapatan Bulanan */}
      <div className="bg-white rounded-xl shadow p-6">
        <Bar options={barOptions} data={barData} />
      </div>

      {/* Grafik Pertumbuhan Pelanggan */}
      <div className="bg-white rounded-xl shadow p-6">
        <Line options={lineOptions} data={lineData} />
      </div>
    </div>
  );
};

export default Dashboard;