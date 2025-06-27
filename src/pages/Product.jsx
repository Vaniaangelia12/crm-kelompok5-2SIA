import React, { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from '../supabase'; // Sesuaikan path ini jika supabase.js ada di tempat lain
import { Search, PlusCircle, Edit, Trash2, X, Save, RotateCcw } from 'lucide-react'; // Import icons

// Daftar kategori yang tersedia, disesuaikan untuk Fresh Mart
const AVAILABLE_CATEGORIES = [
  "Buah-buahan Segar",
  "Sayuran Segar",
  "Daging & Olahan",
  "Ikan & Seafood",
  "Produk Susu & Olahan",
  "Produk Olahan Kedelai",
  "Roti & Pastry",
  "Bahan Pokok & Bumbu Dapur",
  "Minuman",
  "Makanan Ringan & Manisan",
  "Frozen Food",
  "Kebutuhan Rumah Tangga",
  "Perawatan Pribadi",
  "Lain-lain"
];

function formatCurrency(num) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(num);
}

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    kategori: AVAILABLE_CATEGORIES[0],
    stok: "",
    harga: "",
    aktif: true,
    gambar_produk: "",
  });
  const [editingProductId, setEditingProductId] = useState(null); // State untuk ID produk yang sedang diedit
  const [searchTerm, setSearchTerm] = useState(''); // State untuk fitur pencarian

  // State untuk Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10; // Menampilkan 10 produk per halaman

  // Fetch products from Supabase
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('produk')
      .select('*');

    if (error) {
      setError(error.message);
      console.error("Error fetching products:", error.message);
    } else {
      setProducts(data);
    }
    setLoading(false);
  }, []); // Dependensi kosong karena tidak ada props atau state lain yang dibutuhkan

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Logika Filter dan Sorting
  const filteredAndSortedProducts = useMemo(() => {
    let currentProducts = [...products];

    // Filter berdasarkan searchTerm
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentProducts = currentProducts.filter(product =>
        product.nama.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.kategori.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Sort berdasarkan Kategori (atau bisa ditambahkan opsi sorting lain)
    return currentProducts.sort((a, b) => {
      return a.kategori.localeCompare(b.kategori);
    });
  }, [products, searchTerm]);

  // Reset halaman ke 1 setiap kali filter/pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);


  // Logika Paginasi
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProductsPaginated = filteredAndSortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      nama: "",
      kategori: AVAILABLE_CATEGORIES[0],
      stok: "",
      harga: "",
      aktif: true,
      gambar_produk: "",
    });
    setEditingProductId(null);
  };

  const handleOpenAddForm = () => {
    setShowForm(true);
    resetForm(); // Pastikan form bersih saat ingin menambah baru
  };

  const handleOpenEditForm = (product) => {
    setShowForm(true);
    setEditingProductId(product.id);
    setFormData({
      nama: product.nama,
      kategori: product.kategori,
      stok: product.stok,
      harga: product.harga,
      aktif: product.aktif,
      gambar_produk: product.gambar_produk,
    });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSaveProduct = async () => {
    if (!formData.nama || !formData.stok || !formData.harga) {
      alert("Nama produk, stok, dan harga harus diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    const productData = {
      nama: formData.nama,
      kategori: formData.kategori,
      stok: parseInt(formData.stok),
      harga: parseFloat(formData.harga),
      aktif: formData.aktif,
      gambar_produk: formData.gambar_produk,
    };

    try {
      if (editingProductId) {
        // Mode Edit
        const { data, error: updateError } = await supabase
          .from('produk')
          .update(productData)
          .eq('id', editingProductId)
          .select();

        if (updateError) throw updateError;
        setProducts(prevProducts => prevProducts.map(p => p.id === editingProductId ? data[0] : p));
        alert("Produk berhasil diperbarui!");

      } else {
        // Mode Tambah Baru
        const { data, error: insertError } = await supabase
          .from('produk')
          .insert([productData])
          .select();

        if (insertError) throw insertError;
        setProducts((prev) => [...prev, ...data]);
        alert("Produk berhasil ditambahkan!");
      }

      setShowForm(false);
      resetForm();
      // Re-fetch data to ensure UI is consistent with DB, especially after complex ops
      // Or simply update local state more precisely if confident in local updates
      await fetchProducts(); 

    } catch (err) {
      setError(err.message);
      alert("Gagal menyimpan produk: " + err.message);
      console.error("Error saving product:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      setLoading(true);
      setError(null);
      try {
        const { error: deleteError } = await supabase
          .from('produk')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;

        setProducts(prev => prev.filter((p) => p.id !== id));
        alert("Produk berhasil dihapus!");
        // Sesuaikan halaman saat ini jika produk terakhir di halaman dihapus
        if (currentPage > Math.ceil((products.filter(p => p.id !== id)).length / productsPerPage) && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        setError(err.message);
        alert("Gagal menghapus produk: " + err.message);
        console.error("Error deleting product:", err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-green-700">Memuat produk...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-700">Error: {error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-[#E81F25]">Manajemen Produk</h1>

      {/* Control Buttons & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <button
          onClick={handleOpenAddForm}
          className="flex items-center px-6 py-3 bg-[#3F9540] text-white rounded-lg hover:bg-[#2e7c30] transition shadow-md w-full sm:w-auto justify-center"
        >
          <PlusCircle size={20} className="mr-2" /> Tambah Produk
        </button>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3F9540] focus:ring-2 focus:ring-[#3F9540]/30 outline-none transition-all duration-300 bg-white"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-red-500"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="mb-6 p-6 border border-gray-300 rounded-xl bg-white shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {editingProductId ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-2">
              <label className="block mb-1 font-medium text-gray-700">Nama Produk</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none"
                placeholder="Masukkan nama produk"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium text-gray-700">Kategori</label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none bg-white"
              >
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium text-gray-700">Stok</label>
              <input
                type="number"
                name="stok"
                value={formData.stok}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none"
                min="0"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium text-gray-700">Harga</label>
              <input
                type="number"
                name="harga"
                value={formData.harga}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none"
                min="0"
              />
            </div>
            <div className="mb-2 md:col-span-2">
              <label className="block mb-1 font-medium text-gray-700">URL Gambar Produk</label>
              <input
                type="text"
                name="gambar_produk"
                value={formData.gambar_produk}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none"
                placeholder="Contoh: https://example.com/gambar_produk.jpg"
              />
            </div>
            <div className="mb-4 md:col-span-2">
              <label className="inline-flex items-center text-gray-700">
                <input
                  type="checkbox"
                  name="aktif"
                  checked={formData.aktif}
                  onChange={handleChange}
                  className="mr-2 h-5 w-5 text-[#3F9540] rounded focus:ring-[#3F9540]"
                />
                Produk Aktif
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleCancelForm}
              className="flex items-center px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition shadow-md"
              disabled={loading}
            >
              <X size={20} className="mr-2" /> Batal
            </button>
            <button
              onClick={handleSaveProduct}
              className="flex items-center px-6 py-3 bg-[#E81F25] text-white rounded-lg hover:bg-[#C2181B] transition shadow-md"
              disabled={loading}
            >
              <Save size={20} className="mr-2" />
              {loading ? 'Menyimpan...' : (editingProductId ? 'Perbarui Produk' : 'Tambah Produk')}
            </button>
          </div>
        </div>
      )}

      {/* Product Table */}
      {!showForm && (
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gambar</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stok</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentProductsPaginated.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img
                      src={product.gambar_produk || `https://placehold.co/50x50/cccccc/ffffff?text=No+Img`}
                      alt={product.nama}
                      className="w-12 h-12 rounded-md object-cover border border-gray-200"
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/50x50/cccccc/ffffff?text=No+Img`; }}
                    />
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{product.nama}</td>
                  <td className="px-6 py-4 text-gray-700">{product.kategori}</td>
                  <td className="px-6 py-4 text-right text-gray-700">{product.stok}</td>
                  <td className="px-6 py-4 text-right text-gray-700">{formatCurrency(product.harga)}</td>
                  <td className="px-6 py-4 text-center">
                    {product.aktif ? (
                      <span className="inline-block px-2 py-1 text-xs text-green-800 bg-green-100 rounded-full">
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs text-gray-600 bg-gray-200 rounded-full">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleOpenEditForm(product)}
                      title="Edit Produk"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(product.id)}
                      title="Hapus Produk"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {currentProductsPaginated.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500 italic">
                    Tidak ada produk yang cocok dengan pencarian Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-2 px-4 py-3 bg-white border-t border-gray-200 rounded-b-xl">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 border rounded-lg text-sm ${
                    currentPage === i + 1
                      ? "bg-[#3F9540] text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Berikutnya
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
