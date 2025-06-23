import { TransaksiDummy } from "./TransaksiDummy";
import { UserDummy } from "./UserDummy";

function generateNotifikasiDummy() {
  const notifikasi = [];
  let notifId = 1;

  TransaksiDummy.forEach((trx) => {
    const total = trx.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 1. Notifikasi Transaksi
    notifikasi.push({
      id: notifId++,
      userId: trx.userId,
      pesan: `Transaksi #${trx.id} berhasil dilakukan.`,
      status: "belum_dibaca",
      waktu: trx.tanggalPembelian,
    });

    // 2. Notifikasi Poin Reward
    const poin = Math.floor(total / 10000);
    if (poin > 0) {
      notifikasi.push({
        id: notifId++,
        userId: trx.userId,
        pesan: `Kamu mendapatkan ${poin} poin dari pembelian!`,
        status: "belum_dibaca",
        waktu: trx.tanggalPembelian,
      });
    }
  });

  // 3. Notifikasi Umum (optional, broadcast untuk semua user)
  const umum = [
    "Jangan lewatkan promo diskon 20% minggu ini!",
    "Cek produk baru di Fresh Mart!",
    "Dapatkan cashback jika belanja minimal Rp50.000!"
  ];

  UserDummy.filter(u => u.role === "user").forEach(user => {
    const pesan = umum[Math.floor(Math.random() * umum.length)];
    notifikasi.push({
      id: notifId++,
      userId: user.id,
      pesan,
      status: "belum_dibaca",
      waktu: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  });

  // Sort berdasarkan waktu terbaru
  return notifikasi.sort((a, b) => new Date(b.waktu) - new Date(a.waktu));
}

export const NotifikasiDummy = generateNotifikasiDummy();