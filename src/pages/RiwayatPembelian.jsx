import React, { useState } from "react";
import transaksiDummy from "../data/transaksiPembelian";

// Fungsi status pengguna
const getStatusUser = (transaksi) => {
  if (!transaksi || transaksi.length === 0) return "Baru";
  const now = new Date();
  const recent30Days = transaksi.filter((t) => {
    const tgl = new Date(t.tanggal);
    const selisih = (now - tgl) / (1000 * 3600 * 24);
    return selisih <= 30;
  });
  if (recent30Days.length > 3) return "Loyal";
  if (recent30Days.length >= 1) return "Aktif";

  const recent90Days = transaksi.filter((t) => {
    const tgl = new Date(t.tanggal);
    const selisih = (now - tgl) / (1000 * 3600 * 24);
    return selisih <= 90;
  });
  return recent90Days.length === 0 ? "Baru" : "Pasif";
};

// Simulasi user login
const userLogin = {
  nama: "Andi Pratama",
  email: "andi@gmail.com",
};

const itemsPerPage = 10;

const RiwayatPembelianTabel = () => {
  const transaksiUser = transaksiDummy.filter(
    (item) => item.email === userLogin.email
  );

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(transaksiUser.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = transaksiUser.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="min-h-screen  p-8 flex justify-center items-start">
      <div className="w-[90%] max-w-7xl bg-white shadow-lg rounded-xl p-8">
        {/* Judul & Ilustrasi & Status */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#3F9540]">Riwayat Pembelian</h1>
          <p className="text-base text-gray-600 mt-1">
            Lihat histori transaksi Anda sebelumnya
          </p>

          <div className="flex justify-center my-4">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3523/3523887.png"
              alt="Ilustrasi Riwayat"
              className="w-20 h-20"
            />
          </div>

          <p className="text-md text-gray-700">
            Status Pengguna:{" "}
            <span className="font-semibold text-[#3F9540]">
              {getStatusUser(transaksiUser)}
            </span>
          </p>
          <p className="text-md text-gray-700 mt-1 ">
            Riwayat milik: <span className="font-semibold text-[#E81F25]">{userLogin.nama}</span>
          </p>
        </div>

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left text-gray-700 bg-white rounded-md overflow-hidden">
            <thead className="bg-[#3F9540] text-white font-semibold">
              <tr>
                <th className="py-3 px-4 border-2 border-[#3F9540]">#</th>
                <th className="py-3 px-4 border-2 border-[#3F9540]">Tanggal</th>
                <th className="py-3 px-4 border-2 border-[#3F9540]">Deskripsi</th>
                <th className="py-3 px-4 border-2 border-[#3F9540]">Total</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id} className="hover:bg-[#eef7ef] transition">
                  <td className="py-2 px-4 border-2 border-[#3F9540]">{startIndex + index + 1}</td>
                  <td className="py-2 px-4 border-2 border-[#3F9540]">{item.tanggal}</td>
                  <td className="py-2 px-4 border-2 border-[#3F9540]">{item.deskripsi}</td>
                  <td className="py-2 px-4 border-2 border-[#3F9540]">{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Navigasi Tombol */}
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#3F9540] text-white hover:bg-[#347b36]"
            }`}
          >
            Sebelumnya
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#3F9540] text-white hover:bg-[#347b36]"
            }`}
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiwayatPembelianTabel;