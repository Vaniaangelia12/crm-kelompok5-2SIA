import { useEffect, useState } from "react";
import { TransaksiDummy } from "../../data/TransaksiDummy";
import { ProductDummy } from "../../data/ProductDummy";
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

  const handleGenerateInvoice = async (trx) => {
    const elementId = `invoice-${trx.id}`;
    const invoiceElement = document.getElementById(elementId);

    if (!invoiceElement) {
      console.error(`Elemen invoice dengan ID ${elementId} tidak ditemukan.`);
      return;
    }

    // Buat elemen invoice terlihat (tetapi di luar layar) sebelum mengonversinya
    invoiceElement.style.position = 'absolute';
    invoiceElement.style.left = '-9999px'; // Pindahkan ke luar layar
    invoiceElement.style.display = 'block'; // Pastikan terlihat

    try {
      const canvas = await html2canvas(invoiceElement, {
        scale: 2, // Meningkatkan resolusi untuk kualitas PDF yang lebih baik
        useCORS: true // Penting jika ada gambar dari URL eksternal
      });
      const pdf = new jsPDF('p', 'mm', 'a4'); // Gunakan 'mm' untuk satuan
      const imgData = canvas.toDataURL("image/png");
      
      const imgWidth = 210; // Lebar A4 dalam mm
      const pageHeight = 297; // Tinggi A4 dalam mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Invoice-${trx.id}.pdf`);
    } catch (error) {
      console.error("Gagal membuat PDF:", error);
    } finally {
      // Sembunyikan kembali elemen invoice setelah selesai
      invoiceElement.style.position = '';
      invoiceElement.style.left = '';
      invoiceElement.style.display = 'none';
    }
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
                  <button 
                    onClick={() => handleGenerateInvoice(trx)} 
                    className="ml-4 px-3 py-1 text-sm bg-[#3F9540] text-white rounded hover:bg-[#2E7C30]"
                  >
                    Unduh Struk PDF
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Ini adalah elemen invoice yang disembunyikan untuk keperluan PDF generation */}
          {/* Ubah 'hidden-print' agar tidak menggunakan display: none secara langsung */}
          {currentTransactions.map((trx) => (
            <div 
              id={`invoice-${trx.id}`} 
              key={`invoice-hidden-${trx.id}`}
              // Pertahankan gaya ini untuk kebutuhan html2canvas
              style={{ position: 'absolute', left: '-9999px', width: '210mm', minHeight: '297mm', padding: '15mm', boxSizing: 'border-box', backgroundColor: 'white', color: 'black', fontFamily: 'Arial, sans-serif', fontSize: '12px' }} 
            >
              {/* Header Invoice */}
              <div style={{
                backgroundColor: '#E81F25', // Merah Fresh Mart
                color: 'white',
                padding: '20px',
                textAlign: 'center',
                borderRadius: '8px 8px 0 0',
                marginBottom: '20px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                {/* Anda bisa menambahkan logo di sini, contoh: <img src="/path/to/logo.png" alt="Fresh Mart Logo" style={{ maxWidth: '150px', marginBottom: '10px' }} /> */}
                <h1 style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', letterSpacing: '1px' }}>FRESH MART</h1>
                <p style={{ margin: '5px 0 0', fontSize: '16px', fontStyle: 'italic' }}>Shopping at Fresh Mart is the Right Choice❤️🛍️🎊</p>
                <p style={{ margin: '10px 0 0', fontSize: '13px' }}>Jl. Hangtuah, Suka Mulia, Kec. Sail, Kota Pekanbaru, Riau 28114</p>
                <p style={{ margin: '0', fontSize: '13px' }}>WhatsApp: +62 813-3358-7451 | Instagram: @freshmart_pku</p>
              </div>

              {/* Detail Transaksi */}
              <div style={{ padding: '0 10px 20px 10px', fontSize: '14px', lineHeight: '1.6' }}>
                <h2 style={{ color: '#E81F25', fontSize: '22px', marginBottom: '15px', borderBottom: '2px solid #eee', paddingBottom: '8px', textAlign: 'center' }}>
                  STRUK PEMBELIAN
                </h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <div>
                    <p style={{ margin: '0' }}><strong>No. Transaksi:</strong> <span style={{ color: '#E81F25', fontWeight: 'bold' }}>#{trx.id}</span></p>
                    <p style={{ margin: '0' }}><strong>Tanggal:</strong> {formatDate(trx.tanggalPembelian)}</p>
                    {/* Opsional: Tampilkan nama pelanggan jika data user tersedia dan ingin ditambahkan */}
                    {/* <p style={{ margin: '0' }}><strong>Pelanggan:</strong> {getUserName(trx.userId)}</p> */}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: '0' }}>Terima Kasih Atas Kepercayaan Anda!</p>
                  </div>
                </div>

                {/* Tabel Detail Produk */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#3F9540', color: 'white' }}>
                      <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Produk</th>
                      <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #ddd' }}>Qty</th>
                      <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Harga</th>
                      <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trx.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px 12px', border: '1px solid #ddd' }}>{getProductName(item.productId)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', border: '1px solid #ddd' }}>{item.quantity}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', border: '1px solid #ddd' }}>{formatRupiah(item.price)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', border: '1px solid #ddd', fontWeight: 'bold' }}>{formatRupiah(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f9f9f9' }}>
                      <td colSpan="3" style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', border: '1px solid #ddd', fontSize: '15px' }}>Total Pembelian:</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#E81F25', fontSize: '18px', border: '1px solid #ddd' }}>
                        {formatRupiah(trx.items.reduce((total, item) => total + item.price * item.quantity, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Catatan Tambahan / Ucapan Terima Kasih */}
                <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '13px', color: '#555', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
                  <p style={{ margin: '0 0 5px 0' }}>Terima kasih telah berbelanja di <span style={{ fontWeight: 'bold', color: '#3F9540' }}>Fresh Mart Pekanbaru</span>!</p>
                  <p style={{ margin: '0' }}>Produk segar untuk keluarga sehat Anda.</p>
                </div>
              </div>
            </div>
          ))}


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