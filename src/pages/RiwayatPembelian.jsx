import React from "react";
import { CalendarDays, CreditCard } from "lucide-react";

const transaksiDummy = [
  {
    id: 1,
    tanggal: "2025-05-30",
    deskripsi: "Pembelian Deterjen",
    total: "Rp35.000",
  },
  {
    id: 2,
    tanggal: "2025-05-25",
    deskripsi: "Pembelian Sabun Cair",
    total: "Rp28.000",
  },
  {
    id: 3,
    tanggal: "2025-05-20",
    deskripsi: "Pembelian Paket Spesial",
    total: "Rp85.000",
  },
];

const RiwayatPembelian = () => {
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

      {/* Daftar Transaksi */}
      <div className="max-w-xl mx-auto space-y-6">
        {transaksiDummy.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-6 border-l-8 border-gray-400 hover:shadow-lg transition-shadow"
          >
            <div className="bg-gray-200 p-4 rounded-full flex items-center justify-center shadow-sm">
              <CalendarDays className="text-gray-600 w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-800">{item.deskripsi}</h2>
              <p className="text-sm text-gray-500 mt-1">{item.tanggal}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-semibold text-lg">
              <CreditCard className="w-6 h-6" />
              <span>{item.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiwayatPembelian;
