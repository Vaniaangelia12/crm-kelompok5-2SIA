import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../supabase';

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
  Activity,
  User as UserIcon
} from 'lucide-react';


export default function ProductUser() {
  const themeRed = '#E81F25';
  const freshGreen = '#3F9540';

  const [cartItems, setCartItems] = useState([]);
  const [activeTab, setActiveTab] = useState('Semua');
  const [showCheckout, setShowCheckout] = useState(false);

  const [loggedUser, setLoggedUser] = useState(null);
  const [statusMembership, setStatusMembership] = useState('Memuat...');
  const [favCategory, setFavCategory] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [userJoinDate, setUserJoinDate] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [currentEditNotes, setCurrentEditNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [paymentMessage, setPaymentMessage] = useState('');

  // --- States untuk Data Supabase ---
  const [products, setProducts] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [promotions, setPromotions] = useState([]); // State baru untuk promosi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- Akhir States untuk Data Supabase ---

  // --- State untuk Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  // --- Akhir State untuk Pagination ---

  // Fungsi utilitas untuk memvalidasi format UUID
  const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return typeof uuid === 'string' && uuidRegex.test(uuid);
  };

  // Mengambil produk dari Supabase
  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from('produk').select('*');
    if (error) {
      console.error('Error fetching products:', error.message);
      throw new Error('Gagal memuat produk.');
    } else {
      setProducts(data);
    }
  }, []);

  // Mengambil semua transaksi beserta detailnya untuk perhitungan membership dan kategori favorit
  const fetchAllTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from('transaksi')
      .select('*, detail_transaksi(*, produk(kategori, harga))');

    if (error) {
      console.error('Error fetching all transactions:', error.message);
      throw new Error('Gagal memuat riwayat transaksi.');
    } else {
      const formattedTransactions = data.map(tx => ({
        id: tx.id,
        userId: tx.id_pengguna,
        tanggalPembelian: tx.tanggal_pembelian,
        items: tx.detail_transaksi.map(dt => ({
          productId: dt.id_produk,
          quantity: dt.kuantitas,
          category: dt.produk ? dt.produk.kategori : null,
          price: dt.harga_saat_pembelian
        }))
      }));
      setAllTransactions(formattedTransactions);
    }
  }, []);

  // Mengambil promosi dari Supabase
  const fetchPromotions = useCallback(async () => {
    const { data, error } = await supabase
      .from('promosi')
      .select('*')
      .order('tanggal_mulai', { ascending: false });
    if (error) {
      console.error('Error fetching promotions:', error.message);
      throw new Error('Gagal memuat promosi.');
    }
    setPromotions(data || []);
    console.log("Fetched Promotions:", data); // Log untuk melihat promosi yang diambil
  }, []);

  // Mengambil saldo pengguna dan tanggal bergabung dari Supabase
  const fetchUserBalanceAndJoinDate = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('pengguna')
      .select('total_saldo, tanggal_bergabung')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user balance and join date:', error.message);
      throw new Error('Gagal memuat detail pengguna. Silakan coba login ulang.');
    } else if (data) {
      setUserBalance(data.total_saldo);
      setUserJoinDate(data.tanggal_bergabung);
      sessionStorage.setItem(`userSaldo_${userId}`, data.total_saldo.toString());
    } else {
      setUserBalance(0);
      setUserJoinDate(null);
      sessionStorage.setItem(`userSaldo_${userId}`, '0');
    }
  }, []);

  // Initial data fetch saat komponen dimuat
  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      setError(null);
      setLoggedUser(null);

      const user = JSON.parse(sessionStorage.getItem('loggedUser'));

      if (!user || !user.id) {
        console.log("No logged user found in session or invalid ID. Skipping user-specific data fetch.");
        setLoading(false);
        return;
      }

      if (!isValidUUID(user.id)) {
        setError('ID pengguna tidak dalam format yang benar (UUID). Harap login ulang.');
        setLoading(false);
        setLoggedUser(null);
        alert('ID pengguna tidak valid. Silakan login ulang.');
        return;
      }

      setLoggedUser(user);

      try {
        await fetchProducts();
        await fetchAllTransactions();
        await fetchUserBalanceAndJoinDate(user.id);
        await fetchPromotions(); // Memanggil fetchPromotions
      } catch (err) {
        console.error('Error during initial fetch:', err);
        setError('Gagal memuat data awal: ' + err.message);
        setLoggedUser(null);
      } finally {
        console.log("Initial fetch completed. Setting loading to false.");
        setLoading(false);
      }
    };
    initFetch();
  }, [fetchProducts, fetchAllTransactions, fetchUserBalanceAndJoinDate, fetchPromotions]);

  // Kategori sekarang tergantung pada produk yang sudah diambil
  const categories = useMemo(() => {
    return ['Semua', ...new Set(products.map((p) => p.kategori))];
  }, [products]);


  // Fungsi perhitungan status membership (diselaraskan dengan Profile2.jsx)
  const calculateMembershipStatus = useCallback((userId, tanggalBergabung) => {
    console.log("Calculating membership status for:", { userId, tanggalBergabung, allTransactionsLength: allTransactions.length });
    const userTransactions = allTransactions.filter(t => t.userId === userId);
    const now = new Date();

    const joinedAt = tanggalBergabung ? new Date(tanggalBergabung) : null;

    if (!joinedAt) {
      console.log("Status: Baru (No join date provided)");
      setStatusMembership('baru');
      return;
    }

    const selisihHari = Math.floor((now - joinedAt) / (1000 * 60 * 60 * 24));

    if (selisihHari < 7 && userTransactions.length === 0) {
      console.log("Status: Baru (Less than 7 days, no transactions)");
      setStatusMembership('baru');
    } else {
      const transaksi7Hari = userTransactions.filter(t =>
        (now - new Date(t.tanggalPembelian)) / (1000 * 60 * 60 * 24) <= 7
      );
      if (transaksi7Hari.length >= 28) {
        console.log("Status: Loyal");
        setStatusMembership('loyal');
      } else if (transaksi7Hari.length >= 14) {
        console.log("Status: Aktif (14+ transactions in 7 days)");
        setStatusMembership('aktif');
      } else {
        const transaksi30Hari = userTransactions.filter(t =>
          (now - new Date(t.tanggalPembelian)) / (1000 * 60 * 60 * 24) <= 30
        );
        if (transaksi30Hari.length === 0) {
          console.log("Status: Pasif (No transactions in 30 days)");
          setStatusMembership('pasif');
        } else {
          console.log("Status: Aktif (Some transactions within 30 days, but not enough for Loyal/Active 7-day)");
          setStatusMembership('aktif');
        }
      }
    }
  }, [allTransactions]);


  // Fungsi perhitungan kategori favorit
  const calculateFavCategory = useCallback((userId) => {
    console.log("Calculating favorite category for:", { userId, allTransactionsLength: allTransactions.length });
    const categoryCount = {};
    allTransactions
      .filter(tx => tx.userId === userId)
      .forEach(tx => {
        tx.items.forEach(item => {
          if (item.category) {
            categoryCount[item.category] = (categoryCount[item.category] || 0) + item.quantity;
          }
        });
      });
    cartItems.forEach(item => {
      if (item.kategori) {
        categoryCount[item.kategori] = (categoryCount[item.kategori] || 0) + item.quantity;
      }
    });
    const fav = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
    setFavCategory(fav ? fav[0] : null);
    console.log("Fav Category:", fav ? fav[0] : null);
  }, [allTransactions, cartItems]);

  // Effect untuk memicu perhitungan status membership dan kategori favorit
  useEffect(() => {
    console.log("Effect to trigger status/fav calculation. States:", { loggedUser, allTransactionsLength: allTransactions.length, productsLength: products.length, userJoinDate, loading });
    if (!loading && loggedUser) {
      calculateMembershipStatus(loggedUser.id, userJoinDate);
      calculateFavCategory(loggedUser.id);
    }
  }, [loggedUser, allTransactions, products, userJoinDate, calculateMembershipStatus, calculateFavCategory, loading]);


  // Reset halaman ke 1 setiap kali tab atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Fungsi baru untuk mendapatkan informasi diskon membership
  const getMembershipDiscountInfo = useCallback((product, quantity = 1) => {
    const isLoyal = statusMembership === 'loyal';
    const isActive = statusMembership === 'aktif';
    const isFavCategory = favCategory && product.kategori === favCategory;

    if (isLoyal && isFavCategory) {
      return { percentage: 0.10, display: '10% (Loyal Member)' };
    }
    if (isActive && isFavCategory && quantity >= 2) {
      return { percentage: 0.05, display: '5% (Aktif Member, min 2 item)' };
    }
    return null;
  }, [statusMembership, favCategory]);

  // Fungsi baru untuk mendapatkan promosi umum yang berlaku untuk produk
  const getApplicablePromotion = useCallback((product) => {
    const now = new Date();
    console.log(`Evaluating promotions for product: ${product.nama} (ID: ${product.id}) at ${now.toISOString()}`); // Debug log
    let bestPromo = null;
    let maxDiscountAmount = 0; // Untuk menyimpan jumlah diskon dalam nilai Rupiah

    promotions.forEach(promo => {
      const startDate = new Date(promo.tanggal_mulai);
      const endDate = new Date(promo.tanggal_berakhir);

      console.log(`  - Checking promo "${promo.nama_promosi}" (ID: ${promo.id}):`); // Debug log
      console.log(`    - Start Date: ${startDate.toISOString()}, End Date: ${endDate.toISOString()}`); // Debug log
      console.log(`    - Is now between dates? ${now >= startDate && now <= endDate}`); // Debug log

      // Pastikan promo aktif berdasarkan tanggal
      if (now >= startDate && now <= endDate) {
        // Cek apakah promo berlaku untuk produk ini (id_produk null = semua produk)
        const appliesToProduct = promo.id_produk === null || promo.id_produk === product.id;
        console.log(`    - Applies to product (ID ${product.id})? (Promo product ID: ${promo.id_produk}): ${appliesToProduct}`); // Debug log

        if (appliesToProduct) {
          let currentDiscountAmount = 0;
          if (promo.tipe_diskon === 'percentage') {
            currentDiscountAmount = product.harga * (promo.nilai_diskon / 100);
            console.log(`    - Discount type: Percentage (${promo.nilai_diskon}%), Calculated amount: ${currentDiscountAmount}`); // Debug log
          } else if (promo.tipe_diskon === 'fixed_amount') {
            currentDiscountAmount = promo.nilai_diskon;
            console.log(`    - Discount type: Fixed amount (Rp${promo.nilai_diskon}), Calculated amount: ${currentDiscountAmount}`); // Debug log
          }

          // Pilih promo yang memberikan diskon lebih besar
          if (currentDiscountAmount > maxDiscountAmount) {
            maxDiscountAmount = currentDiscountAmount;
            bestPromo = promo;
            console.log(`    - This is the new best promo: "${bestPromo.nama_promosi}" with amount Rp${maxDiscountAmount}`); // Debug log
          } else {
            console.log(`    - Not better than current best promo (Rp${maxDiscountAmount})`);
          }
        }
      }
    });
    if (bestPromo) {
      console.log(`Final best promo for ${product.nama}: "${bestPromo.nama_promosi}"`);
    } else {
      console.log(`No applicable promotion found for ${product.nama}.`);
    }
    return bestPromo;
  }, [promotions]); // promotions sebagai dependency

  // Fungsi utama untuk menghitung harga final dan informasi diskon yang diterapkan
  const calculateFinalPriceAndDiscountInfo = useCallback((product, quantity = 1) => {
    const originalPrice = product.harga;
    let finalPrice = originalPrice;
    let appliedDiscountInfo = null; // { type: 'promo'/'membership', value: number, display: string, name: string }

    const promo = getApplicablePromotion(product);
    const membershipDiscount = getMembershipDiscountInfo(product, quantity);

    let promoDiscountAmount = 0;
    if (promo) {
      if (promo.tipe_diskon === 'percentage') {
        promoDiscountAmount = originalPrice * (promo.nilai_diskon / 100);
      } else if (promo.tipe_diskon === 'fixed_amount') {
        promoDiscountAmount = promo.nilai_diskon;
      }
    }

    let membershipDiscountAmount = 0;
    if (membershipDiscount) {
      membershipDiscountAmount = originalPrice * membershipDiscount.percentage;
    }

    console.log(`--- Calculating final price for ${product.nama} (Original: ${originalPrice}) ---`); // Debug log
    console.log(`  - Promo Discount Amount: ${promoDiscountAmount}`);
    console.log(`  - Membership Discount Amount: ${membershipDiscountAmount}`);


    // Prioritaskan diskon yang lebih besar
    if (promoDiscountAmount >= membershipDiscountAmount && promoDiscountAmount > 0) {
      finalPrice = originalPrice - promoDiscountAmount;
      appliedDiscountInfo = {
        type: 'promo',
        value: promo.tipe_diskon === 'percentage' ? promo.nilai_diskon : promoDiscountAmount,
        display: promo.tipe_diskon === 'percentage' ? `${promo.nilai_diskon}%` : formatRupiah(promo.nilai_diskon),
        name: promo.nama_promosi
      };
      console.log(`  - Applying Promo: ${appliedDiscountInfo.name}, Final Price: ${finalPrice}`); // Debug log
    } else if (membershipDiscountAmount > 0) {
      finalPrice = originalPrice - membershipDiscountAmount;
      appliedDiscountInfo = {
        type: 'membership',
        value: membershipDiscount.percentage * 100, // Value in percentage
        display: membershipDiscount.display,
        name: 'Diskon Membership'
      };
      console.log(`  - Applying Membership Discount: ${appliedDiscountInfo.name}, Final Price: ${finalPrice}`); // Debug log
    } else {
      console.log(`  - No discount applied. Final Price: ${finalPrice}`); // Debug log
    }

    finalPrice = Math.max(0, finalPrice); // Pastikan harga tidak negatif

    return {
      originalPrice: originalPrice,
      finalPrice: finalPrice,
      appliedDiscountInfo: appliedDiscountInfo
    };
  }, [getApplicablePromotion, getMembershipDiscountInfo]);


  const handleAddToCart = (product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, {
        id: product.id,
        nama: product.nama,
        kategori: product.kategori,
        harga: product.harga,
        gambar_produk: product.gambar_produk,
        quantity: 1
      }]);
    }
    alert(`"${product.nama}" berhasil ditambahkan ke keranjang.`);
  };

  const handleIncrementQuantity = (itemId) => {
    setCartItems((prev) =>
      prev.map((item) => {
        const productInCart = products.find(p => p.id === item.id);
        if (productInCart && item.id === itemId && item.quantity < productInCart.stok) { // Check against product stock
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
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

  const allFilteredProducts = useMemo(() => {
    let productsToDisplay = products;
    if (activeTab !== 'Semua') {
      productsToDisplay = productsToDisplay.filter((product) => product.kategori === activeTab);
    }
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      productsToDisplay = productsToDisplay.filter(product =>
        product.nama.toLowerCase().includes(lowerCaseSearchTerm) ||
        product.kategori.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return productsToDisplay;
  }, [activeTab, searchTerm, products]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = allFilteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const totalPages = Math.ceil(allFilteredProducts.length / productsPerPage);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      // Dapatkan harga final yang sudah memperhitungkan diskon
      const { finalPrice } = calculateFinalPriceAndDiscountInfo(item, item.quantity);
      return sum + finalPrice * item.quantity;
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

  const handleCheckoutConfirm = async () => {
    if (!loggedUser) {
      alert('Anda harus login untuk melakukan transaksi.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Keranjang belanja kosong!');
      return;
    }

    const totalPayment = calculateTotal();
    const currentDateTime = new Date().toISOString();

    try {
      // 1. Masukkan data ke tabel 'transaksi'
      const { data: transactionData, error: transactionError } = await supabase
        .from('transaksi')
        .insert({
          id_pengguna: loggedUser.id,
          tanggal_pembelian: currentDateTime,
          total_harga: totalPayment
        })
        .select('id')
        .single();

      if (transactionError) {
        throw transactionError;
      }

      const newTransactionId = transactionData.id;

      // 2. Siapkan data untuk batch insert ke 'detail_transaksi' dan update stok produk
      const detailItems = cartItems.map(item => ({
        id_transaksi: newTransactionId,
        id_produk: item.id,
        kuantitas: item.quantity,
        harga_saat_pembelian: item.harga,
        subtotal: calculateFinalPriceAndDiscountInfo(item, item.quantity).finalPrice * item.quantity,
        catatan: item.notes || null
      }));

      const { error: detailError } = await supabase
        .from('detail_transaksi')
        .insert(detailItems);

      if (detailError) {
        throw detailError;
      }

      // Update product stock
      const stockUpdates = cartItems.map(async (item) => {
        const { data: productData, error: productFetchError } = await supabase
          .from('produk')
          .select('stok')
          .eq('id', item.id)
          .single();

        if (productFetchError) throw productFetchError;

        const newStock = productData.stok - item.quantity;
        const { error: stockUpdateError } = await supabase
          .from('produk')
          .update({ stok: newStock })
          .eq('id', item.id);

        if (stockUpdateError) throw stockUpdateError;
      });

      await Promise.all(stockUpdates); // Run all stock updates concurrently


      // 3. Tangani metode pembayaran 'saldo'
      if (paymentMethod === 'saldo') {
        if (userBalance >= totalPayment) {
          const newBalance = userBalance - totalPayment;
          const { error: updateBalanceError } = await supabase
            .from('pengguna')
            .update({ total_saldo: newBalance })
            .eq('id', loggedUser.id);

          if (updateBalanceError) {
            throw updateBalanceError;
          }

          setUserBalance(newBalance);
          sessionStorage.setItem(`userSaldo_${loggedUser.id}`, newBalance.toString());
          setPaymentMessage(`Pembayaran berhasil menggunakan saldo! Saldo Anda saat ini: ${formatRupiah(newBalance)}`);
          alert(`Pembayaran berhasil melalui Saldo!\nTotal: ${formatRupiah(totalPayment)}\nSaldo baru Anda: ${formatRupiah(newBalance)}`);
        } else {
          setPaymentMessage(`Saldo Anda tidak mencukupi untuk pembayaran ini. Saldo saat ini: ${formatRupiah(userBalance)}. Perlu: ${formatRupiah(totalPayment)}.`);
          alert(`Saldo Anda tidak mencukupi untuk pembayaran ini. Saldo saat ini: ${formatRupiah(userBalance)}. Perlu: ${formatRupiah(totalPayment)}.`);
          return;
        }
      } else {
        alert(`Pembayaran melalui: ${paymentMethod.toUpperCase()}\nTotal: ${formatRupiah(totalPayment)}\n(Simulasi Pembayaran Non-Saldo)`);
      }

      setCartItems([]);
      setShowCheckout(false);
      setPaymentMessage('');

      await fetchAllTransactions();
      await fetchUserBalanceAndJoinDate(loggedUser.id);
      await fetchProducts(); // Re-fetch products to update stock in UI

    } catch (error) {
      console.error('Checkout failed:', error.message);
      setPaymentMessage(`Terjadi kesalahan saat checkout: ${error.message}`);
      alert(`Terjadi kesalahan saat checkout: ${error.message}`);
    }
  };

  const membershipProgress = useMemo(() => {
    if (statusMembership === 'baru') return 25;
    if (statusMembership === 'aktif') return 75;
    return 100;
  }, [statusMembership]);

  if (loading) {
    return <div className="text-center p-8">Memuat produk dan data...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">Error: {error}</div>;
  }

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
                <UserIcon className="text-white" size={24} />
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
            {cartItems.map((item) => {
              const { originalPrice, finalPrice, appliedDiscountInfo } = calculateFinalPriceAndDiscountInfo(item, item.quantity);
              return (
                <li
                  key={item.id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-3 rounded-md border border-gray-100"
                >
                  <div className="flex flex-col flex-grow w-full sm:w-auto">
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <span className="text-gray-700 font-medium">{item.nama}</span>
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
                      {formatRupiah(finalPrice * item.quantity)}
                    </span>
                    {appliedDiscountInfo && appliedDiscountInfo.type !== 'none' && (
                      <span className="text-sm text-[#E81F25] ml-2 font-medium">
                        ({appliedDiscountInfo.display}
                        {appliedDiscountInfo.name && appliedDiscountInfo.type !== 'membership' && `: ${appliedDiscountInfo.name}`})
                      </span>
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
              );
            })}
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
            {cartItems.map((item) => {
              const { originalPrice, finalPrice, appliedDiscountInfo } = calculateFinalPriceAndDiscountInfo(item, item.quantity);
              return (
                <li key={item.id} className="text-gray-700 flex justify-between items-center">
                  <span>
                    {item.nama} × {item.quantity}{' '}
                    {appliedDiscountInfo && appliedDiscountInfo.type !== 'none' && (
                      <span className="text-sm text-[#E81F25] font-medium">({appliedDiscountInfo.display} Diskon!)</span>
                    )}
                  </span>
                  <span className="font-semibold">
                    {formatRupiah(finalPrice * item.quantity)}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* Metode Pembayaran */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Metode Pembayaran:</label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPaymentMessage('');
              }}
              className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="transfer">Transfer Bank</option>
              <option value="cod">Bayar di Tempat (COD)</option>
              <option value="ewallet">E-Wallet</option>
              {loggedUser && (
                <option value="saldo">
                  Bayar dengan Saldo ({formatRupiah(userBalance)})
                </option>
              )}
            </select>
            {paymentMethod === 'saldo' && (
              <p className={`mt-2 text-sm ${userBalance < calculateTotal() ? 'text-red-600' : 'text-gray-600'}`}>
                Saldo Anda saat ini: {formatRupiah(userBalance)}. Total pembayaran: {formatRupiah(calculateTotal())}.
              </p>
            )}
            {paymentMessage && (
              <p className={`mt-2 text-sm font-medium ${paymentMessage.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>
                {paymentMessage}
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowCheckout(false)}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleCheckoutConfirm}
              className={`px-5 py-2 rounded-lg text-white font-semibold transition-colors ${
                paymentMethod === 'saldo' && userBalance < calculateTotal()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#3F9540] hover:bg-green-700'
              }`}
              disabled={paymentMethod === 'saldo' && userBalance < calculateTotal()}
            >
              Bayar Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentProducts.map((product) => {
          const { originalPrice, finalPrice, appliedDiscountInfo } = calculateFinalPriceAndDiscountInfo(product, 1); // Pass quantity 1 for initial display
          return (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-transform transform hover:scale-102 hover:shadow-xl relative"
            >
              {appliedDiscountInfo && appliedDiscountInfo.type !== 'none' && (
                <div className="absolute top-0 left-0 bg-[#E81F25] text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10">
                  Diskon {appliedDiscountInfo.display}
                  {appliedDiscountInfo.name && appliedDiscountInfo.type !== 'membership' && appliedDiscountInfo.type !== 'promo' && `: ${appliedDiscountInfo.name}`}
                </div>
              )}
              <img
                src={product.gambar_produk || `https://placehold.co/400x300/${freshGreen.substring(1)}/FFFFFF?text=No+Image`}
                alt={product.nama}
                className="w-full h-48 object-contain"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/${freshGreen.substring(1)}/FFFFFF?text=No+Image`; }}
              />
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">{product.nama}</h3>
                <p className="text-sm text-gray-500 mb-2">{product.kategori}</p>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xl font-bold text-[#3F9540]">
                    {formatRupiah(finalPrice)}
                  </p>
                  {finalPrice < originalPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      {formatRupiah(originalPrice)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-[#E81F25] text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <ShoppingCart size={20} className="mr-2" /> Tambah ke Keranjang
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sebelumnya
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentPage === i + 1
                  ? 'bg-[#3F9540] text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}