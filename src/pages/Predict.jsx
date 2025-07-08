import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const membershipTypes = ["Aktif", "Baru", "Loyal", "Pasif"];
const chartColors = {
  Aktif: 'rgba(75, 192, 192, 0.7)',
  Baru: 'rgba(54, 162, 235, 0.7)',
  Loyal: 'rgba(153, 102, 255, 0.7)',
  Pasif: 'rgba(255, 99, 132, 0.7)',
};
const borderColors = {
  Aktif: 'rgba(75, 192, 192, 1)',
  Baru: 'rgba(54, 162, 235, 1)',
  Loyal: 'rgba(153, 102, 255, 1)',
  Pasif: 'rgba(255, 99, 132, 1)',
};
const modelAccuracy = 97; // Akurasi model Anda

export default function MembershipPredictionForm() {
  const [form, setForm] = useState({
    Nama_User: "",
    Tanggal: "", // Tanggal transaksi baru (YYYY-MM-DD)
    Total_Harga: "", // Total harga transaksi baru
    // Fitur-fitur kumulatif yang diharapkan oleh model dan API Anda
    Jumlah_Transaksi_Kumulatif: "",
    Total_Belanja_Kumulatif: "",
    Rata2_Belanja_Kumulatif: "",
    Hari_Sejak_Transaksi_Terakhir_Sebelumnya: "",
    Hari_Sejak_Transaksi_Pertama: ""
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ngrokBaseUrl, setNgrokBaseUrl] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    // Pastikan ini adalah BASE URL Ngrok Anda, TANPA ENDPOINT /predict_membership
    const fixedNgrokBaseUrl = "https://303438a2ec97.ngrok-free.app";
    setNgrokBaseUrl(fixedNgrokBaseUrl);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUseSample = () => {
    setForm({
      Nama_User: "Agus Salim",
      Tanggal: "2025-01-31",
      Total_Harga: "1714916",
      Jumlah_Transaksi_Kumulatif: "7",
      Total_Belanja_Kumulatif: "9757239",
      Rata2_Belanja_Kumulatif: "1393891.29",
      Hari_Sejak_Transaksi_Terakhir_Sebelumnya: "3",
      Hari_Sejak_Transaksi_Pertama: "22"
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!ngrokBaseUrl) {
      setError("Ngrok Base URL is not set.");
      setLoading(false);
      return;
    }

    try {
      // Payload sekarang berisi SEMUA fitur, termasuk yang kumulatif
      const payload = {
        Nama_User: form.Nama_User,
        Tanggal: form.Tanggal, // Backend akan mengabaikan ini sebagai fitur, tapi mungkin butuh untuk validasi
        Total_Harga: parseFloat(form.Total_Harga), // Backend akan mengabaikan ini sebagai fitur
        Jumlah_Transaksi_Kumulatif: parseInt(form.Jumlah_Transaksi_Kumulatif),
        Total_Belanja_Kumulatif: parseFloat(form.Total_Belanja_Kumulatif),
        Rata2_Belanja_Kumulatif: parseFloat(form.Rata2_Belanja_Kumulatif),
        Hari_Sejak_Transaksi_Terakhir_Sebelumnya: parseInt(form.Hari_Sejak_Transaksi_Terakhir_Sebelumnya),
        Hari_Sejak_Transaksi_Pertama: parseInt(form.Hari_Sejak_Transaksi_Pertama),
      };

      const apiUrl = `${ngrokBaseUrl}/predict_membership`;
      console.log("Payload dikirim ke API:", payload);
      const res = await axios.post(apiUrl, payload);
      setResult(res.data);
    } catch (err) {
      console.error("Prediction error:", err);
      if (err.response) {
        setError(`Error from API: ${err.response.data.error || err.response.statusText}`);
      } else if (err.request) {
        setError("No response from API. Is the Ngrok tunnel active and accessible?");
      } else {
        setError(`Request error: ${err.message}`);
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const predictionChartData = {
    labels: membershipTypes,
    datasets: [
      {
        label: "Confidence (%)",
        data: membershipTypes.map(type => result?.success && result.probabilities ? result.probabilities[type] || 0 : 0),
        backgroundColor: membershipTypes.map(type => chartColors[type] || 'gray'),
        borderColor: membershipTypes.map(type => borderColors[type] || 'gray'),
        borderWidth: 1,
      },
    ],
  };

  const accuracyChartData = {
    labels: ['Model Accuracy'],
    datasets: [
      {
        label: 'Accuracy (%)',
        data: [modelAccuracy],
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Prediksi Tipe Membership' },
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Persentase Kepercayaan' } },
    },
  };

  const accuracyChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Akurasi Model' },
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Akurasi (%)' } },
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <div className="bg-green-50 border border-green-300 shadow-lg rounded-lg">
        <div className="p-6 space-y-4">
          <h2 className="text-2xl font-bold text-green-800 text-center mb-6">Prediksi Tipe Membership Pelanggan</h2>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="Nama_User" className="block text-sm font-medium text-gray-700 mb-1">Nama User</label>
                <input
                  type="text"
                  id="Nama_User"
                  name="Nama_User"
                  value={form.Nama_User}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="Tanggal" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Transaksi (YYYY-MM-DD)</label>
                <input
                  type="date"
                  id="Tanggal"
                  name="Tanggal"
                  value={form.Tanggal}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="Total_Harga" className="block text-sm font-medium text-gray-700 mb-1">Total Harga Transaksi (Rp)</label>
                <input
                  type="number"
                  id="Total_Harga"
                  name="Total_Harga"
                  value={form.Total_Harga}
                  onChange={handleChange}
                  required
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              {/* Fitur kumulatif yang sekarang ditampilkan kembali dan harus diisi manual */}
              <div>
                <label htmlFor="Jumlah_Transaksi_Kumulatif" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Transaksi Kumulatif</label>
                <input
                  type="number"
                  id="Jumlah_Transaksi_Kumulatif"
                  name="Jumlah_Transaksi_Kumulatif"
                  value={form.Jumlah_Transaksi_Kumulatif}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="Total_Belanja_Kumulatif" className="block text-sm font-medium text-gray-700 mb-1">Total Belanja Kumulatif (Rp)</label>
                <input
                  type="number"
                  id="Total_Belanja_Kumulatif"
                  name="Total_Belanja_Kumulatif"
                  value={form.Total_Belanja_Kumulatif}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="Rata2_Belanja_Kumulatif" className="block text-sm font-medium text-gray-700 mb-1">Rata-rata Belanja Kumulatif (Rp)</label>
                <input
                  type="number"
                  id="Rata2_Belanja_Kumulatif"
                  name="Rata2_Belanja_Kumulatif"
                  value={form.Rata2_Belanja_Kumulatif}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="Hari_Sejak_Transaksi_Terakhir_Sebelumnya" className="block text-sm font-medium text-gray-700 mb-1">Hari Sejak Transaksi Terakhir Sebelumnya</label>
                <input
                  type="number"
                  id="Hari_Sejak_Transaksi_Terakhir_Sebelumnya"
                  name="Hari_Sejak_Transaksi_Terakhir_Sebelumnya"
                  value={form.Hari_Sejak_Transaksi_Terakhir_Sebelumnya}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="Hari_Sejak_Transaksi_Pertama" className="block text-sm font-medium text-gray-700 mb-1">Hari Sejak Transaksi Pertama</label>
                <input
                  type="number"
                  id="Hari_Sejak_Transaksi_Pertama"
                  name="Hari_Sejak_Transaksi_Pertama"
                  value={form.Hari_Sejak_Transaksi_Pertama}
                  onChange={handleChange}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>

            {/* Tombol Gunakan Sample */}
            <button
              type="button"
              onClick={handleUseSample}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
            >
              Gunakan Sample Otomatis
            </button>

            <button
              type="submit"
              disabled={loading || !ngrokBaseUrl || error}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md"
            >
              {loading ? "Memproses..." : "Prediksi Membership"}
            </button>
          </form>

          {result?.success && (
            <div className="mt-6 space-y-6">
              <div className="p-4 border border-gray-200 rounded-md bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Hasil Prediksi</h3>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start">
                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                      <p className="text-green-800 font-semibold text-xl">Tipe Membership: <span className="font-bold">{result.predicted_label}</span></p>
                      <p className="text-sm text-gray-600">Tingkat Kepercayaan: {result.confidence}%</p>
                    </div>
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
                      <div className="relative w-full h-full rounded-full flex items-center justify-center text-green-800 font-bold text-lg"
                           style={{
                             background: `conic-gradient(${chartColors[result.predicted_label]} ${result.confidence}%, #e0e0e0 ${result.confidence}%)`,
                             boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                           }}>
                        {result.confidence}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-64">
                    <Bar data={predictionChartData} options={chartOptions} />
                  </div>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-md bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-green-800 mb-3">Akurasi Model</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="h-48">
                    <Bar data={accuracyChartData} options={accuracyChartOptions} />
                  </div>
                  <div>
                    <p className="text-gray-700 mb-2">Model ini memiliki akurasi sebesar <span className="font-bold">{modelAccuracy}%</span> dalam memprediksi tipe membership.</p>
                    <p className="text-sm text-gray-500">Akurasi dihitung berdasarkan pengujian terhadap dataset riwayat pembelian sebelumnya.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}