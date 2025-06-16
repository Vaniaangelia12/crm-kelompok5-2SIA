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
  const [voucherClaimed, setVoucherClaimed] = useState(false);
  const totalPages = Math.ceil(transaksiUser.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = transaksiUser.slice(startIndex, startIndex + itemsPerPage);

  const status = getStatusUser(transaksiUser);

  // Data voucher berdasarkan status
  const getVoucherDetail = (status) => {
    switch (status) {
      case "Loyal":
        return [
          "Diskon 50% untuk pembelian sayur segar",
          "Beli 1 gratis 1 untuk produk tisu",
        ];
      case "Aktif":
        return [
          "Diskon 30% untuk kopi pilihan",
          "Beli 1 gratis 1 untuk *produk mandi",
        ];
      case "Pasif":
        return [
          "Diskon 20% untuk semua produk minuman",
          "Gratis 1 produk random setiap transaksi",
        ];
      case "Baru":
        return [
          "Diskon 10% untuk pembelian pertama",
          "Voucher cashback Rp5.000 untuk transaksi berikutnya",
        ];
      default:
        return [];
    }
  };

  const voucherList = getVoucherDetail(status);

  return (
    <div className="min-h-screen bg-[#3F9540] p-8 flex justify-center items-start">
      <div className="w-[90%] max-w-7xl bg-white shadow-lg rounded-xl p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-[#3F9540]">Riwayat Pembelian</h1>
          <p className="text-base text-gray-600 mt-1">Lihat histori transaksi Anda sebelumnya</p>
          <div className="flex justify-center my-4">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3523/3523887.png"
              alt="Ilustrasi Riwayat"
              className="w-20 h-20"
            />
          </div>
          <p className="text-md text-gray-700">
            Status Pengguna:{" "}
            <span className="font-semibold text-[#3F9540]">{status}</span>
          </p>
          <p className="text-md text-gray-700 mt-1">
            Riwayat milik:{" "}
            <span className="font-semibold text-[#E81F25]">{userLogin.nama}</span>
          </p>
        </div>

        {/* Voucher Diskon */}
        <div className="bg-[#f0fdf3] border border-[#3F9540] rounded-lg px-5 py-4 mt-4 max-w-2xl mx-auto shadow-sm">
          <h3 className="text-lg font-bold text-[#3F9540] mb-2">🎁 Voucher Spesial untuk Kamu</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 mb-4">
            {voucherList.map((voucher, i) => (
              <li key={i}>{voucher}</li>
            ))}
          </ul>
          <button
            onClick={() => setVoucherClaimed(true)}
            disabled={voucherClaimed}
            className={`px-4 py-2 rounded-md font-semibold transition ${
              voucherClaimed
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-[#3F9540] text-white hover:bg-[#347b36]"
            }`}
          >
            {voucherClaimed ? "Voucher Telah Diklaim" : "Klaim Voucher"}
          </button>
        </div>

        {/* Tabel Riwayat */}
        <div className="overflow-x-auto mt-8">
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

        {/* Pagination */}
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