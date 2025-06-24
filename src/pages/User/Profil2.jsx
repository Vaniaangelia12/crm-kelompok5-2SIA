import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../supabase'; // Import Supabase client
import {
  User, Mail, Calendar, MapPin, Phone, Award, ClipboardList, PenTool, Save, X, Hash,
  Gift, Coins, Bell, CheckCircle, Clock, Star, Activity, ZapOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fungsi utilitas untuk memvalidasi format UUID
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && uuidRegex.test(uuid);
};

export default function Profile2() {
  const navigate = useNavigate();
  const [loggedUserSession, setLoggedUserSession] = useState(null); // Ini id dan email dari sessionStorage/Auth
  const [userData, setUserData] = useState(null); // Ini data profil lengkap dari tabel pengguna
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  const [totalPoin, setTotalPoin] = useState(0);
  const [poinToRedeem, setPoinToRedeem] = useState('');
  const [redeemMessage, setRedeemMessage] = useState("");

  const [totalSaldo, setTotalSaldo] = useState(0);
  const [userNotifications, setUserNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Deklarasi state untuk status membership dipindahkan ke atas
  const [currentMembershipStatus, setCurrentMembershipStatus] = useState("Memuat...");

  const primaryColor = '#E81F25';
  const secondaryColor = '#3F9540';
  const lightRed = '#FFEBEE';
  const lightGreen = '#E8F5E9';
  const darkRed = '#C2181B';
  const darkGreen = '#2E7C30';

  // --- Fungsi Pembantu (untuk membership dan transaksi) ---
  const getStatusMembership = useCallback(async (userId) => {
    // Untuk mendapatkan status membership, kita perlu transaksi dari database
    const { data: transaksiData, error: transaksiError } = await supabase
      .from('transaksi')
      .select('tanggal_pembelian')
      .eq('id_pengguna', userId)
      .order('tanggal_pembelian', { ascending: false });

    if (transaksiError) {
      console.error("Error fetching transactions for membership:", transaksiError.message);
      return "Error"; // Handle error appropriately
    }

    const transaksiUser = transaksiData.map(trx => ({
      tanggalPembelian: trx.tanggal_pembelian
    }));

    const now = new Date();
    // Pastikan tanggal_bergabung ada dan valid
    const joinedAt = userData?.tanggal_bergabung ? new Date(userData.tanggal_bergabung) : null;
    
    if (!joinedAt) return "Baru"; // Jika tanggal_bergabung tidak ada

    const selisihHari = Math.floor((now - joinedAt) / (1000 * 60 * 60 * 24));
    if (selisihHari < 7 && transaksiUser.length === 0) return "Baru";

    const transaksi7Hari = transaksiUser.filter(trx => (now - new Date(trx.tanggalPembelian)) / (1000 * 60 * 60 * 24) <= 7);
    if (transaksi7Hari.length >= 5) return "Loyal";
    if (transaksi7Hari.length >= 2) return "Aktif";

    const transaksi30Hari = transaksiUser.filter(trx => (now - new Date(trx.tanggalPembelian)) / (1000 * 60 * 60 * 24) <= 30);
    if (transaksi30Hari.length === 0) return "Pasif";

    return "Aktif";
  }, [userData]); // userData dibutuhkan untuk tanggal_bergabung

  // --- Fetch Data Pengguna, Poin, Saldo, dan Notifikasi dari Supabase ---
  const fetchProfileData = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch data profil pengguna
      const { data: profileData, error: profileError } = await supabase
        .from('pengguna')
        .select(`
          id,
          nik,
          nama_lengkap,
          email,
          tempat_lahir,
          tanggal_lahir,
          jenis_kelamin,
          alamat,
          nomor_hp,
          tanggal_bergabung,
          total_poin,
          total_saldo,
          role
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }
      if (!profileData) {
        throw new Error("Data pengguna tidak ditemukan di database.");
      }

      setUserData(profileData);
      setTotalPoin(profileData.total_poin || 0);
      setTotalSaldo(profileData.total_saldo || 0);

      // Simpan juga ke sessionStorage untuk konsistensi dengan komponen lain
      sessionStorage.setItem('loggedUser', JSON.stringify({
        id: profileData.id,
        email: profileData.email,
        role: profileData.role
      }));
      sessionStorage.setItem(`userSaldo_${profileData.id}`, (profileData.total_saldo || 0).toString());
      sessionStorage.setItem(`userPoin_${profileData.id}`, (profileData.total_poin || 0).toString());


      // 2. Fetch notifikasi pengguna
      // MODIFIKASI: Ambil notifikasi yang id_pengguna-nya adalah userId ATAU NULL
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifikasi')
        .select('*')
        .or(`id_pengguna.eq.${userId},id_pengguna.is.null`) // Menggunakan klausa OR
        .order('waktu', { ascending: false }); // Urutkan notifikasi terbaru dulu

      if (notificationsError) {
        throw notificationsError;
      }
      setUserNotifications(notificationsData);

    } catch (err) {
      console.error("Error fetching profile data:", err.message);
      setError("Gagal memuat data profil: " + err.message);
      // Jika terjadi error fetching, mungkin user belum terdaftar di tabel 'pengguna'
      // Atau ID di session storage tidak cocok dengan DB
      alert("Gagal memuat profil Anda. Silakan coba login ulang.");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const userSession = JSON.parse(sessionStorage.getItem('loggedUser'));
    setLoggedUserSession(userSession);

    if (userSession && userSession.id) {
      // Validasi UUID
      if (!isValidUUID(userSession.id)) {
        setError('ID pengguna tidak dalam format yang benar (UUID). Harap login ulang.');
        alert('ID pengguna tidak valid. Silakan login ulang.');
        setLoading(false);
        navigate("/login");
        return;
      }
      fetchProfileData(userSession.id);
    } else {
      setLoading(false);
      // Jika tidak ada user di session, redirect ke login
      // alert("Silakan login untuk melihat profil Anda."); // Opsional
      // navigate("/login"); // Opsional
    }
  }, [fetchProfileData, navigate]);

  // Effect untuk menghitung status membership secara asinkron (dipindahkan ke sini)
  useEffect(() => {
    if (loggedUserSession && userData) {
      getStatusMembership(loggedUserSession.id).then(status => {
          setCurrentMembershipStatus(status);
      });
    }
  }, [loggedUserSession, userData, getStatusMembership]);


  // --- Logika Penukaran Poin ---
  const handleRedeemPoin = async () => {
    const poin = parseInt(poinToRedeem);

    if (isNaN(poin) || poin <= 0) {
      setRedeemMessage("Jumlah poin harus angka positif.");
      return;
    }
    if (poin < 10) {
      setRedeemMessage("Minimal penukaran adalah 10 poin.");
      return;
    }
    if (poin > totalPoin) {
      setRedeemMessage("Poin Anda tidak mencukupi.");
      return;
    }

    setLoading(true);
    setRedeemMessage(""); // Clear previous message
    setError(null);

    const saldoEarned = poin * 100;
    const newPoin = totalPoin - poin;
    const newSaldo = totalSaldo + saldoEarned;

    try {
      // Update poin dan saldo di database
      const { error: updateError } = await supabase
        .from('pengguna')
        .update({
          total_poin: newPoin,
          total_saldo: newSaldo
        })
        .eq('id', loggedUserSession.id);

      if (updateError) {
        throw updateError;
      }

      // Update state lokal
      setTotalPoin(newPoin);
      setTotalSaldo(newSaldo);
      setPoinToRedeem('');
      setRedeemMessage(`Berhasil menukar ${poin} poin menjadi ${formatRupiah(saldoEarned)} saldo.`);

      // Update sessionStorage
      sessionStorage.setItem(`userSaldo_${loggedUserSession.id}`, newSaldo.toString());
      sessionStorage.setItem(`userPoin_${loggedUserSession.id}`, newPoin.toString());

      // Tambahkan notifikasi penukaran poin ke database
      const newNotification = {
        id_pengguna: loggedUserSession.id,
        pesan: `Poin berhasil ditukar! Anda menukar ${poin} poin menjadi ${formatRupiah(saldoEarned)} saldo.`,
        status: "belum_dibaca",
        waktu: new Date().toISOString(),
      };

      const { error: notificationError } = await supabase
        .from('notifikasi') // Nama tabel notifikasi
        .insert([newNotification]);

      if (notificationError) {
        console.error("Gagal menambahkan notifikasi:", notificationError.message);
        // Jangan throw error di sini karena penukaran poin sudah berhasil
      } else {
        // Fetch notifikasi ulang untuk menampilkan yang baru
        fetchProfileData(loggedUserSession.id);
      }

    } catch (err) {
      console.error("Gagal menukar poin:", err.message);
      setError("Gagal menukar poin: " + err.message);
      setRedeemMessage("Gagal menukar poin: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Logika Edit Profil ---
  useEffect(() => {
    if (isEditing && userData) {
      setEditedData({
        nama_lengkap: userData.nama_lengkap || '',
        email: userData.email || '',
        tempat_lahir: userData.tempat_lahir || '',
        // Pastikan tanggal_lahir diformat ke 'YYYY-MM-DD' untuk input type="date"
        tanggal_lahir: userData.tanggal_lahir ? new Date(userData.tanggal_lahir).toISOString().split('T')[0] : '', 
        jenis_kelamin: userData.jenis_kelamin || '',
        alamat: userData.alamat || '',
        nomor_hp: userData.nomor_hp || ''
      });
    }
  }, [isEditing, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('pengguna')
        .update(editedData)
        .eq('id', loggedUserSession.id);

      if (updateError) {
        throw updateError;
      }

      setUserData(prev => ({ ...prev, ...editedData })); // Update state lokal
      setIsEditing(false);
      alert("Perubahan profil berhasil disimpan!");
    } catch (err) {
      console.error("Gagal menyimpan perubahan profil:", err.message);
      setError("Gagal menyimpan perubahan profil: " + err.message);
      alert("Gagal menyimpan perubahan profil: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({}); // Reset edited data
  };


  const getMembershipIcon = (status) => {
    switch (status) {
      case 'Loyal': return <Star className="text-yellow-500" />;
      case 'Aktif': return <Activity className="text-green-500" />;
      case 'Pasif': return <ZapOff className="text-gray-500" />;
      case 'Baru': return <Clock className="text-blue-500" />;
      default: return <User className="text-gray-500" />;
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    // Periksa apakah format ISO string (dari Supabase)
    if (typeof tanggal === 'string' && tanggal.includes('T') && tanggal.includes('Z')) {
      const date = new Date(tanggal);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    // Jika format 'YYYY-MM-DD' dari input type="date", parse manual atau biarkan Date() menanganinya
    if (typeof tanggal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
      const date = new Date(tanggal + 'T00:00:00Z'); // Tambahkan waktu agar tidak masalah zona waktu
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    }
    return 'Tanggal tidak valid';
  };


  const formatWaktuNotifikasi = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } else if (diffDays > 0) {
      return `${diffDays} hari lalu`;
    } else if (diffHours > 0) {
      return `${diffHours} jam lalu`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} menit lalu`;
    } else {
      return `Baru saja`;
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('notifikasi')
        .update({ status: 'sudah_dibaca' })
        .eq('id', notificationId);

      if (updateError) {
        throw updateError;
      }

      // Update state lokal
      setUserNotifications(prevNotifications => {
        const updatedNotifications = prevNotifications.map(notif =>
          notif.id === notificationId ? { ...notif, status: "sudah_dibaca" } : notif
        );
        // Simpan notifikasi yang diperbarui ke sessionStorage (optional, tapi baik untuk konsistensi)
        if (loggedUserSession) {
          sessionStorage.setItem(`userNotifications_${loggedUserSession.id}`, JSON.stringify(updatedNotifications));
        }
        return updatedNotifications;
      });
    } catch (err) {
      console.error("Gagal menandai notifikasi sebagai dibaca:", err.message);
      setError("Gagal menandai notifikasi: " + err.message);
      alert("Gagal menandai notifikasi: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !userData) { // Tampilkan loading penuh jika data awal belum ada
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <p className="text-gray-700">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error: {error}</h2>
          <p className="text-gray-700">Mohon coba kembali nanti atau hubungi dukungan.</p>
        </div>
      </div>
    );
  }

  if (!userData) { // Jika tidak ada data pengguna setelah loading selesai (misalnya tidak login)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Pengguna tidak ditemukan atau belum login!</h2>
          <p className="text-gray-700">Mohon pastikan Anda sudah login.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Login Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col lg:flex-row gap-6 bg-gray-50 min-h-screen">
      {/* Kolom Kiri: Profil Pengguna */}
      <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Profil Pengguna
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className={`flex items-center px-4 py-2 bg-gradient-to-r from-[${primaryColor}] to-[${darkRed}] text-white rounded-lg shadow hover:shadow-md transition`}
              >
                <PenTool size={18} className="mr-2" />
                Edit Profil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className={`flex items-center px-4 py-2 bg-[${secondaryColor}] text-white rounded-lg shadow hover:bg-[${darkGreen}] transition`}
                  disabled={loading}
                >
                  <Save size={18} className="mr-2" />
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition"
                  disabled={loading}
                >
                  <X size={18} className="mr-2" />
                  Batal
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProfileFieldFixed
              label="NIK"
              value={userData.nik || '-'}
              icon={<Hash size={20} />}
              fieldColor={primaryColor}
            />

            <ProfileField
              label="Nama Lengkap"
              name="nama_lengkap"
              value={isEditing ? editedData.nama_lengkap : userData.nama_lengkap}
              icon={<User size={20} />}
              isEditing={isEditing}
              onChange={handleChange}
              fieldColor={primaryColor}
            />

            <ProfileField
              label="Email"
              name="email"
              type="email"
              value={isEditing ? editedData.email : userData.email}
              icon={<Mail size={20} />}
              isEditing={isEditing}
              onChange={handleChange}
              fieldColor={primaryColor}
              // Email biasanya tidak bisa diedit jika dikelola oleh Supabase Auth
              readOnly={true} // Atur readOnly agar tidak bisa diedit
            />

            <ProfileField
              label="Tempat Lahir"
              name="tempat_lahir"
              value={isEditing ? editedData.tempat_lahir : userData.tempat_lahir}
              icon={<MapPin size={20} />}
              isEditing={isEditing}
              onChange={handleChange}
              fieldColor={primaryColor}
            />
            <ProfileField
              label="Tanggal Lahir"
              name="tanggal_lahir"
              type="date" // Menggunakan type="date" untuk input tanggal
              value={isEditing ? editedData.tanggal_lahir : (userData.tanggal_lahir ? new Date(userData.tanggal_lahir).toISOString().split('T')[0] : '')}
              icon={<Calendar size={20} />}
              isEditing={isEditing}
              onChange={handleChange}
              fieldColor={primaryColor}
            />
            <ProfileField
              label="Jenis Kelamin"
              name="jenis_kelamin"
              value={isEditing ? editedData.jenis_kelamin : userData.jenis_kelamin}
              icon={<User size={20} />}
              isEditing={isEditing}
              onChange={handleChange}
              type="select"
              options={['Laki-laki', 'Perempuan', 'Lain-lain']} // Tambahkan opsi untuk select
              fieldColor={primaryColor}
            />
            <ProfileField
              label="Alamat"
              name="alamat"
              value={isEditing ? editedData.alamat : userData.alamat}
              icon={<MapPin size={20} />}
              isEditing={isEditing}
              onChange={handleChange}
              type="textarea"
              fieldColor={primaryColor}
              className="col-span-1 md:col-span-2 lg:col-span-3"
            />
            <ProfileField
              label="Nomor HP"
              name="nomor_hp"
              value={isEditing ? editedData.nomor_hp : userData.nomor_hp}
              icon={<Phone size={20} />}
              isEditing={isEditing}
              onChange={handleChange}
              fieldColor={primaryColor}
            />

            <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileFieldFixed
                label="Status Membership"
                value={currentMembershipStatus} // Menggunakan state untuk status
                icon={getMembershipIcon(currentMembershipStatus)}
                className="col-span-1"
                fieldColor={primaryColor}
              />
              <ProfileFieldFixed
                label="Total Saldo"
                value={formatRupiah(totalSaldo)}
                icon={<Coins size={20} />}
                className="col-span-1"
                fieldColor={secondaryColor}
              />
            </div>
          </div>

          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Gift size={22} className={`mr-2 text-[${secondaryColor}]`} /> Tukar Poin Membership Anda
            </h3>

            <div className="mb-4 text-gray-700">
              <p className="font-semibold text-lg">
                Poin Anda Saat Ini: <span className={`text-[${secondaryColor}]`}>{totalPoin} Poin</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Anda mendapatkan 1 Poin untuk setiap kelipatan Rp 10.000 transaksi.
              </p>
            </div>

            <div className={`mb-6 p-3 bg-[${lightRed}]/50 rounded-md border border-[${primaryColor}]/30`}>
              <p className={`font-semibold text-[${primaryColor}]`}>Kriteria Penukaran Poin:</p>
              <ul className={`list-disc list-inside text-sm text-[${primaryColor}]`}>
                <li>Minimal penukaran: <span className="font-bold">10 Poin</span></li>
                <li>Setiap 1 Poin bernilai <span className="font-bold">{formatRupiah(100)}</span> saldo.</li>
                <li>Poin yang ditukarkan akan mengurangi total poin Anda.</li>
                <li>Poin yang sudah ditukar tidak dapat dikembalikan.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="number"
                min="10"
                max={totalPoin}
                value={poinToRedeem === 0 ? '' : poinToRedeem}
                onChange={(e) => setPoinToRedeem(e.target.value === '' ? '' : parseInt(e.target.value))}
                className={`p-3 border border-gray-300 rounded-md w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-[${secondaryColor}] transition-all`}
                placeholder="Jumlah poin (min 10)"
                disabled={loading}
              />
              <button
                onClick={handleRedeemPoin}
                disabled={
                  poinToRedeem < 10 ||
                  poinToRedeem > totalPoin ||
                  isNaN(poinToRedeem) ||
                  poinToRedeem === '' ||
                  loading
                }
                className={`px-6 py-3 bg-gradient-to-r from-[${secondaryColor}] to-[${darkGreen}] text-white rounded-md font-semibold hover:from-[${darkGreen}] hover:to-[${secondaryColor}] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer`}
              >
                {loading ? 'Menukar...' : 'Tukarkan Poin'}
              </button>
            </div>

            {redeemMessage && (
              <p className={`text-sm mt-3 ${redeemMessage.includes("berhasil") ? "text-green-600" : "text-red-600"} font-medium`}>
                {redeemMessage}
              </p>
            )}

            {poinToRedeem !== '' && poinToRedeem < 10 && (
              <p className="text-sm mt-2 text-red-500">Minimal penukaran adalah 10 poin.</p>
            )}
            {poinToRedeem > totalPoin && (
              <p className="text-sm mt-2 text-red-500">Poin tidak mencukupi.</p>
            )}
            {poinToRedeem === '' && (
              <p className="text-sm mt-2 text-gray-500">Masukkan jumlah poin yang ingin ditukar.</p>
            )}
          </div>
        </div>
      </div>

      {/* Kolom Kanan: Notifikasi */}
      <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className={`p-3 rounded-full bg-[${primaryColor}]/10 mr-4`}>
            <Bell className={`text-[${primaryColor}] w-6 h-6`} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Notifikasi Anda</h2>
            <p className="text-gray-600">Pesan dan informasi terbaru untuk Anda</p>
          </div>
        </div>

        {userNotifications.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
            <p className="text-gray-600">Tidak ada notifikasi baru.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {userNotifications.map(notif => (
              <div
                key={notif.id}
                className={`flex items-start p-4 rounded-lg border shadow-sm transition-all duration-200
                  ${notif.status === 'belum_dibaca' ? `bg-[${lightRed}] border-[${primaryColor}]/30` : 'bg-gray-50 border-gray-200'}
                  hover:shadow-md`}
              >
                <div className={`p-2 rounded-full mr-3 ${notif.status === 'belum_dibaca' ? `bg-[${primaryColor}]/20 text-[${primaryColor}]` : 'bg-gray-200 text-gray-600'}`}>
                  {notif.status === 'belum_dibaca' ? <Bell size={18} /> : <CheckCircle size={18} />}
                </div>
                <div className="flex-grow">
                  <p className={`font-semibold ${notif.status === 'belum_dibaca' ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notif.pesan}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatWaktuNotifikasi(notif.waktu)}
                  </p>
                </div>
                {notif.status === 'belum_dibaca' && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className={`ml-3 px-3 py-1 text-xs bg-[${primaryColor}] text-white rounded-md hover:bg-[${darkRed}] transition-colors flex-shrink-0`}
                    title="Tandai sudah dibaca"
                    disabled={loading}
                  >
                    Tandai Baca
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Komponen ProfileField
const ProfileField = ({ label, name, value, icon, isEditing, onChange, type = "text", options, fieldColor, className, readOnly = false }) => (
  <div className={`p-3 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[90px] flex flex-col justify-between ${className || ''}`}>
    <p className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
      {React.cloneElement(icon, { color: fieldColor })} <span>{label}</span>
    </p>
    {isEditing ? (
      type === "textarea" ? (
        <textarea name={name} value={value} onChange={onChange} readOnly={readOnly} className={`w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[${fieldColor}] focus:border-transparent outline-none text-base text-gray-800 box-border resize-y min-h-[40px] ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} rows="3"></textarea>
      ) : type === "select" ? (
        <select name={name} value={value} onChange={onChange} readOnly={readOnly} className={`w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[${fieldColor}] focus:border-transparent outline-none text-base text-gray-800 bg-white box-border ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} readOnly={readOnly} className={`w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[${fieldColor}] focus:border-transparent outline-none text-base text-gray-800 box-border ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`} />
      )
    ) : (
      <p className="text-base font-semibold text-gray-800 min-h-[32px] flex items-center flex-grow break-words">{value || '-'}</p>
    )}
  </div>
);

// Komponen ProfileFieldFixed
const ProfileFieldFixed = ({ label, value, icon, className, fieldColor }) => (
  <div className={`p-3 bg-gray-100 rounded-lg shadow-sm border border-gray-200 min-h-[90px] flex flex-col justify-between ${className || ''}`}>
    <p className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
      {React.cloneElement(icon, { color: fieldColor })} <span>{label}</span>
    </p>
    <p className="text-base font-semibold text-gray-800 min-h-[32px] flex items-center flex-grow break-words">
      {value || '-'}
    </p>
  </div>
);