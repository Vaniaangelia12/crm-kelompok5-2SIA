import { useState } from 'react';
import { TransaksiDummy } from '../data/TransaksiDummy';
import { UserDummy } from '../data/UserDummy';
import { ProductDummy } from '../data/ProductDummy';
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function RiwayatPembelian() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const getUserById = (id) => UserDummy.find((user) => user.id === id);
  const getProductById = (id) => ProductDummy.find((prod) => prod.id === id);

  // Sort transactions by date in descending order
  const sortedTransactions = TransaksiDummy.sort((a, b) => new Date(b.tanggalPembelian) - new Date(a.tanggalPembelian));

  const filtered = TransaksiDummy.filter((trans) => {
    const user = getUserById(trans.userId);
    return user?.nama_lengkap.toLowerCase().includes(search.toLowerCase());
  });

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const hitungTotalHarga = (items) => items.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleExportExcel = () => {
    const data = filtered.map((trans) => {
      const user = getUserById(trans.userId);
      const total = hitungTotalHarga(trans.items);
      return {
        ID_Transaksi: trans.id,
        Nama_User: user?.nama_lengkap,
        Membership: getMembershipStatus(trans.userId),
        Tanggal: new Date(trans.tanggalPembelian).toLocaleDateString('id-ID'),
        Total_Harga: total,
      };
    });
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Riwayat');
    writeFile(wb, 'riwayat-pembelian.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(232, 31, 37); // Warna merah (#E81F25)
    doc.text("Riwayat Pembelian Seluruh Pengguna", 14, 22);

    const tableColumn = ["ID", "User", "Membership", "Tanggal", "Total"];
    const tableRows = [];

    filtered.forEach((trans) => {
      const user = getUserById(trans.userId);
      const total = hitungTotalHarga(trans.items);
      tableRows.push([
        trans.id,
        user?.nama_lengkap || "-",
        getMembershipStatus(trans.userId),
        new Date(trans.tanggalPembelian).toLocaleDateString("id-ID"),
        `Rp${total.toLocaleString("id-ID")}`,
      ]);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: { fontSize: 10 },
      headStyles: { 
        fillColor: [232, 31, 37], // Warna merah (#E81F25)
        textColor: 255 // Warna teks putih
      },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    });

    doc.save("riwayat-pembelian.pdf");
  };

  const getMembershipStatus = (userId) => {
  const userTrans = TransaksiDummy.filter(tx => tx.userId === userId);
  const now = new Date();

  if (userTrans.length === 0) return 'Baru';

  const recentTrans = userTrans.filter(tx =>
    (now - new Date(tx.tanggalPembelian)) / (1000 * 60 * 60 * 24) <= 7
  );

  if (recentTrans.length >= 5) return 'Loyal';
  if (recentTrans.length >= 2) return 'Aktif';
  return 'Pasif';
};


  return (
    <div className="max-w-10xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-[#E81F25]">Riwayat Pembelian Seluruh Pengguna</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <input
          type="text"
          placeholder="Cari nama user..."
          className="border border-gray-300 rounded-md p-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-[#E81F25] focus:border-[#E81F25] transition"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <div className="space-x-3">
          <button
            className="bg-[#3F9540] hover:bg-[#2e7a2f] text-white px-5 py-2 rounded-md shadow transition"
            onClick={handleExportExcel}
          >
            Export Excel
          </button>
          {/* <button
            className="bg-[#E81F25] hover:bg-[#c61a1f] text-white px-5 py-2 rounded-md shadow transition"
            onClick={handleExportPDF}
          >
            Export PDF
          </button> */}
        </div>
      </div>

<div className="relative h-[600px] overflow-auto border border-gray-200 rounded-lg shadow-sm">
  {/* Fixed Header */}
  <table className="min-w-full h-full divide-y divide-gray-200">
    <thead className="bg-[#E81F25] sticky top-0 z-10">
      <tr>
        {["ID", "User", "Membership", "Tanggal", "Produk", "Total"].map((header) => (
          <th 
            key={header}
            className={`px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider ${ 
              header === "ID" ? "w-[80px]" : 
              header === "Produk" ? "w-[300px]" :
              header === "Total" ? "w-[120px]" :
              "w-[150px]"
            }`}
          >
            {header}
          </th>
        ))}
      </tr>
    </thead>

    {/* Scrollable Body */}
    <tbody className="bg-white divide-y divide-gray-200">
      {paginated.length === 0 ? (
        <tr>
          <td colSpan={6} className="text-center py-6 text-gray-500">
            Data tidak ditemukan
          </td>
        </tr>
      ) : (
        paginated.map((trans) => {
          const user = getUserById(trans.userId);
          const total = hitungTotalHarga(trans.items);
          return (
            <tr key={trans.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-900 w-[80px]">{trans.id}</td>
              <td className="px-6 py-4 text-sm text-gray-900 w-[150px]">
                <span className="truncate block">{user?.nama_lengkap}</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 w-[150px]">
                {getMembershipStatus(trans.userId)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 w-[150px]">
                {new Date(trans.tanggalPembelian).toLocaleDateString('id-ID')}
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 w-[300px]">
                <div className="max-h-[100px] overflow-y-auto">
                  {trans.items.map((item, idx) => {
                    const produk = getProductById(item.productId);
                    return (
                      <div key={idx} className="mb-1 last:mb-0">
                        <span className="inline-block w-[calc(100%-30px)] truncate" 
                          title={`${produk?.name} x${item.quantity}`}>
                          {produk?.name}
                        </span>
                        <span className="text-gray-500 ml-1">x{item.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-[#3F9540] w-[120px]">
                Rp{total.toLocaleString('id-ID')}
              </td>
            </tr>
          );
        })
      )}
    </tbody>
  </table>
</div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-md font-medium transition ${
            page === 1
              ? 'bg-gray-300 cursor-not-allowed text-gray-600'
              : 'bg-[#E81F25] text-white hover:bg-[#c61a1f]'
          }`}
        >
          Sebelumnya
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded-md font-medium transition ${
              page === 1
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-[#E81F25]/20 text-[#E81F25] hover:bg-[#E81F25]/30'
            }`}
          >
            Pertama
          </button>

          {[...Array(totalPages)].slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map((_, idx) => {
            const pageNum = idx + Math.max(0, page - 3) + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-4 py-2 rounded-md font-medium transition ${
                  page === pageNum
                    ? 'bg-[#E81F25] text-white'
                    : 'bg-[#E81F25]/20 text-[#E81F25] hover:bg-[#E81F25]/30'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-md font-medium transition ${
              page === totalPages
                ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                : 'bg-[#E81F25]/20 text-[#E81F25] hover:bg-[#E81F25]/30'
            }`}
          >
            Terakhir
          </button>
        </div>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-md font-medium transition ${
            page === totalPages
              ? 'bg-gray-300 cursor-not-allowed text-gray-600'
              : 'bg-[#E81F25] text-white hover:bg-[#c61a1f]'
          }`}
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
