import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase'; // Sesuaikan path ini jika supabase.js ada di tempat lain
import { Users, Search, Trash2, ChevronLeft, ChevronRight, X, Info, Star, Activity, ZapOff, Clock, UserPlus, Save, User as UserIcon, Mail, Lock, Hash, Filter } from 'lucide-react'; // Import ikon

export default function DaftarMembership() {
  const [users, setUsers] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // State untuk menyimpan semua transaksi
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true); // Loading status untuk transaksi
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10; // Menampilkan 10 pengguna per halaman

  // State untuk form tambah pengguna baru
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({
    nik: '',
    nama_lengkap: '',
    email: '',
    password: '',
    konfirmasi_password: '',
    role: 'user', // Default role untuk pengguna yang ditambahkan admin di sini
  });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState(null);

  // State untuk filter status membership
  const [filterMembershipStatus, setFilterMembershipStatus] = useState('Semua'); // 'Semua', 'Baru', 'Aktif', 'Loyal', 'Pasif'

  // Fungsi untuk mendapatkan ikon status membership
  const getMembershipIcon = (status) => {
    switch (status) {
      case 'Loyal': return <Star className="text-yellow-500" size={16} />;
      case 'Aktif': return <Activity className="text-green-500" size={16} />;
      case 'Pasif': return <ZapOff className="text-gray-500" size={16} />;
      case 'Baru': return <Clock className="text-blue-500" size={16} />;
      default: return <Info className="text-gray-500" size={16} />;
    }
  };

  // Fungsi untuk menghitung status membership
  const getMembershipStatus = useCallback((user, transactions) => {
    if (!user || !transactions) return "Memuat...";

    const userTransactions = transactions.filter(t => t.id_pengguna === user.id);
    const now = new Date();
    const joinedAt = user.tanggal_bergabung ? new Date(user.tanggal_bergabung) : null;

    if (!joinedAt) {
      return "Baru"; // Default if no join date
    }

    const selisihHari = Math.floor((now - joinedAt) / (1000 * 60 * 60 * 24));

    if (selisihHari < 7 && userTransactions.length === 0) {
      return "Baru";
    } else {
      const transaksi7Hari = userTransactions.filter(t =>
        (now - new Date(t.tanggal_pembelian)) / (1000 * 60 * 60 * 24) <= 7
      );

      if (transaksi7Hari.length >= 28) {
        return "Loyal";
      } else if (transaksi7Hari.length >= 14) {
        return "Aktif";
      } else {
        const transaksi30Hari = userTransactions.filter(t =>
          (now - new Date(t.tanggal_pembelian)) / (1000 * 60 * 60 * 24) <= 30
        );
        if (transaksi30Hari.length === 0) {
          return "Pasif";
        } else {
          return "Aktif";
        }
      }
    }
  }, []);

  // Fetch users from Supabase
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('pengguna')
        .select(`
          id,
          nik,
          nama_lengkap,
          email,
          nomor_hp,
          tanggal_bergabung,
          total_poin,
          role
        `)
        .eq('role', 'user')
        .order('tanggal_bergabung', { ascending: false });

      if (error) {
        throw error;
      }
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err.message);
      setError("Gagal memuat daftar pengguna: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all transactions (for membership status calculation)
  useEffect(() => {
    const fetchAllTransactions = async () => {
      setTransactionsLoading(true);
      try {
        const { data, error } = await supabase
          .from('transaksi')
          .select('id_pengguna, tanggal_pembelian');
        if (error) throw error;
        setAllTransactions(data || []);
      } catch (err) {
        console.error("Error fetching all transactions:", err.message);
        // Do not set global error here to avoid blocking the main UI if only transactions fail.
      } finally {
        setTransactionsLoading(false);
      }
    };
    fetchAllTransactions();
  }, []); // Only runs once on mount

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Logika Filter, Sorting, dan Perhitungan Status Membership
  const usersWithCalculatedStatus = useMemo(() => {
    if (loading || transactionsLoading) return []; // Jangan hitung jika data belum siap
    return users.map(user => ({
      ...user,
      membershipStatus: getMembershipStatus(user, allTransactions)
    }));
  }, [users, allTransactions, loading, transactionsLoading, getMembershipStatus]);

  const filteredAndSortedUsers = useMemo(() => {
    let currentUsers = [...usersWithCalculatedStatus];

    // Filter berdasarkan searchTerm
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentUsers = currentUsers.filter(user =>
        user.nama_lengkap.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.nik.toLowerCase().includes(lowerCaseSearchTerm) ||
        (user.nomor_hp && user.nomor_hp.includes(lowerCaseSearchTerm))
      );
    }

    // Filter berdasarkan status membership
    if (filterMembershipStatus !== 'Semua') {
      currentUsers = currentUsers.filter(user => user.membershipStatus === filterMembershipStatus);
    }

    return currentUsers.sort((a, b) => a.nama_lengkap.localeCompare(b.nama_lengkap));
  }, [usersWithCalculatedStatus, searchTerm, filterMembershipStatus]);

  // Hitung total pengguna per status
  const membershipStatusCounts = useMemo(() => {
    const counts = {
      'Baru': 0,
      'Aktif': 0,
      'Loyal': 0,
      'Pasif': 0,
    };
    usersWithCalculatedStatus.forEach(user => {
      if (counts.hasOwnProperty(user.membershipStatus)) {
        counts[user.membershipStatus]++;
      }
    });
    return counts;
  }, [usersWithCalculatedStatus]);

  // Reset halaman ke 1 setiap kali filter/pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMembershipStatus]);

  // Logika Paginasi
  const totalPages = useMemo(() => Math.ceil(filteredAndSortedUsers.length / usersPerPage), [filteredAndSortedUsers.length, usersPerPage]);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsersPaginated = useMemo(() => filteredAndSortedUsers.slice(startIndex, startIndex + usersPerPage), [filteredAndSortedUsers, startIndex, usersPerPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna '${userName}'? Aksi ini tidak dapat dibatalkan.`)) {
      return;
    }

    setLoading(true); // Set loading for the delete operation
    setError(null);
    try {
      // Note: In a real app, deleting from auth.users should be done securely via a backend function.
      const { error: deleteError } = await supabase
        .from('pengguna')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        throw deleteError;
      }

      alert(`Pengguna '${userName}' berhasil dihapus.`);
      await fetchUsers(); // Muat ulang daftar pengguna setelah penghapusan
      // Also refetch all transactions as a user might have been deleted
      // which affects membership status calculations for others or simply to keep data fresh.
      const { data: updatedTransactions, error: trxError } = await supabase
        .from('transaksi')
        .select('id_pengguna, tanggal_pembelian');
      if (!trxError) setAllTransactions(updatedTransactions || []);

      // Sesuaikan halaman saat ini jika pengguna terakhir di halaman dihapus
      if (currentUsersPaginated.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (err) {
      console.error("Gagal menghapus pengguna:", err.message);
      setError("Gagal menghapus pengguna: " + err.message);
      alert("Terjadi kesalahan saat menghapus pengguna: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTanggal = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle form input changes for new user
  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  // Handle submission for adding a new user
  const handleAddNewUser = async (e) => {
    e.preventDefault();
    setAddUserLoading(true);
    setAddUserError(null);

    const { nik, nama_lengkap, email, password, konfirmasi_password, role } = newUserData;

    if (!nik || !nama_lengkap || !email || !password || !konfirmasi_password || !role) {
      setAddUserError("Semua kolom wajib diisi.");
      setAddUserLoading(false);
      return;
    }
    if (password !== konfirmasi_password) {
      setAddUserError("Password dan konfirmasi password tidak cocok!");
      setAddUserLoading(false);
      return;
    }
    if (password.length < 6) { // Supabase default min password length is 6
      setAddUserError("Password minimal harus 6 karakter.");
      setAddUserLoading(false);
      return;
    }
    if (!/^[0-9]{16}$/.test(nik)) {
        setAddUserError("NIK harus terdiri dari 16 digit angka.");
        setAddUserLoading(false);
        return;
    }

    try {
      // 1. Daftar pengguna menggunakan Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      const userId = authData.user.id;

      // 2. Simpan data profil ke tabel 'pengguna'
      const { error: profileError } = await supabase.from('pengguna').insert({
        id: userId, // Gunakan ID dari Supabase Auth
        nik: nik,
        nama_lengkap: nama_lengkap,
        email: email, // Email dari auth juga disimpan di sini
        tanggal_bergabung: new Date().toISOString(), // Set tanggal bergabung otomatis
        total_poin: 0,
        total_saldo: 0,
        role: role,
        // Set nilai default untuk kolom lain yang mungkin tidak diisi di form admin
        tempat_lahir: null, // Default null
        tanggal_lahir: null, // Default null
        jenis_kelamin: null, // Default null
        alamat: null, // Default null
        nomor_hp: null, // Default null
      });

      if (profileError) {
        // Jika insert profile gagal, coba hapus user dari Supabase Auth
        // Ini adalah upaya cleanup, tapi di lingkungan produksi lebih baik ditangani di server-side.
        console.error("Error inserting profile data:", profileError.message, "Attempting to delete auth user.");
        await supabase.auth.admin.deleteUser(userId); // Membutuhkan service_role key, TIDAK disarankan di client-side
        throw new Error(profileError.message);
      }

      alert("Pengguna baru berhasil ditambahkan!");
      setNewUserData({ // Reset form
        nik: '', nama_lengkap: '', email: '', password: '', konfirmasi_password: '', role: 'user',
      });
      setShowAddUserForm(false); // Sembunyikan form
      fetchUsers(); // Muat ulang daftar pengguna
      // Juga muat ulang transaksi jika ada kemungkinan pengguna baru segera memiliki transaksi
      const { data: updatedTransactions, error: trxError } = await supabase
        .from('transaksi')
        .select('id_pengguna, tanggal_pembelian');
      if (!trxError) setAllTransactions(updatedTransactions || []);

    } catch (err) {
      console.error("Gagal menambahkan pengguna:", err.message);
      setAddUserError("Gagal menambahkan pengguna: " + err.message);
    } finally {
      setAddUserLoading(false);
    }
  };


  if (loading || transactionsLoading) { // Combine loading states
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <Users className="animate-pulse h-10 w-10 text-[#3F9540] mx-auto mb-4" />
          <p className="text-gray-700">Memuat daftar anggota...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md border border-red-400 bg-red-100 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error!</h2>
        <p className="text-red-700">{error}</p>
        <button onClick={fetchUsers} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Coba Lagi</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-full bg-[#E81F25]/10 mr-4">
          <Users className="text-[#E81F25] w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Daftar Anggota Fresh Mart</h2>
          <p className="text-gray-600">Lihat dan kelola semua pelanggan yang terdaftar.</p>
        </div>
      </div>

      {/* Membership Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Object.entries(membershipStatusCounts).map(([status, count]) => (
          <div key={status} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{status}</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
            {getMembershipIcon(status)}
          </div>
        ))}
      </div>

      {/* Control buttons and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <button
          onClick={() => setShowAddUserForm(prev => !prev)}
          className="flex items-center px-6 py-3 bg-[#3F9540] text-white rounded-lg hover:bg-[#2e7c30] transition shadow-md w-full sm:w-auto justify-center"
        >
          <UserPlus size={20} className="mr-2" />
          {showAddUserForm ? "Tutup Form Tambah" : "Tambah Pengguna Baru"}
        </button>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Filter Status Membership */}
          <div className="relative w-full sm:w-auto">
            <select
              value={filterMembershipStatus}
              onChange={(e) => setFilterMembershipStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#E81F25] focus:ring-2 focus:ring-[#E81F25]/30 outline-none transition-all duration-300 bg-white"
            >
              <option value="Semua">Semua Status</option>
              <option value="Baru">Baru</option>
              <option value="Aktif">Aktif</option>
              <option value="Loyal">Loyal</option>
              <option value="Pasif">Pasif</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Filter size={20} className="text-gray-400" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari nama, email, NIK, atau HP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#E81F25] focus:ring-2 focus:ring-[#E81F25]/30 outline-none transition-all duration-300 bg-white"
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
      </div>

      {/* Form Tambah Pengguna Baru */}
      {showAddUserForm && (
        <div className="mb-8 p-6 border border-gray-300 rounded-xl bg-gray-50 shadow-md">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Form Tambah Pengguna Baru</h3>
          {addUserError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {addUserError}</span>
            </div>
          )}
          <form onSubmit={handleAddNewUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIK (16 Digit)</label>
              <div className="relative">
                <input
                  type="text"
                  name="nik"
                  value={newUserData.nik}
                  onChange={handleNewUserChange}
                  maxLength="16"
                  pattern="[0-9]{16}"
                  title="NIK harus 16 digit angka"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none"
                  disabled={addUserLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Hash size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <div className="relative">
                <input
                  type="text"
                  name="nama_lengkap"
                  value={newUserData.nama_lengkap}
                  onChange={handleNewUserChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none"
                  disabled={addUserLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <UserIcon size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={newUserData.email}
                  onChange={handleNewUserChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none"
                  disabled={addUserLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={newUserData.password}
                  onChange={handleNewUserChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none"
                  disabled={addUserLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type="password"
                  name="konfirmasi_password"
                  value={newUserData.konfirmasi_password}
                  onChange={handleNewUserChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none"
                  disabled={addUserLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
            {/* Optional: Add a role selection if admin can set other roles, but default to 'user' for this context */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={newUserData.role}
                onChange={handleNewUserChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none bg-white"
                disabled={addUserLoading}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div> */}
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddUserForm(false);
                  setNewUserData({ nik: '', nama_lengkap: '', email: '', password: '', konfirmasi_password: '', role: 'user' });
                  setAddUserError(null);
                }}
                className="flex items-center px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition shadow-md"
                disabled={addUserLoading}
              >
                <X size={20} className="mr-2" /> Batal
              </button>
              <button
                type="submit"
                className="flex items-center px-6 py-3 bg-[#E81F25] text-white rounded-lg hover:bg-[#C2181B] transition shadow-md"
                disabled={addUserLoading}
              >
                <Save size={20} className="mr-2" />
                {addUserLoading ? 'Menambahkan...' : 'Tambah Pengguna'}
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredAndSortedUsers.length === 0 && !loading && (
        <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
          <p className="text-gray-600">Tidak ada anggota yang ditemukan dengan kriteria pencarian ini.</p>
        </div>
      )}

      {filteredAndSortedUsers.length > 0 && (
        <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nomor HP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Poin</th> {/* New Header */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Membership</th> {/* New Header */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bergabung Sejak</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentUsersPaginated.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.nik}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nama_lengkap}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.nomor_hp}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.total_poin}</td> {/* Display total_poin */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="flex items-center gap-1">
                      {getMembershipIcon(user.membershipStatus)}
                      {user.membershipStatus}
                    </span>
                  </td> {/* Display membership status */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatTanggal(user.tanggal_bergabung)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(user.id, user.nama_lengkap)}
                      className="text-red-600 hover:text-red-900 ml-4 p-1 rounded-full hover:bg-red-100 transition"
                      title="Hapus Pengguna"
                      disabled={loading}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-2 px-4 py-3 bg-white border-t border-gray-200 rounded-b-xl">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 border rounded-lg text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-3 py-1 border rounded-lg text-sm ${
                    currentPage === i + 1
                      ? "bg-[#E81F25] text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                  }`}
                  disabled={loading}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 border rounded-lg text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}