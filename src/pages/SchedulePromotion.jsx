import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase'; // Import Supabase client
import { PlusCircle, Edit, Trash2, Loader2, DollarSign, Percent, Calendar } from 'lucide-react';

export default function SchedulePromotion() {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]); // List of products for dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null); // For editing
  const [form, setForm] = useState({
    nama_promosi: '',
    id_produk: '', // Will store product ID or empty for all products
    tipe_diskon: 'percentage', // 'percentage' or 'fixed_amount'
    nilai_diskon: '',
    tanggal_mulai: '', // Format string from datetime-local
    tanggal_berakhir: '', // Format string from datetime-local
    deskripsi: '',
  });
  const [saving, setSaving] = useState(false);

  // Fetch all promotions and products
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch promotions
      const { data: promosData, error: promosError } = await supabase
        .from('promosi')
        .select('*')
        .order('tanggal_mulai', { ascending: false });
      if (promosError) throw promosError;
      setPromotions(promosData || []);

      // Fetch active products for dropdown
      const { data: productsData, error: productsError } = await supabase
        .from('produk')
        .select('id, nama, harga')
        .eq('aktif', true) // Only active products
        .order('nama', { ascending: true });
      if (productsError) throw productsError;
      setProducts(productsData || []);

    } catch (err) {
      console.error("Error fetching data:", err.message);
      setError("Gagal memuat data promosi atau produk: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenCreateModal = () => {
    setCurrentPromotion(null);
    setForm({
      nama_promosi: '',
      id_produk: '', // Reset to empty for "all products" or specific product
      tipe_diskon: 'percentage',
      nilai_diskon: '',
      tanggal_mulai: '',
      tanggal_berakhir: '',
      deskripsi: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promotion) => {
    setCurrentPromotion(promotion);
    // Format tanggal ISO string dari database kembali ke format datetime-local
    // Ini penting agar input datetime-local menampilkan waktu lokal dengan benar
    const formattedStartDate = promotion.tanggal_mulai ? new Date(promotion.tanggal_mulai).toLocaleString('sv-SE', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false // Ensure 24-hour format
    }).replace(' ', 'T').substring(0,16) : ''; // sv-SE format is YYYY-MM-DD HH:MM:SS
    
    const formattedEndDate = promotion.tanggal_berakhir ? new Date(promotion.tanggal_berakhir).toLocaleString('sv-SE', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).replace(' ', 'T').substring(0,16) : '';

    setForm({
      nama_promosi: promotion.nama_promosi,
      id_produk: promotion.id_produk || '',
      tipe_diskon: promotion.tipe_diskon,
      nilai_diskon: promotion.nilai_diskon,
      tanggal_mulai: formattedStartDate,
      tanggal_berakhir: formattedEndDate,
      deskripsi: promotion.deskripsi || '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPromotion(null);
    setForm({
      nama_promosi: '',
      id_produk: '',
      tipe_diskon: 'percentage',
      nilai_diskon: '',
      tanggal_mulai: '',
      tanggal_berakhir: '',
      deskripsi: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Parse datetime-local string as local Date objects
    const startDateLocal = new Date(form.tanggal_mulai);
    const endDateLocal = new Date(form.tanggal_berakhir);

    if (isNaN(startDateLocal.getTime()) || isNaN(endDateLocal.getTime())) {
      setError("Tanggal mulai atau tanggal berakhir tidak valid.");
      setSaving(false);
      return;
    }
    if (startDateLocal >= endDateLocal) {
      setError("Tanggal berakhir harus setelah tanggal mulai.");
      setSaving(false);
      return;
    }
    
    // Convert local Date objects to UTC ISO strings for Supabase
    const tanggalMulaiUTC = startDateLocal.toISOString();
    const tanggalBerakhirUTC = endDateLocal.toISOString();

    // Prepare data for insertion/update
    const payload = {
      nama_promosi: form.nama_promosi,
      id_produk: form.id_produk === '' ? null : parseInt(form.id_produk), // Convert to int or null
      tipe_diskon: form.tipe_diskon,
      nilai_diskon: parseInt(form.nilai_diskon),
      tanggal_mulai: tanggalMulaiUTC, // Use UTC ISO string
      tanggal_berakhir: tanggalBerakhirUTC, // Use UTC ISO string
      deskripsi: form.deskripsi,
    };

    try {
      let response;
      if (currentPromotion) {
        response = await supabase
          .from('promosi')
          .update(payload)
          .eq('id', currentPromotion.id)
          .select();
      } else {
        response = await supabase
          .from('promosi')
          .insert(payload)
          .select();
      }

      if (response.error) throw response.error;

      // --- LOGIKA NOTIFIKASI UNTUK PENGGUNA DITAMBAHKAN DI SINI ---
      const promoName = payload.nama_promosi;
      const discountText = payload.tipe_diskon === 'percentage' ? `${payload.nilai_diskon}%` : `Rp${payload.nilai_diskon.toLocaleString('id-ID')}`;
      const productAffected = payload.id_produk ? products.find(p => p.id === payload.id_produk)?.nama : 'Semua Produk';
      const notificationMessage = `🎉 Ada promo baru! Dapatkan diskon ${discountText} untuk ${productAffected} di "${promoName}"! Promo berlaku dari ${formatDateTime(payload.tanggal_mulai)} hingga ${formatDateTime(payload.tanggal_berakhir)}.`;

      const newNotification = {
        // Mengatur id_pengguna menjadi NULL agar notifikasi ini muncul untuk SEMUA pengguna.
        // PASTIKAN kolom id_pengguna di tabel `notifikasi` Anda mengizinkan nilai NULL.
        // Jika tidak, Anda perlu mengubah skema tabel `notifikasi` Anda
        // dengan ALTER TABLE notifikasi ALTER COLUMN id_pengguna DROP NOT NULL;
        id_pengguna: null,
        pesan: notificationMessage,
        status: 'belum_dibaca',
        waktu: new Date().toISOString(), // Waktu notifikasi dibuat (UTC)
      };

      const { error: notificationError } = await supabase
        .from('notifikasi') // Nama tabel notifikasi Anda
        .insert([newNotification]);

      if (notificationError) {
        console.error("Gagal menambahkan notifikasi promo:", notificationError.message);
        // Jangan menghentikan proses simpan promosi jika notifikasi gagal, ini adalah secondary feature
      } else {
        console.log("Notifikasi promo berhasil ditambahkan ke database.");
      }
      // --- AKHIR LOGIKA NOTIFIKASI ---

      fetchData(); // Re-fetch all promotions
      handleCloseModal();
      alert(`Promosi berhasil ${currentPromotion ? 'diperbarui' : 'dibuat'}! Notifikasi telah dikirim ke pengguna.`);

    } catch (err) {
      console.error("Error saving promotion:", err.message);
      setError("Gagal menyimpan promosi: " + err.message);
      alert("Terjadi kesalahan saat menyimpan promosi: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePromotion = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus promosi ini?")) {
      return;
    }
    setLoading(true); // Re-use loading for delete operation
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('promosi')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setPromotions(prev => prev.filter(p => p.id !== id));
      alert("Promosi berhasil dihapus!");
    } catch (err) {
      console.error("Error deleting promotion:", err.message);
      setError("Gagal menghapus promosi: " + err.message);
      alert("Terjadi kesalahan saat menghapus promosi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPromotionStatus = (promo) => {
    const now = new Date(); // This is in client's local timezone, but when compared to UTC dates
                          // it implicitly aligns because both are Date objects.
    const startDate = new Date(promo.tanggal_mulai); // This will parse UTC string from DB correctly
    const endDate = new Date(promo.tanggal_berakhir); // This will parse UTC string from DB correctly

    if (now < startDate) {
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Dijadwalkan</span>;
    } else if (now >= startDate && now <= endDate) {
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>;
    } else {
      return <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Berakhir</span>;
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    // Display in local time for user readability
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
      hour12: false // Ensures 24-hour format
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <Loader2 className="animate-spin h-10 w-10 text-[#E81F25] mx-auto mb-4" />
          <p className="text-gray-700">Memuat data promosi...</p>
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
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Coba Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#E81F25]">Manajemen Promosi</h1>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center px-4 py-2 bg-[#3F9540] text-white rounded-md hover:bg-[#2e7c30] transition shadow-md"
        >
          <PlusCircle size={20} className="mr-2" /> Buat Promosi Baru
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="text-center py-10 text-gray-500 italic">
          Belum ada promosi yang dibuat.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Promosi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk Terkait</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diskon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promotions.map((promo) => {
                const product = products.find(p => p.id === promo.id_produk);
                const discountDisplay = promo.tipe_diskon === 'percentage'
                  ? `${promo.nilai_diskon}%`
                  : `Rp${promo.nilai_diskon.toLocaleString('id-ID')}`;

                return (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{promo.nama_promosi}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {promo.id_produk ? product?.nama || 'Produk Tidak Ditemukan' : 'Semua Produk'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{discountDisplay}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDateTime(promo.tanggal_mulai)} - {formatDateTime(promo.tanggal_berakhir)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {getPromotionStatus(promo)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(promo)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Promosi"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePromotion(promo.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Hapus Promosi"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Create/Edit Promotion */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {currentPromotion ? 'Edit Promosi' : 'Buat Promosi Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nama_promosi" className="block text-sm font-medium text-gray-700">Nama Promosi</label>
                <input
                  type="text"
                  id="nama_promosi"
                  name="nama_promosi"
                  value={form.nama_promosi}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="id_produk" className="block text-sm font-medium text-gray-700">Produk Terkait (Opsional, Kosongkan untuk Semua Produk)</label>
                <select
                  id="id_produk"
                  name="id_produk"
                  value={form.id_produk}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Semua Produk</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>{product.nama} (Rp{product.harga.toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tipe_diskon" className="block text-sm font-medium text-gray-700">Tipe Diskon</label>
                  <select
                    id="tipe_diskon"
                    name="tipe_diskon"
                    value={form.tipe_diskon}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed_amount">Jumlah Tetap (Rp)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="nilai_diskon" className="block text-sm font-medium text-gray-700">Nilai Diskon</label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      id="nilai_diskon"
                      name="nilai_diskon"
                      value={form.nilai_diskon}
                      onChange={handleInputChange}
                      min="0"
                      className="block w-full pl-10 pr-3 border border-gray-300 rounded-md shadow-sm py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {form.tipe_diskon === 'percentage' ? (
                        <Percent className="h-5 w-5 text-gray-400" />
                      ) : (
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tanggal_mulai" className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                  <input
                    type="datetime-local"
                    id="tanggal_mulai"
                    name="tanggal_mulai"
                    value={form.tanggal_mulai}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tanggal_berakhir" className="block text-sm font-medium text-gray-700">Tanggal Berakhir</label>
                  <input
                    type="datetime-local"
                    id="tanggal_berakhir"
                    name="tanggal_berakhir"
                    value={form.tanggal_berakhir}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi (Opsional)</label>
                <textarea
                  id="deskripsi"
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleInputChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                  disabled={saving}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3F9540] text-white rounded-md hover:bg-[#2e7c30] transition flex items-center"
                  disabled={saving}
                >
                  {saving ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
                  {currentPromotion ? 'Simpan Perubahan' : 'Buat Promosi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}