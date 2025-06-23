import React, { useState, useEffect } from 'react';
import { UserDummy } from '../data/UserDummy';
import { TransaksiDummy } from '../data/TransaksiDummy';
import {
  User, Mail, Calendar, MapPin, Phone, Award, ClipboardList, PenTool, Save, X, Hash,
  Gift,
  Coins
} from 'lucide-react';

export default function Profile2() {
  const user = JSON.parse(sessionStorage.getItem('loggedUser'));
  // Pastikan initialUserData tidak null atau undefined
  const initialUserData = UserDummy.find(u => u.id === user?.id) || {};

  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  const [totalPoin, setTotalPoin] = useState(0);
  const [poinToRedeem, setPoinToRedeem] = useState(''); // Ubah ke string agar input kosong bisa ditangani
  const [redeemMessage, setRedeemMessage] = useState("");

  const [totalSaldo, setTotalSaldo] = useState(0); // State baru untuk saldo

  useEffect(() => {
    if (user && user.role === "user") {
      const transaksiUser = TransaksiDummy.filter(trx => trx.userId === user.id);

      // Hitung total poin
      let calculatedPoin = 0;
      transaksiUser.forEach(trx => {
        const totalPembelian = trx.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        calculatedPoin += Math.floor(totalPembelian / 10000); // 1 poin setiap Rp 10.000
      });
      setTotalPoin(calculatedPoin);

      // Ambil saldo yang tersimpan (jika ada)
      const savedSaldo = sessionStorage.getItem(`userSaldo_${user.id}`);
      if (savedSaldo) {
        setTotalSaldo(parseFloat(savedSaldo));
      } else {
        // Jika belum ada saldo tersimpan, inisialisasi dengan 0
        setTotalSaldo(0);
      }
    }
  }, [user]); // Dependensi hanya pada `user` karena data transaksi dan saldo terkait langsung dengannya saat load

  const handleRedeemPoin = () => {
    // Pastikan poinToRedeem adalah angka dan lebih besar dari 0
    const poin = parseInt(poinToRedeem);

    if (isNaN(poin) || poin <= 0) { // Menambah validasi untuk angka positif
      setRedeemMessage("Jumlah poin harus angka positif.");
      return;
    }
    if (poin < 10) { // Validasi minimal penukaran
      setRedeemMessage("Minimal penukaran adalah 10 poin.");
      return;
    }
    if (poin > totalPoin) {
      setRedeemMessage("Poin Anda tidak mencukupi.");
      return;
    }

    // Logika penukaran: 1 poin = Rp 100 (contoh, sesuaikan rate Anda)
    const saldoEarned = poin * 100; // Contoh: 1 poin = Rp 100

    setTotalPoin(prevPoin => prevPoin - poin);
    setTotalSaldo(prevSaldo => {
      const newSaldo = prevSaldo + saldoEarned;
      // Simpan saldo yang diperbarui ke sessionStorage
      if (user) { // Gunakan 'user' bukan 'loggedUser' karena sudah ada di scope
        sessionStorage.setItem(`userSaldo_${user.id}`, newSaldo.toString());
      }
      return newSaldo;
    });

    setPoinToRedeem(''); // Kosongkan input setelah penukaran
    setRedeemMessage(`Berhasil menukar ${poin} poin menjadi ${formatRupiah(saldoEarned)} saldo.`);

    // Opsional: Jika Anda juga ingin memperbarui totalPoin di sessionStorage
    if (user) {
      sessionStorage.setItem(`userPoin_${user.id}`, (totalPoin - poin).toString());
    }

    // Opsional: Lakukan request ke backend untuk menyimpan perubahan poin/saldo secara permanen
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Pastikan getStatusMembership dan getTotalPoin didefinisikan di luar komponen
  // atau diteruskan sebagai props jika mereka berada di file lain
  const statusMembership = getStatusMembership(userData.id, userData.tanggal_bergabung);

  useEffect(() => {
    if (isEditing) {
      setEditedData({
        nama_lengkap: userData.nama_lengkap,
        email: userData.email,
        tempat_lahir: userData.tempat_lahir,
        tanggal_lahir: userData.tanggal_lahir,
        jenis_kelamin: userData.jenis_kelamin,
        alamat: userData.alamat,
      });
    }
  }, [isEditing, userData]);

  if (!userData || !user) { // Tambahkan !user check
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error: Pengguna tidak ditemukan atau belum login!</h2>
          <p className="text-gray-700">Mohon pastikan Anda sudah login.</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setUserData(prev => ({ ...prev, ...editedData }));
    setIsEditing(false);
    // TODO: Update UserDummy atau kirim ke backend
    alert("Perubahan berhasil disimpan!");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    const parts = tanggal.split('-');
    if (parts.length !== 3) return 'Tanggal tidak valid';
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // Ubah menjadi YYYY-MM-DD
    const date = new Date(formattedDate);
    if (isNaN(date.getTime())) {
      return 'Tanggal tidak valid';
    }
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const freshGreen = '#3F9540';
  const freshGreenLight = '#6ECC6F'; // Tidak digunakan di sini, tapi biarkan
  const freshGreenDark = '#2E7C30';

  return (
    <div className="flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 w-full max-w-10xl border border-gray-200">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center mb-8 md:mb-10">Profil Pengguna</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mx-auto">
          <ProfileFieldFixed label="NIK" value={userData.NIK} icon={<Hash size={20} color={freshGreenDark} />} freshGreenDark={freshGreenDark} />
          <ProfileField label="Nama Lengkap" name="nama_lengkap" value={isEditing ? editedData.nama_lengkap : userData.nama_lengkap} icon={<User size={20} color={freshGreenDark} />} isEditing={isEditing} onChange={handleChange} freshGreen={freshGreen} freshGreenDark={freshGreenDark} />
          <ProfileField label="Email" name="email" type="email" value={isEditing ? editedData.email : userData.email} icon={<Mail size={20} color={freshGreenDark} />} isEditing={isEditing} onChange={handleChange} freshGreen={freshGreen} freshGreenDark={freshGreenDark} />
          <ProfileFieldFixed label="Tempat Lahir" value={userData.tempat_lahir} icon={<MapPin size={20} color={freshGreenDark} />} freshGreenDark={freshGreenDark} />
          <ProfileFieldFixed label="Tanggal Lahir" value={formatTanggal(userData.tanggal_lahir)} icon={<Calendar size={20} color={freshGreenDark} />} freshGreenDark={freshGreenDark} />
          <ProfileFieldFixed label="Jenis Kelamin" value={userData.jenis_kelamin} icon={<User size={20} color={freshGreenDark} />} freshGreenDark={freshGreenDark} />
          <ProfileField label="Alamat" name="alamat" value={isEditing ? editedData.alamat : userData.alamat} icon={<MapPin size={20} color={freshGreenDark} />} isEditing={isEditing} onChange={handleChange} type="textarea" freshGreen={freshGreen} freshGreenDark={freshGreenDark} className="col-span-1 sm:col-span-2 lg:col-span-3" />
          <ProfileFieldFixed label="Nomor HP" value={userData.nomor_hp} icon={<Phone size={20} color={freshGreenDark} />} freshGreenDark={freshGreenDark} />
          <ProfileFieldFixed
            label="Status Membership"
            value={statusMembership}
            icon={<Award size={20} color={freshGreenDark} />}
            className="col-span-1 sm:col-span-2 lg:col-span-1"
            freshGreenDark={freshGreenDark}
          />
          <ProfileFieldFixed
            label="Total Saldo"
            value={formatRupiah(totalSaldo)}
            icon={<Coins size={20} color={freshGreenDark} />}
            className="col-span-1 sm:col-span-2 lg:col-span-1"
            freshGreenDark={freshGreenDark}
          />

          {/* Form Penukaran Poin */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 col-span-full shadow-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Tukar Poin Membership Anda</h3>

            {/* Informasi Poin Saat Ini */}
            <div className="mb-4 text-gray-700">
              <p className="font-semibold text-lg">Poin Anda Saat Ini: <span className="text-[#3F9540]">{totalPoin} Poin</span></p>
              <p className="text-sm text-gray-500 mt-1">
                Anda mendapatkan 1 Poin untuk setiap kelipatan Rp 10.000 transaksi.
              </p>
            </div>

            {/* Kriteria Penukaran */}
            <div className="mb-6 p-3 bg-[#E81F25]/10 rounded-md border border-[#E81F25]/20">
              <p className="font-semibold text-[#E81F25]">Kriteria Penukaran Poin:</p>
              <ul className="list-disc list-inside text-sm text-[#E81F25]">
                <li>Minimal penukaran: <span className="font-bold">10 Poin</span></li>
                <li>Poin yang ditukarkan akan mengurangi total poin Anda.</li>
                <li>Poin yang sudah ditukar tidak dapat dikembalikan.</li>
              </ul>
            </div>

            {/* Input dan Tombol Penukaran */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="number"
                min="10" // Minimal poin yang bisa dimasukkan
                max={totalPoin}
                value={poinToRedeem === 0 ? '' : poinToRedeem} // Tampilkan kosong jika 0
                onChange={(e) => setPoinToRedeem(e.target.value === '' ? '' : parseInt(e.target.value))} // Tangani input kosong
                className="p-3 border border-gray-300 rounded-md w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-[#3F9540] transition-all"
                placeholder="Jumlah poin (min 10)"
              />
              <button
                onClick={handleRedeemPoin}
                disabled={
                  poinToRedeem < 10 ||
                  poinToRedeem > totalPoin ||
                  isNaN(poinToRedeem) ||
                  poinToRedeem === '' // Memastikan input tidak kosong (dalam konteks ini)
                }
                className="px-6 py-3 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white rounded-md font-semibold hover:from-[#2E7C30] hover:to-[#3F9540] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer"
              >
                Tukarkan Poin
              </button>
            </div>

            {/* Pesan Setelah Penukaran */}
            {redeemMessage && (
              <p className={`text-sm mt-3 ${redeemMessage.includes("berhasil") ? "text-green-600" : "text-red-600"} font-medium`}>
                {redeemMessage}
              </p>
            )}

            {/* Pesan Validasi Input (jika diperlukan) */}
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

        <div className="mt-8 md:mt-10 flex justify-center space-x-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-5 py-2.5 bg-[#3F9540] text-white font-semibold rounded-lg shadow-md hover:bg-[#2E7C30] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75 text-base cursor-pointer"
            >
              <PenTool size={18} className="mr-2" /> Edit Profil
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="flex items-center px-5 py-2.5 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white font-semibold rounded-lg shadow-md hover:from-[#2E7C30] hover:to-[#3F9540] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75 text-base cursor-pointer"
              >
                <Save size={18} className="mr-2" /> Simpan
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center px-5 py-2.5 bg-[#E81F25] text-white font-semibold rounded-lg shadow-md hover:bg-[#C2181B] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E81F25] focus:ring-opacity-75 text-base cursor-pointer"
              >
                <X size={18} className="mr-2" /> Batal
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

// Fungsi getStatusMembership dan getTotalPoin tetap di luar komponen jika tidak ada perubahan
function getStatusMembership(userId, tanggalBergabung) {
  const transaksiUser = TransaksiDummy.filter(trx => trx.userId === userId);
  const now = new Date();

  if (!tanggalBergabung) return "Baru";

  const joinedAt = new Date(tanggalBergabung);
  const selisihHari = Math.floor((now - joinedAt) / (1000 * 60 * 60 * 24));
  if (selisihHari < 7 && transaksiUser.length === 0) return "Baru";

  const transaksi7Hari = transaksiUser.filter(trx => (now - new Date(trx.tanggalPembelian)) / (1000 * 60 * 60 * 24) <= 7);
  if (transaksi7Hari.length >= 5) return "Loyal";
  if (transaksi7Hari.length >= 2) return "Aktif";

  const transaksi30Hari = transaksiUser.filter(trx => (now - new Date(trx.tanggalPembelian)) / (1000 * 60 * 60 * 24) <= 30);
  if (transaksi30Hari.length === 0) return "Pasif";

  return "Aktif";
}

// Fungsi getTotalPoin tidak digunakan di komponen ini secara langsung, tapi tidak masalah jika ada
// const getTotalPoin = (userId) => {
//   const transaksiUser = TransaksiDummy.filter(trx => trx.userId === userId);
//   const totalBelanja = transaksiUser.reduce((acc, trx) => {
//     const totalPerTransaksi = trx.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
//     return acc + totalPerTransaksi;
//   }, 0);

//   return Math.floor(totalBelanja / 10000); // 1 poin per Rp10.000
// };


// Komponen ProfileField
const ProfileField = ({ label, name, value, icon, isEditing, onChange, type = "text", options, displayValue, freshGreen, freshGreenDark, className }) => (
  <div className={`p-3 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[90px] flex flex-col justify-between ${className || ''}`}>
    <p className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
      {icon} <span>{label}</span>
    </p>
    {isEditing ? (
      type === "textarea" ? (
        <textarea name={name} value={value} onChange={onChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--fresh-green] focus:border-transparent outline-none text-base text-gray-800 box-border resize-y min-h-[40px]" style={{ '--fresh-green': freshGreen }} rows="3"></textarea>
      ) : type === "select" ? (
        <select name={name} value={value} onChange={onChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--fresh-green] focus:border-transparent outline-none text-base text-gray-800 bg-white box-border" style={{ '--fresh-green': freshGreen }}>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--fresh-green] focus:border-transparent outline-none text-base text-gray-800 box-border" style={{ '--fresh-green': freshGreen }} />
      )
    ) : (
      <p className="text-base font-semibold text-gray-800 min-h-[32px] flex items-center flex-grow break-words">{value || '-'}</p>
    )}
  </div>
);

// Komponen ProfileFieldFixed
const ProfileFieldFixed = ({ label, value, icon, className, freshGreenDark }) => (
  <div className={`p-3 bg-gray-100 rounded-lg shadow-sm border border-gray-200 min-h-[90px] flex flex-col justify-between ${className || ''}`}>
    <p className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
      {icon} <span>{label}</span>
    </p>
    <p className="text-base font-semibold text-gray-800 min-h-[32px] flex items-center flex-grow break-words">
      {value || '-'}
    </p>
  </div>
);