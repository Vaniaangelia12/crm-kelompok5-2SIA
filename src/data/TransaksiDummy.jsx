import { UserDummy } from './UserDummy';
import { ProductDummy } from './ProductDummy';

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateTransaksiDummy() {
  const transaksi = [];
  const now = new Date();

  // Filter user role user saja
  const users = UserDummy.filter(u => u.role === 'user');

  // Bagi user ke kelompok status
  const baruUsers = users.filter(u => {
    const joinedAt = new Date(u.tanggal_bergabung);
    const diffDays = (now - joinedAt) / (1000 * 60 * 60 * 24);
    return diffDays < 7;
  });

  // Sisanya selain baru, bagi secara acak ke loyal, aktif, pasif, dan normal
  const otherUsers = users.filter(u => !baruUsers.includes(u));

  // Bagi otherUsers ke 3 kelompok secara proporsional
  const loyalUsers = otherUsers.slice(0, Math.floor(otherUsers.length * 0.2)); // 20%
  const aktifUsers = otherUsers.slice(loyalUsers.length, loyalUsers.length + Math.floor(otherUsers.length * 0.3)); // 30%
  const pasifUsers = otherUsers.slice(loyalUsers.length + aktifUsers.length); // sisanya 50%

  let transIdCounter = 1;

  // Fungsi bantu buat transaksi
  function buatTransaksi(userId, jumlahTransaksi, rangeHariStart, rangeHariEnd) {
    for (let i = 0; i < jumlahTransaksi; i++) {
      const itemCount = getRandomInt(1, 3);
      const items = [];
      const productIndices = new Set();
      while (productIndices.size < itemCount) {
        productIndices.add(getRandomInt(0, ProductDummy.length - 1));
      }
      for (const idx of productIndices) {
        const product = ProductDummy[idx];
        const quantity = getRandomInt(1, 3);
        items.push({
          productId: product.id,
          quantity,
          price: product.price,
        });
      }

      // Tanggal pembelian acak dalam rentang hari yang ditentukan
      const tanggalPembelian = getRandomDate(
        new Date(now.getTime() - rangeHariEnd * 24 * 60 * 60 * 1000),
        new Date(now.getTime() - rangeHariStart * 24 * 60 * 60 * 1000)
      );

      transaksi.push({
        id: `trans_${transIdCounter.toString().padStart(4, '0')}`,
        userId,
        tanggalPembelian: tanggalPembelian.toISOString(),
        items,
      });
      transIdCounter++;
    }
  }

  // 1. User Baru: tanpa transaksi (atau sangat sedikit, misal 0)
  // biarkan tanpa transaksi supaya status "Baru" muncul

  // 2. User Loyal: >=5 transaksi dalam 7 hari terakhir
  loyalUsers.forEach(user => {
    buatTransaksi(user.id, getRandomInt(5, 8), 0, 7);
  });

  // 3. User Aktif: 2-4 transaksi dalam 7 hari terakhir
  aktifUsers.forEach(user => {
    buatTransaksi(user.id, getRandomInt(2, 4), 0, 7);
  });

  // 4. User Pasif: transaksi hanya >30 hari lalu atau tidak ada transaksi
  pasifUsers.forEach(user => {
    // 50% user pasif tanpa transaksi
    if (Math.random() < 0.5) return;

    // Sisanya transaksi 31-90 hari lalu
    buatTransaksi(user.id, getRandomInt(1, 3), 31, 90);
  });

  // 5. User normal (jika ada sisa) bisa diberi transaksi acak di 8-30 hari lalu
  // (optional, bisa diabaikan)

  return transaksi;
}

export const TransaksiDummy = generateTransaksiDummy();