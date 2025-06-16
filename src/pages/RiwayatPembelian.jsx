import React, { useState } from "react";
import transaksiDummy from "../data/transaksiPembelian";
import { CalendarDays, CreditCard } from "lucide-react"; // pastikan kamu pakai lucide-react atau ganti sesuai library icon yang kamu gunakan

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

const userLogin = {
  nama: "Andi Pratama",
  email: "andi@gmail.com",
};

const itemsPerPage = 10;

const RiwayatPembelianTabel = () => {
  const transaksiUser = transaksiDummy.filter(
    (item) => item.email === userLogin.email || !item.email // untuk antisipasi jika data dummy tidak punya email
  );

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(transaksiUser.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = transaksiUser.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const statusUser = getStatusUser(transaksiUser);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Judul */}
      <div className="max-w-xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow-sm mb-2">
          Riwayat Pembelian
        </h1>
        <p className="text-lg text-gray-600">
          Lihat histori transaksi Anda sebelumnya dengan mudah dan cepat
        </p>
      </div>

      {/* Ilustrasi */}
      <div className="flex justify-center mb-12">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3523/3523887.png"
          alt="Ilustrasi Riwayat"
          className="w-40 h-40 filter brightness-90 saturate-90 drop-shadow-md"
        />
      </div>

      {/* Status Pengguna */}
      <div className="max-w-xl mx-auto mb-6 text-gray-700 text-md">
        <p>
          Status Pengguna:{" "}
          <span className="font-semibold text-[#3F9540]">{statusUser}</span>
        </p>
        <p className="mt-1">
          Riwayat milik:{" "}
          <span className="font-semibold text-[#E81F25]">
            {userLogin.nama}
          </span>
        </p>
      </div>

      {/* Daftar Transaksi */}
      <div className="max-w-xl mx-auto space-y-6">
        {currentData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-6 border-l-8 border-gray-400 hover:shadow-lg transition-shadow"
          >
            <div className="bg-gray-200 p-4 rounded-full flex items-center justify-center shadow-sm">
              <CalendarDays className="text-gray-600 w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">
                {item.deskripsi}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{item.tanggal}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
              <CreditCard className="w-6 h-6" />
              <span>{item.total}</span>
            </div>
          </div>
        ))}

        {/* Tabel */}
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left text-gray-700 bg-white rounded-md overflow-hidden">
            <thead className="bg-[#3F9540] text-white font-semibold">
              <tr>
                <th className="py-3 px-4 border-2 border-[#3F9540]">#</th>
                <th className="py-3 px-4 border-2 border-[#3F9540]">
                  Tanggal
                </th>
                <th className="py-3 px-4 border-2 border-[#3F9540]">
                  Deskripsi
                </th>
                <th className="py-3 px-4 border-2 border-[#3F9540]">Total</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => (
                <tr key={item.id} className="hover:bg-[#eef7ef] transition">
                  <td className="py-2 px-4 border-2 border-[#3F9540]">
                    {startIndex + index + 1}
                  </td>
                  <td className="py-2 px-4 border-2 border-[#3F9540]">
                    {item.tanggal}
                  </td>
                  <td className="py-2 px-4 border-2 border-[#3F9540]">
                    {item.deskripsi}
                  </td>
                  <td className="py-2 px-4 border-2 border-[#3F9540]">
                    {item.total}
                  </td>
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
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
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
