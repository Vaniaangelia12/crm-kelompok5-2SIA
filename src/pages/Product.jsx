import React, { useState, useMemo } from "react";
import { ProductDummy } from '../data/ProductDummy'; // Sesuaikan path ini jika folder 'data' ada di tempat lain

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
  }).format(num);
}

export default function ProductManagement() {
  const [products, setProducts] = useState(ProductDummy);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: AVAILABLE_CATEGORIES[0],
    stock: "",
    price: "",
    active: true,
  });

  // State untuk Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10; // Menampilkan 10 produk per halaman

  // Logika Sorting (disini berdasarkan Kategori)
  const sortedProducts = useMemo(() => {
    const sortableProducts = [...products];
    return sortableProducts.sort((a, b) => {
      return a.category.localeCompare(b.category);
    });
  }, [products]);

  // Logika Paginasi
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddProduct = () => {
    if (!formData.name || !formData.stock || !formData.price) {
      alert("Nama produk, stok, dan harga harus diisi.");
      return;
    }
    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      ...formData,
      stock: parseInt(formData.stock),
      price: parseFloat(formData.price),
    };
    setProducts([...products, newProduct]);
    setFormData({
      name: "",
      category: AVAILABLE_CATEGORIES[0],
      stock: "",
      price: "",
      active: true
    });
    setShowForm(false);
    setCurrentPage(1); // Kembali ke halaman 1 setelah menambah produk
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus produk ini?")) {
      const updatedProducts = products.filter((p) => p.id !== id);
      setProducts(updatedProducts);
      // Sesuaikan halaman saat ini jika produk terakhir di halaman dihapus
      if (currentPage > Math.ceil(updatedProducts.length / productsPerPage) && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  return (
    <div className="max-w-10xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4 text-green-700">Manajemen Produk</h1> {/* Judul */}

      <button
        onClick={() => setShowForm((prev) => !prev)}
        // Tombol utama menggunakan warna hijau Fresh Mart
        className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        {showForm ? "Lihat Daftar Produk" : "Tambah Produk"}
      </button>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-300 rounded bg-white shadow-sm">
          <div className="mb-2">
            <label className="block mb-1 font-medium">Nama Produk</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              // Fokus input menggunakan warna hijau Fresh Mart
              className="w-full px-3 py-2 border rounded focus:ring-green-400 focus:outline-none"
              placeholder="Masukkan nama produk"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium">Kategori</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              // Fokus select menggunakan warna hijau Fresh Mart
              className="w-full px-3 py-2 border rounded focus:ring-green-400 focus:outline-none bg-white"
            >
              {AVAILABLE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium">Stok</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              // Fokus input menggunakan warna hijau Fresh Mart
              className="w-full px-3 py-2 border rounded focus:ring-green-400 focus:outline-none"
              min="0"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium">Harga</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              // Fokus input menggunakan warna hijau Fresh Mart
              className="w-full px-3 py-2 border rounded focus:ring-green-400 focus:outline-none"
              min="0"
            />
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="mr-2"
              />
              Aktif
            </label>
          </div>

          <button
            onClick={handleAddProduct}
            // Tombol simpan menggunakan warna oranye/kuning yang cerah
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
          >
            Simpan Produk
          </button>
        </div>
      )}

      {!showForm && (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stok</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Harga</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4 text-right">{product.stock}</td>
                  <td className="px-6 py-4 text-right">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 text-center">
                    {product.active ? (
                      // Badge "Aktif" menggunakan hijau yang cerah
                      <span className="inline-block px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                        Aktif
                      </span>
                    ) : (
                      // Badge "Nonaktif" tetap abu-abu untuk kontras
                      <span className="inline-block px-2 py-1 text-xs text-gray-600 bg-gray-200 rounded">
                        Nonaktif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center space-x-2">
                    <button
                      className="text-orange-600 hover:text-orange-800" // Tombol edit menjadi oranye
                      onClick={() => alert("Fitur Edit belum tersedia")}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900" // Tombol hapus tetap merah
                      onClick={() => handleDelete(product.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {currentProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    Tidak ada produk tersedia di halaman ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Kontrol Paginasi */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-2 px-4 py-3 bg-white border-t border-gray-200">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === i + 1
                      ? "bg-green-600 text-white" // Warna aktif halaman hijau
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
