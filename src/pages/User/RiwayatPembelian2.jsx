import { useEffect, useState } from "react";
import { TransaksiDummy } from "../../data/TransaksiDummy";
import { ProductDummy } from "../../data/ProductDummy";
import { History, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RiwayatPembelianUserPribadi() {
  const [userTransaksi, setUserTransaksi] = useState([]);
  const [loggedUser, setLoggedUser] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 2; // Meningkatkan jumlah item per halaman

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("loggedUser"));
    if (user && user.role === "user") {
      setLoggedUser(user);

      // Filter dan sort transaksi user berdasarkan tanggal terbaru
      const transaksiUser = TransaksiDummy
        .filter((trx) => trx.userId === user.id)
        .sort((a, b) => new Date(b.tanggalPembelian) - new Date(a.tanggalPembelian));

      setUserTransaksi(transaksiUser);
      setPage(1); // reset ke halaman 1 saat load data
    }
  }, []);

  const getProductName = (productId) => {
    const product = ProductDummy.find((p) => p.id === productId);
    return product ? product.name : "Produk Tidak Ditemukan";
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Pagination: hitung total halaman dan data yang ditampilkan di halaman sekarang
  const totalPages = Math.ceil(userTransaksi.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentTransactions = userTransaksi.slice(startIndex, startIndex + itemsPerPage);

  if (!loggedUser) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 max-w-4xl mx-auto">
        <p className="text-[#E81F25] font-medium">Harap login sebagai user.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 max-w-10xl mx-auto">
      {/* Header dengan ikon */}
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-full bg-[#3F9540]/10 mr-4">
          <History className="text-[#3F9540] w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Riwayat Pembelian Saya</h2>
          <p className="text-gray-600">Daftar transaksi pembelian Anda</p>
        </div>
      </div>

      {userTransaksi.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
          <p className="text-gray-600">Belum ada transaksi pembelian.</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {currentTransactions.map((trx) => (
              <div key={trx.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {/* Header Transaksi */}
                <div className="bg-[#3F9540]/10 px-4 py-3 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center">
                      <span className="font-medium text-[#3F9540] mr-3">#{trx.id}</span>
                      <span className="text-sm text-gray-600">{formatDate(trx.tanggalPembelian)}</span>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#3F9540] text-white">
                        Selesai
                      </span>
                    </div>
                  </div>
                </div>

                {/* Daftar Produk */}
                <div className="overflow-x-auto">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="w-1/2 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                          <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                          <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan</th>
                          <th className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {trx.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {getProductName(item.productId)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {formatRupiah(item.price)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-[#3F9540]">
                              {formatRupiah(item.price * item.quantity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                {/* Footer Transaksi */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-right">
                  <p className="text-sm font-semibold text-gray-700">
                    Total Transaksi: <span className="text-lg text-[#3F9540] ml-2">{formatRupiah(trx.items.reduce((total, item) => total + item.price * item.quantity, 0))}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-8 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, userTransaksi.length)} dari {userTransaksi.length} transaksi
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className={`p-2 rounded-md border cursor-pointer transition ${
                    page === 1
                      ? "bg-gray-100 cursor-not-allowed text-gray-400 border-gray-200"
                      : "bg-white text-[#3F9540] border-[#3F9540] hover:bg-[#3F9540]/10"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(totalPages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  // Tampilkan hanya beberapa nomor halaman di sekitar halaman aktif
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 rounded-md cursor-pointer font-medium transition ${
                          page === pageNum
                            ? "bg-[#3F9540] text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (
                    (pageNum === page - 2 && page > 3) ||
                    (pageNum === page + 2 && page < totalPages - 2)
                  ) {
                    return <span key={pageNum} className="px-2">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className={`p-2 rounded-md border cursor-pointer transition ${
                    page === totalPages
                      ? "bg-gray-100 cursor-not-allowed text-gray-400 border-gray-200"
                      : "bg-white text-[#3F9540] border-[#3F9540] hover:bg-[#3F9540]/10"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}