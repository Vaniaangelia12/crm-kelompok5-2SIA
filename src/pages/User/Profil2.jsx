import React, { useState, useEffect, useMemo } from 'react';
import { UserDummy } from '../../data/UserDummy';
import { TransaksiDummy } from '../../data/TransaksiDummy';
// Hapus import NotifikasiDummy jika Anda tidak ingin menggunakannya sebagai default
// import { NotifikasiDummy } from '../../data/NotifikasiDummy'; // Hapus ini jika hanya ingin notifikasi dinamis

import {
  User, Mail, Calendar, MapPin, Phone, Award, ClipboardList, PenTool, Save, X, Hash,
  Gift, Coins, Bell, CheckCircle, Clock, Star, Activity, ZapOff
} from 'lucide-react';

export default function Profile2() {
  const [user, setLoggedInUser] = useState(() => {
    const storedUser = sessionStorage.getItem('loggedUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const initialUserData = useMemo(() => {
    return user ? UserDummy.find(u => u.id === user.id) || {} : {};
  }, [user]);

  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});

  const [totalPoin, setTotalPoin] = useState(0);
  const [poinToRedeem, setPoinToRedeem] = useState('');
  const [redeemMessage, setRedeemMessage] = useState("");

  const [totalSaldo, setTotalSaldo] = useState(0);
  // Inisialisasi userNotifications dari sessionStorage atau array kosong
  const [userNotifications, setUserNotifications] = useState([]);

  const primaryColor = '#E81F25';
  const secondaryColor = '#3F9540';
  const lightRed = '#FFEBEE';
  const lightGreen = '#E8F5E9';
  const darkRed = '#C2181B';
  const darkGreen = '#2E7C30';

  useEffect(() => {
    if (user && user.role === "user") {
      // PERBAIKAN: Load userData di sini agar selalu sinkron
      setUserData(UserDummy.find(u => u.id === user.id) || {});

      // Load totalPoin from sessionStorage or calculate it
      const savedPoin = sessionStorage.getItem(`userPoin_${user.id}`);
      if (savedPoin !== null) {
        setTotalPoin(parseInt(savedPoin, 10));
      } else {
        const transaksiUser = TransaksiDummy.filter(trx => trx.userId === user.id);
        let calculatedPoin = 0;
        transaksiUser.forEach(trx => {
          const totalPembelian = trx.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          calculatedPoin += Math.floor(totalPembelian / 10000);
        });
        setTotalPoin(calculatedPoin);
        // Simpan poin awal ke sessionStorage agar persisten
        sessionStorage.setItem(`userPoin_${user.id}`, calculatedPoin.toString());
      }

      // Load totalSaldo from sessionStorage
      const savedSaldo = sessionStorage.getItem(`userSaldo_${user.id}`);
      setTotalSaldo(savedSaldo ? parseFloat(savedSaldo) : 0);

      // Load notifications from sessionStorage or use a default (or generate)
      const savedNotifications = sessionStorage.getItem(`userNotifications_${user.id}`);
      if (savedNotifications) {
        setUserNotifications(JSON.parse(savedNotifications).sort((a, b) => new Date(b.waktu) - new Date(a.waktu)));
      } else {
        // Jika tidak ada di sessionStorage, generate dari TransaksiDummy
        // Atau biarkan kosong dan hanya tambahkan notifikasi penukaran poin
        const initialNotifications = generateInitialNotifications(user.id); // Fungsi baru untuk generate awal
        setUserNotifications(initialNotifications.sort((a, b) => new Date(b.waktu) - new Date(a.waktu)));
        sessionStorage.setItem(`userNotifications_${user.id}`, JSON.stringify(initialNotifications));
      }

    } else {
      // Reset state jika user tidak ada
      setUserData({});
      setTotalPoin(0);
      setTotalSaldo(0);
      setUserNotifications([]);
    }
  }, [user]);

  // Fungsi bantu untuk generate notifikasi awal (seperti NotifikasiDummy)
  const generateInitialNotifications = (userId) => {
    const notifications = [];
    let notifId = 1; // ID sementara, akan diganti oleh sistem nyata

    // Notifikasi Transaksi dan Poin Reward dari TransaksiDummy
    const transaksiUser = TransaksiDummy.filter(trx => trx.userId === userId);
    transaksiUser.forEach(trx => {
      const total = trx.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      notifications.push({
        id: notifId++,
        userId: trx.userId,
        pesan: `Transaksi #${trx.id} berhasil dilakukan.`,
        status: "belum_dibaca",
        waktu: trx.tanggalPembelian,
      });

      const poin = Math.floor(total / 10000);
      if (poin > 0) {
        notifications.push({
          id: notifId++,
          userId: trx.userId,
          pesan: `Kamu mendapatkan ${poin} poin dari pembelian!`,
          status: "belum_dibaca",
          waktu: trx.tanggalPembelian,
        });
      }
    });

    // Notifikasi Umum (jika ingin dimasukkan juga)
    const umum = [
      "Jangan lewatkan promo diskon 20% minggu ini!",
      "Cek produk baru di Fresh Mart!",
      "Dapatkan cashback jika belanja minimal Rp50.000!"
    ];
    const userGeneralNotification = umum[Math.floor(Math.random() * umum.length)];
    notifications.push({
      id: notifId++,
      userId: userId,
      pesan: userGeneralNotification,
      status: "belum_dibaca",
      waktu: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    return notifications;
  };


  const handleRedeemPoin = () => {
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

    const saldoEarned = poin * 100;
    const newPoin = totalPoin - poin;
    const newSaldo = totalSaldo + saldoEarned;

    setTotalPoin(newPoin);
    setTotalSaldo(newSaldo);
    setPoinToRedeem('');
    setRedeemMessage(`Berhasil menukar ${poin} poin menjadi ${formatRupiah(saldoEarned)} saldo.`);

    if (user) {
      sessionStorage.setItem(`userSaldo_${user.id}`, newSaldo.toString());
      sessionStorage.setItem(`userPoin_${user.id}`, newPoin.toString());

      // --- LOGIKA MENAMBAH NOTIFIKASI PENUKARAN POIN ---
      const newNotification = {
        id: Date.now(), // Gunakan timestamp sebagai ID unik sementara
        userId: user.id,
        pesan: `Poin berhasil ditukar! Anda menukar ${poin} poin menjadi ${formatRupiah(saldoEarned)} saldo.`,
        status: "belum_dibaca",
        waktu: new Date().toISOString(), // Waktu saat ini
      };

      // Update state notifikasi
      setUserNotifications(prevNotifications => {
        const updatedNotifications = [newNotification, ...prevNotifications]; // Tambahkan di paling atas
        // Simpan notifikasi yang diperbarui ke sessionStorage
        sessionStorage.setItem(`userNotifications_${user.id}`, JSON.stringify(updatedNotifications));
        return updatedNotifications;
      });
      // --- AKHIR LOGIKA MENAMBAH NOTIFIKASI PENUKARAN POIN ---
    }
  };

  const statusMembership = getStatusMembership(userData.id, userData.tanggal_bergabung);

  const getMembershipIcon = () => {
    switch (statusMembership) {
      case 'Loyal': return <Star className="text-yellow-500" />;
      case 'Aktif': return <Activity className="text-green-500" />;
      case 'Pasif': return <ZapOff className="text-gray-500" />;
      default: return <Clock className="text-blue-500" />;
    }
  };

  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

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

  if (!userData || !user) {
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
    alert("Perubahan berhasil disimpan!");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return '-';
    const parts = tanggal.split('-');
    if (parts.length !== 3 || parts.some(part => isNaN(parseInt(part)))) {
      return 'Tanggal tidak valid';
    }
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime()) || date.getFullYear() !== year || (date.getMonth() + 1) !== month || date.getDate() !== day) {
      return 'Tanggal tidak valid';
    }
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const handleMarkAsRead = (notificationId) => {
    setUserNotifications(prevNotifications => {
      const updatedNotifications = prevNotifications.map(notif =>
        notif.id === notificationId ? { ...notif, status: "sudah_dibaca" } : notif
      );
      // Simpan perubahan status ke sessionStorage
      if (user) {
        sessionStorage.setItem(`userNotifications_${user.id}`, JSON.stringify(updatedNotifications));
      }
      return updatedNotifications;
    });
  };

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
                >
                  <Save size={18} className="mr-2" />
                  Simpan
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg shadow hover:bg-gray-600 transition"
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
              value={userData.NIK}
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
            />

            <ProfileFieldFixed
              label="Tempat Lahir"
              value={userData.tempat_lahir}
              icon={<MapPin size={20} />}
              fieldColor={primaryColor}
            />
            <ProfileFieldFixed
              label="Tanggal Lahir"
              value={formatTanggal(userData.tanggal_lahir)}
              icon={<Calendar size={20} />}
              fieldColor={primaryColor}
            />
            <ProfileFieldFixed
              label="Jenis Kelamin"
              value={userData.jenis_kelamin}
              icon={<User size={20} />}
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
            <ProfileFieldFixed
              label="Nomor HP"
              value={userData.nomor_hp}
              icon={<Phone size={20} />}
              fieldColor={primaryColor}
            />

            <div className="md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <ProfileFieldFixed
                label="Status Membership"
                value={statusMembership}
                icon={getMembershipIcon()}
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
              />
              <button
                onClick={handleRedeemPoin}
                disabled={
                  poinToRedeem < 10 ||
                  poinToRedeem > totalPoin ||
                  isNaN(poinToRedeem) ||
                  poinToRedeem === ''
                }
                className={`px-6 py-3 bg-gradient-to-r from-[${secondaryColor}] to-[${darkGreen}] text-white rounded-md font-semibold hover:from-[${darkGreen}] hover:to-[${secondaryColor}] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer`}
              >
                Tukarkan Poin
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

// Fungsi getStatusMembership (tetap sama, dengan catatan masalah parsing tanggal yang mungkin muncul)
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

// Komponen ProfileField
const ProfileField = ({ label, name, value, icon, isEditing, onChange, type = "text", options, fieldColor, className }) => (
  <div className={`p-3 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[90px] flex flex-col justify-between ${className || ''}`}>
    <p className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
      {React.cloneElement(icon, { color: fieldColor })} <span>{label}</span>
    </p>
    {isEditing ? (
      type === "textarea" ? (
        <textarea name={name} value={value} onChange={onChange} className={`w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[${fieldColor}] focus:border-transparent outline-none text-base text-gray-800 box-border resize-y min-h-[40px]` } rows="3"></textarea>
      ) : type === "select" ? (
        <select name={name} value={value} onChange={onChange} className={`w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[${fieldColor}] focus:border-transparent outline-none text-base text-gray-800 bg-white box-border`}>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} className={`w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[${fieldColor}] focus:border-transparent outline-none text-base text-gray-800 box-border`} />
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