import React, { useState, useEffect, useMemo } from 'react';
import { ProductDummy } from '../../data/ProductDummy';
import { TransaksiDummy } from '../../data/TransaksiDummy';
import {
  ShoppingCart,
  CheckCircle,
  Plus,
  Minus,
  XCircle,
  Pencil,
  Search,
  X,
  Coins,
  Award,
  List,
  Activity, // Import Activity icon
  User // Import User icon
} from 'lucide-react';

export default function ProductUser() {
  const themeRed = '#E81F25';
  const freshGreen = '#3F9540';

  const [cartItems, setCartItems] = useState([]);
  const [activeTab, setActiveTab] = useState('Semua');
  const [showCheckout, setShowCheckout] = useState(false);

  const [loggedUser, setLoggedUser] = useState(null);
  const [statusMembership, setStatusMembership] = useState('normal');
  const [favCategory, setFavCategory] = useState(null);
  const [userBalance, setUserBalance] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [currentEditNotes, setCurrentEditNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [paymentMessage, setPaymentMessage] = useState('');

  // --- State Baru untuk Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8; // Menampilkan 8 produk per halaman
  // --- Akhir State Baru untuk Pagination ---

  const categories = useMemo(() => {
    return ['Semua', ...new Set(ProductDummy.map((p) => p.category))];
  }, []);

  const calculateMembershipStatus = (userId) => {
    const userTransactions = TransaksiDummy.filter(t => t.userId === userId);
    const now = new Date();

    if (userTransactions.length === 0) {
      setStatusMembership('baru');
    } else {
      const recentTransactions = userTransactions.filter(t =>
        (now - new Date(t.tanggalPembelian)) / (1000 * 60 * 60 * 24) <= 7
      );
      if (recentTransactions.length >= 5) {
        setStatusMembership('loyal');
      } else if (recentTransactions.length >= 2) {
        setStatusMembership('aktif');
      } else {
        setStatusMembership('pasif');
      }
    }
  };

  const calculateFavCategory = (userId) => {
    const categoryCount = {};
    TransaksiDummy
      .filter(tx => tx.userId === userId)
      .forEach(tx => {
        tx.items.forEach(item => {
          const product = ProductDummy.find(p => p.id === item.productId);
          if (product) {
            categoryCount[product.category] = (categoryCount[product.category] || 0) + item.quantity;
          }
        });
      });
    cartItems.forEach(item => {
      if (item.category) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + item.quantity;
      }
    });
    const fav = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
    setFavCategory(fav ? fav[0] : null);
  };

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem('loggedUser'));
    if (user) {
      setLoggedUser(user);
      calculateMembershipStatus(user.id);
      const savedBalance = sessionStorage.getItem(`userSaldo_${user.id}`);
      if (savedBalance) {
        setUserBalance(parseFloat(savedBalance));
      }
    }
  }, []);

  useEffect(() => {
    if (loggedUser) {
      calculateFavCategory(loggedUser.id);
    }
  }, [loggedUser, cartItems, statusMembership]);

  // --- Reset halaman ke 1 setiap kali tab atau pencarian berubah ---
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);
  // --- Akhir Reset halaman ---

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDiscountPercentage = (product) => {
    const cartItem = cartItems.find(item => item.id === product.id);

    if (statusMembership === 'loyal' && favCategory && product.category === favCategory) {
      return 0.10;
    }
    if (statusMembership === 'aktif' && favCategory && product.category === favCategory && cartItem?.quantity >= 2) {
      return 0.05;
    }
    return 0;
  };

  const calculateDiscountedPrice = (product) => {
    const discount = getDiscountPercentage(product);
    return product.price * (1 - discount);
  };

  const handleAddToCart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    alert(`"${product.name}" berhasil ditambahkan ke keranjang.`);
  };

  const handleIncrementQuantity = (itemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrementQuantity = (itemId) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    alert('Item berhasil dihapus dari keranjang.');
  };

  // --- Modifikasi filteredProducts untuk Pagination ---
  const allFilteredProducts = useMemo(() => {
    let productsToDisplay = ProductDummy;
    if (activeTab !== 'Semua') {
      productsToDisplay = productsToDisplay.filter((product) => product.category === activeTab);
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      productsToDisplay = productsToDisplay.filter(product =>
        product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.category.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return productsToDisplay;
  }, [activeTab, searchTerm]);

  // Hitung produk yang akan ditampilkan di halaman saat ini
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = allFilteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(allFilteredProducts.length / productsPerPage);
  // --- Akhir Modifikasi filteredProducts ---

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const harga = calculateDiscountedPrice(item);
      return sum + harga * item.quantity;
    }, 0);
  };

  const handleEditNotesClick = (itemId, initialNotes) => {
    setEditingNotesId(itemId);
    setCurrentEditNotes(initialNotes);
  };

  const handleSaveNotes = (itemId) => {
    setCartItems(prevCartItems =>
      prevCartItems.map(item =>
        item.id === itemId ? { ...item, notes: currentEditNotes } : item
      )
    );
    setEditingNotesId(null);
    setCurrentEditNotes('');
  };

  const handleCancelEditNotes = () => {
    setEditingNotesId(null);
    setCurrentEditNotes('');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleCheckoutConfirm = () => {
    const totalPayment = calculateTotal();

    if (paymentMethod === 'saldo') {
      if (userBalance >= totalPayment) {
        const newBalance = userBalance - totalPayment;
        setUserBalance(newBalance);
        sessionStorage.setItem(`userSaldo_${loggedUser.id}`, newBalance.toString());
        setPaymentMessage(`Pembayaran berhasil menggunakan saldo! Saldo Anda saat ini: ${formatRupiah(newBalance)}`);
        alert(`Pembayaran berhasil melalui Saldo!\nTotal: ${formatRupiah(totalPayment)}\nSaldo baru Anda: ${formatRupiah(newBalance)}`);
        setCartItems([]);
        setShowCheckout(false);
        if (loggedUser) {
          calculateMembershipStatus(loggedUser.id);
          calculateFavCategory(loggedUser.id);
        }
      } else {
        setPaymentMessage(`Saldo Anda tidak mencukupi untuk pembayaran ini. Saldo saat ini: ${formatRupiah(userBalance)}. Perlu: ${formatRupiah(totalPayment)}.`);
        alert(`Saldo Anda tidak mencukupi untuk pembayaran ini. Saldo saat ini: ${formatRupiah(userBalance)}. Perlu: ${formatRupiah(totalPayment)}.`);
      }
    } else {
      alert(`Pembayaran melalui: ${paymentMethod.toUpperCase()}\nTotal: ${formatRupiah(totalPayment)}\n(Simulasi)`);
      setCartItems([]);
      setShowCheckout(false);
      if (loggedUser) {
        calculateMembershipStatus(loggedUser.id);
        calculateFavCategory(loggedUser.id);
      }
    }
  };

  // Hitung progress bar (contoh sederhana, bisa disesuaikan)
  const membershipProgress = useMemo(() => {
    if (statusMembership === 'baru') return 25; // Contoh: 25% dari baru ke aktif
    if (statusMembership === 'aktif') return 75; // Contoh: 75% dari aktif ke loyal
    return 100; // Loyal atau lainnya
  }, [statusMembership]);

  console.log({
    statusMembership,
    favCategory,
    userBalance,
    cartItems,
    discounts: cartItems.map(item => ({
      name: item.name,
      eligibleDiscountPercentage: getDiscountPercentage(item) * 100,
      quantity: item.quantity,
      category: item.category,
      price: item.price,
      discountedPrice: calculateDiscountedPrice(item),
    }))
  });

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">Katalog Produk Fresh Mart</h2>

      {/* Info Status Membership dan Diskon */}
      {loggedUser && (
        <div className={`rounded-xl shadow-lg overflow-hidden mb-8 transition-all duration-300 ${
            statusMembership === 'loyal' ? 'border-2 border-[#3F9540]' :
            statusMembership === 'aktif' ? 'border-2 border-blue-500' :
            'border border-gray-200'
        }`}>
          {/* Header Card */}
          <div className={`px-6 py-4 flex items-center ${
            statusMembership === 'loyal' ? 'bg-gradient-to-r from-[#3F9540] to-[#2E7C30]' :
            statusMembership === 'aktif' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
            'bg-gradient-to-r from-gray-500 to-gray-600'
          }`}>
            <div className={`p-3 rounded-full ${
                statusMembership === 'loyal' ? 'bg-[#3F9540]/20' :
                statusMembership === 'aktif' ? 'bg-blue-500/20' :
                'bg-gray-500/20'
            }`}>
              {statusMembership === 'loyal' ? (
                <Award className="text-white" size={24} />
              ) : statusMembership === 'aktif' ? (
                <Activity className="text-white" size={24} />
              ) : (
                <User className="text-white" size={24} />
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-white">Status Keanggotaan</h3>
              <p className="text-white/90 text-sm">Fresh Mart</p>
            </div>
          </div>

          {/* Body Card */}
          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 text-sm">Status Membership Anda</p>
                <p className={`text-2xl font-bold ${
                    statusMembership === 'loyal' ? 'text-[#3F9540]' :
                    statusMembership === 'aktif' ? 'text-blue-600' :
                    'text-gray-700'
                }`}>
                  {statusMembership.toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 text-sm">Saldo</p>
                <p className="text-xl font-bold text-[#3F9540]">{formatRupiah(userBalance)}</p>
              </div>
            </div>

            {/* Benefit Info */}
            <div className={`p-4 rounded-lg ${
                statusMembership === 'loyal' ? 'bg-[#3F9540]/10' :
                statusMembership === 'aktif' ? 'bg-blue-500/10' :
                'bg-gray-100'
            }`}>
              {statusMembership === 'loyal' && favCategory ? (
                <>
                  <p className="font-medium text-[#3F9540] mb-1">Benefit Anda:</p>
                  <p className="text-sm">
                    💎 Diskon <strong className="text-[#E81F25]">10%</strong> untuk kategori <strong className="text-[#E81F25]">{favCategory}</strong>
                  </p>
                </>
              ) : statusMembership === 'aktif' && favCategory ? (
                <>
                  <p className="font-medium text-blue-600 mb-1">Benefit Anda:</p>
                  <p className="text-sm">
                    ✨ Diskon <strong className="text-[#E81F25]">5%</strong> untuk kategori <strong className="text-[#E81F25]">{favCategory}</strong> (min. 2 item)
                  </p>
                </>
              ) : statusMembership === 'baru' ? (
                <p className="text-sm text-gray-700">
                  🎉 Selamat datang member baru! Nikmati promo khusus untuk pembelian pertama Anda.
                </p>
              ) : (
                <p className="text-sm text-gray-700">
                  ⭐ Belanja lebih banyak untuk naik level dan dapatkan benefit spesial!
                </p>
              )}
            </div>

            {/* Progress Bar */}
            {statusMembership !== 'loyal' && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress menuju level berikutnya</span>
                  <span>
                    {statusMembership === 'baru' ? 'AKTIF' :
                    statusMembership === 'aktif' ? 'LOYAL' : ''}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      statusMembership === 'aktif' ? 'bg-[#3F9540]' : 'bg-blue-500'
                    }`}
                    style={{ width: `${membershipProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gabungan Pencarian dan Kategori */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-8">
        {/* Container Utama */}
        <div className="flex-col md:flex-row gap-4 items-center">
          {/* Search Bar dengan Desain Lebih Menarik */}
          <div className="relative w-full md:w-auto md:flex-1 group mb-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search
                size={20}
                className={`transition-colors duration-200 ${
                  searchTerm ? 'text-[#E81F25]' : 'text-gray-400'
                }`}
              />
            </div>
            <input
              type="text"
              placeholder="Cari produk (contoh: apel, ayam, minuman)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3F9540] focus:ring-2 focus:ring-[#3F9540]/30 outline-none transition-all duration-300 bg-gray-50 hover:bg-white"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#E81F25] transition-colors"
                aria-label="Hapus pencarian"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Tabs Kategori - Grid Responsif */}
          <div className="w-full mt-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    activeTab === cat
                      ? 'bg-[#3F9540] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                >
                  {cat === 'Semua' ? (
                    <>
                      <List size={16} className="mr-1 hidden sm:inline" />
                      <span>Semua</span>
                    </>
                  ) : (
                    <span className="truncate">{cat}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Filters (opsional) */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab(favCategory || 'Semua')}
            className={`text-xs px-3 py-1 rounded-full cursor-pointer ${
              activeTab === favCategory
                ? 'bg-[#E81F25]/10 text-[#E81F25] border border-[#E81F25]/50'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            disabled={!favCategory}
          >
            ⭐ Favorit: {favCategory || 'Belum ada'}
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveTab('Semua');
            }}
            className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer"
          >
            ↻ Reset Filter
          </button>
        </div>
      </div>

      {/* Cart */}
      {cartItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <ShoppingCart size={24} className="mr-3 text-[#E81F25]" /> Keranjang Anda ({cartItems.reduce((total, item) => total + item.quantity, 0)} item)
          </h3>
          <ul className="space-y-3">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-3 rounded-md border border-gray-100"
              >
                <div className="flex flex-col flex-grow w-full sm:w-auto">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <span className="text-gray-700 font-medium">{item.name}</span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleDecrementQuantity(item.id)}
                        className="p-1.5 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors text-gray-700"
                        aria-label="Kurangi kuantitas"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-[#3F9540] w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleIncrementQuantity(item.id)}
                        className="p-1.5 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors text-gray-700"
                        aria-label="Tambah kuantitas"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Catatan Item */}
                  <div className="text-sm text-gray-600 mt-2 ml-1 sm:mt-0 w-full">
                    {editingNotesId === item.id ? (
                      <div className="flex flex-col space-y-1">
                        <textarea
                          value={currentEditNotes}
                          onChange={(e) => setCurrentEditNotes(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          rows="2"
                          placeholder="Tambahkan catatan untuk item ini..."
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleSaveNotes(item.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={handleCancelEditNotes}
                            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="italic">
                          {item.notes ? `Catatan: "${item.notes}"` : "Tidak ada catatan"}
                        </span>
                        <button
                          onClick={() => handleEditNotesClick(item.id, item.notes)}
                          className="text-gray-500 hover:text-gray-700"
                          aria-label="Edit catatan"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                  <span className="font-semibold text-gray-900 whitespace-nowrap">
                    {formatRupiah(calculateDiscountedPrice(item) * item.quantity)}
                  </span>
                  {getDiscountPercentage(item) > 0 && (
                    <span className="text-sm text-[#E81F25] ml-2 font-medium">({getDiscountPercentage(item) * 100}% Diskon!)</span>
                  )}
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 bg-red-100 rounded-full hover:bg-red-200 text-red-600"
                    aria-label="Hapus item"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="text-right mt-4 pt-4 border-t border-gray-200">
            <p className="text-lg font-bold text-gray-800">
              Total: <span className="text-[#E81F25]">{formatRupiah(calculateTotal())}</span>
            </p>
            <button
              onClick={() => setShowCheckout(true)}
              className="mt-4 px-6 py-3 bg-[#3F9540] text-white font-semibold rounded-lg hover:bg-green-700 shadow-md"
            >
              Lanjutkan ke Checkout
            </button>
          </div>
        </div>
      )}

      {/* Checkout Konfirmasi */}
      {showCheckout && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-green-500">
          <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <CheckCircle className="mr-2" /> Konfirmasi Pembelian
          </h3>
          <ul className="space-y-2">
            {cartItems.map((item) => (
              <li key={item.id} className="text-gray-700 flex justify-between items-center">
                <span>
                  {item.name} × {item.quantity}{' '}
                  {getDiscountPercentage(item) > 0 && (
                    <span className="text-sm text-[#E81F25] font-medium">({getDiscountPercentage(item) * 100}% Diskon!)</span>
                  )}
                </span>
                <span className="font-semibold">
                  {formatRupiah(calculateDiscountedPrice(item) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          {/* Metode Pembayaran */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Metode Pembayaran:</label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPaymentMessage(''); // Clear message when changing method
              }}
              className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="transfer">Transfer Bank</option>
              <option value="cod">Bayar di Tempat (COD)</option>
              <option value="ewallet">E-Wallet</option>
              {/* Opsi baru untuk pembayaran dengan saldo */}
              {loggedUser && (
                <option value="saldo">
                  Bayar dengan Saldo ({formatRupiah(userBalance)})
                </option>
              )}
            </select>
            {paymentMethod === 'saldo' && (
              <p className={`mt-2 text-sm ${userBalance < calculateTotal() ? 'text-red-600' : 'text-gray-600'}`}>
                Saldo Anda: <span className="font-bold">{formatRupiah(userBalance)}</span>
                {userBalance < calculateTotal() && ' (Saldo tidak cukup)'}
              </p>
            )}
            {paymentMessage && (
              <p className={`mt-2 text-sm ${paymentMessage.includes("berhasil") ? "text-green-600" : "text-red-600"}`}>
                {paymentMessage}
              </p>
            )}
          </div>

          <div className="text-right mt-4 pt-4 border-t border-gray-200">
            <p className="text-lg font-bold text-gray-800">
              Total Pembayaran: <span className="text-[#E81F25]">{formatRupiah(calculateTotal())}</span>
            </p>
            <button
              onClick={handleCheckoutConfirm}
              className="mt-3 px-6 py-2 bg-[#3F9540] text-white rounded-lg hover:bg-green-700 shadow-md"
            >
              Konfirmasi Pembelian
            </button>
            <button
              onClick={() => {
                setShowCheckout(false);
                setPaymentMessage(''); // Clear message when cancelling
              }}
              className="mt-3 ml-2 px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 shadow-md"
            >
              Batal Pesanan
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => ( // Gunakan currentProducts di sini
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex flex-col hover:shadow-lg transition-shadow duration-200 ease-in-out"
          >
            <img
              src={product.gambar_produk}
              alt={product.name}
              className="w-full h-48 object-contain rounded-md mb-4 flex-shrink-0"
            />
            <h3 className="text-xl font-bold text-gray-900 mb-1">{product.name}</h3>
            <p className="text-md text-gray-600 mb-4 flex-grow">
              Harga:{' '}
              <span className="font-semibold text-[#3F9540]">
                {formatRupiah(calculateDiscountedPrice(product))}
              </span>
              {getDiscountPercentage(product) > 0 && (
                <span className="text-sm text-[#E81F25] ml-1 font-medium line-through">
                  {formatRupiah(product.price)}
                </span>
              )}
            </p>
            <button
              onClick={() => handleAddToCart(product)}
              className="mt-auto flex items-center justify-center px-4 py-2 bg-[#E81F25] text-white font-medium rounded-lg hover:bg-red-700 shadow-sm"
            >
              <ShoppingCart size={18} className="mr-2" /> Tambah ke Keranjang
            </button>
          </div>
        ))}
        {currentProducts.length === 0 && ( // Ubah dari filteredProducts.length
          <p className="col-span-full text-center text-gray-600 text-lg mt-8">
            Tidak ada produk ditemukan untuk pencarian "{searchTerm}" di kategori "{activeTab}".
          </p>
        )}
      </div>

      {/* --- Kontrol Pagination --- */}
      {totalPages > 1 && ( // Hanya tampilkan jika ada lebih dari 1 halaman
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Sebelumnya
          </button>
          <span className="text-lg font-medium text-gray-700">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            Berikutnya
          </button>
        </div>
      )}
      {/* --- Akhir Kontrol Pagination --- */}
    </div>
  );
}