import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase'; // Import Supabase client
import { utils, writeFile } from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Loader2, FileText, FileSpreadsheet, Search } from 'lucide-react'; // Add icons

export default function RiwayatPembelian() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [transactions, setTransactions] = useState([]);
  const [allUsers, setAllUsers] = useState({}); // Stores users for lookup {id: userObject}
  const [allProducts, setAllProducts] = useState({}); // Stores products for lookup {id: productObject}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized helper functions for efficient lookup
  const getUserById = useCallback((id) => allUsers[id], [allUsers]);
  const getProductById = useCallback((id) => allProducts[id], [allProducts]);

  // Fetch all necessary data from Supabase
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all transactions with nested detail_transaksi (product items)
      // and total_harga which should be pre-calculated in your DB
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transaksi')
        .select(`
          id,
          id_pengguna,
          tanggal_pembelian,
          total_harga,
          detail_transaksi(
            id_produk,
            kuantitas
          )
        `);

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        throw transactionsError;
      }

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('pengguna')
        .select('id, nama_lengkap, tanggal_bergabung'); // Only get necessary fields for membership status and name

      if (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }

      // Fetch all products
      const { data: productsData, error: productsError } = await supabase
        .from('produk')
        .select('id, nama, harga'); // 'nama' instead of 'name' as per your product schema

      if (productsError) {
        console.error("Error fetching products:", productsError);
        throw productsError;
      }

      // Process users into a lookup map
      const usersMap = usersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});
      setAllUsers(usersMap);

      // Process products into a lookup map
      const productsMap = productsData.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {});
      setAllProducts(productsMap);

      // Sort transactions by date in descending order
      const sorted = transactionsData.sort((a, b) => new Date(b.tanggal_pembelian) - new Date(a.tanggal_pembelian));
      setTransactions(sorted);

    } catch (err) {
      console.error("Error fetching all data:", err.message);
      setError("Gagal memuat riwayat pembelian: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Run once on component mount

  // Simplified: hitungTotalHarga now just returns the pre-calculated total_harga from the transaction object
  const hitungTotalHarga = useCallback((transaksi) => {
    return transaksi.total_harga; 
  }, []);

  const getMembershipStatus = useCallback((id_pengguna) => { // Corrected parameter name
    const userProfile = getUserById(id_pengguna); // Corrected parameter name
    if (!userProfile || !userProfile.tanggal_bergabung) return "Baru";

    const joinedAt = new Date(userProfile.tanggal_bergabung);
    const now = new Date();
    const selisihHari = Math.floor((now - joinedAt) / (1000 * 60 * 60 * 24));

    // Filter transactions for this specific user using id_pengguna
    const userTransactionsFiltered = transactions.filter(trx => trx.id_pengguna === id_pengguna); // Corrected property

    if (selisihHari < 7 && userTransactionsFiltered.length === 0) return "Baru";

    const recentTrans = userTransactionsFiltered.filter(trx =>
      (now - new Date(trx.tanggal_pembelian)) / (1000 * 60 * 60 * 24) <= 7 // Corrected property
    );

    // KETETAPAN BARU: Loyal >= 28, Aktif >= 14
    if (recentTrans.length >= 28) return 'Loyal';
    if (recentTrans.length >= 14) return 'Aktif';
    
    // Check for "Pasif" (no transactions in 30 days)
    const transaksi30Hari = userTransactionsFiltered.filter(t =>
      (now - new Date(t.tanggal_pembelian)) / (1000 * 60 * 60 * 24) <= 30
    );
    if (transaksi30Hari.length === 0) return "Pasif";

    // Default to Aktif if none of the above conditions met but has some transactions within 30 days
    return 'Aktif'; 
  }, [transactions, getUserById]);


  // Filter transactions based on search input
  const filteredTransactions = transactions.filter((trans) => {
    const user = getUserById(trans.id_pengguna); // Corrected property
    return user?.nama_lengkap.toLowerCase().includes(search.toLowerCase());
  });

  // Pagination logic
  const paginatedTransactions = filteredTransactions.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleExportExcel = () => {
    const data = filteredTransactions.map((trans) => {
      const user = getUserById(trans.id_pengguna); // Corrected property
      const total = trans.total_harga; // Using total_harga directly
      return {
        ID_Transaksi: trans.id,
        Nama_User: user?.nama_lengkap || "N/A",
        Membership: getMembershipStatus(trans.id_pengguna), // Corrected property
        Tanggal: new Date(trans.tanggal_pembelian).toLocaleDateString('id-ID'), // Corrected property
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

    filteredTransactions.forEach((trans) => {
      const user = getUserById(trans.id_pengguna); // Corrected property
      const total = trans.total_harga; // Using total_harga directly
      tableRows.push([
        trans.id,
        user?.nama_lengkap || "-",
        getMembershipStatus(trans.id_pengguna), // Corrected property
        new Date(trans.tanggal_pembelian).toLocaleDateString("id-ID"), // Corrected property
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <Loader2 className="animate-spin h-10 w-10 text-[#E81F25] mx-auto mb-4" />
          <p className="text-gray-700">Memuat riwayat pembelian...</p>
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
          <button onClick={() => fetchData()} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Coba Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-10xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-[#E81F25]">Riwayat Pembelian Seluruh Pengguna</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Cari nama user..."
            className="border border-gray-300 rounded-md p-2 pl-10 w-full focus:outline-none focus:ring-2 focus:ring-[#E81F25] focus:border-[#E81F25] transition"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <div className="space-x-3 flex justify-end w-full md:w-auto">
          <button
            className="flex items-center bg-[#3F9540] hover:bg-[#2e7a2f] text-white px-5 py-2 rounded-md shadow transition"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet size={18} className="mr-2" /> Export Excel
          </button>
          <button
            className="flex items-center bg-[#E81F25] hover:bg-[#c61a1f] text-white px-5 py-2 rounded-md shadow transition"
            onClick={handleExportPDF}
          >
            <FileText size={18} className="mr-2" /> Export PDF
          </button>
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
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((trans) => {
                const user = getUserById(trans.id_pengguna); // Corrected property
                const total = hitungTotalHarga(trans); // Pass the whole transaction object
                return (
                  <tr key={trans.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 w-[80px]">{trans.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 w-[150px]">
                      <span className="truncate block">{user?.nama_lengkap || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 w-[150px]">
                      {getMembershipStatus(trans.id_pengguna)} {/* Corrected property */}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 w-[150px]">
                      {new Date(trans.tanggal_pembelian).toLocaleDateString('id-ID')} {/* Corrected property */}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 w-[300px]">
                      <div className="max-h-[100px] overflow-y-auto">
                        {/* Iterate over detail_transaksi for product items */}
                        {Array.isArray(trans.detail_transaksi) && trans.detail_transaksi.map((detail, idx) => {
                          const produk = getProductById(detail.id_produk); // Use detail.id_produk
                          return (
                            <div key={idx} className="mb-1 last:mb-0">
                              <span className="inline-block w-[calc(100%-30px)] truncate" 
                                title={`${produk?.nama || 'Produk Tidak Ditemukan'} x${detail.kuantitas}`}>
                                {produk?.nama || 'Produk Tidak Ditemukan'}
                              </span>
                              <span className="text-gray-500 ml-1">x{detail.kuantitas}</span>
                            </div>
                          );
                        })}
                        {/* Handle case where detail_transaksi might not be an array */}
                        {!Array.isArray(trans.detail_transaksi) && <span className="text-red-500">Data produk tidak valid.</span>}
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
