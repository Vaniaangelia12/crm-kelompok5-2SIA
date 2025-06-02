import React from "react";
import { CalendarDays, CreditCard } from "lucide-react";

const transaksiDummy = [
  {
    id: 1,
    tanggal: "2025-05-30",
    deskripsi: "Pembelian Kopi Latte",
    total: "Rp35.000",
  },
  {
    id: 2,
    tanggal: "2025-05-25",
    deskripsi: "Pembelian Espresso",
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-lime-300 to-orange-300 p-6">
      {/* Judul */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-lime-600 drop-shadow-md">
          Riwayat Pembelian
        </h1>
        <p className="text-base text-lime-700 mt-2">
          Lihat histori transaksi Anda sebelumnya
        </p>
      </div>

      {/* Media / Ilustrasi */}
      <div className="flex justify-center mb-10">
        <img
          src="https://cdn-icons-png.flaticon.com/512/3523/3523887.png"
          alt="Ilustrasi Riwayat"
          className="w-36 h-36 drop-shadow-lg"
          style={{ filter: "brightness(0.95) saturate(1.3)" }}
        />
      </div>

      {/* Daftar Transaksi */}
      <div className="max-w-xl mx-auto space-y-5">
        {transaksiDummy.map((item) => (
          <div
            key={item.id}
            className="bg-yellow-50 rounded-xl shadow-md hover:shadow-lg transition p-5 flex items-center gap-5 border-l-6 border-orange-500"
          >
            <div className="bg-lime-400 p-3 rounded-full flex items-center justify-center shadow-md">
              <CalendarDays className="text-lime-900 w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-lime-900">{item.deskripsi}</h2>
              <p className="text-sm text-lime-700">{item.tanggal}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-orange-600 font-semibold text-base">
                <CreditCard className="w-5 h-5" />
                <span>{item.total}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiwayatPembelian;
