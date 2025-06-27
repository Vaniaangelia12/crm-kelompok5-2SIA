import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../supabase'; // Sesuaikan path ini jika supabase.js ada di tempat lain
import { PlusCircle, Edit, Trash2, X, Save, Search, Bell } from 'lucide-react'; // Import ikon

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaqId, setEditingFaqId] = useState(null); // ID FAQ yang sedang diedit
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const itemsPerPage = 5;

  // Data FAQ hardcoded yang akan diinsert jika database kosong
  const hardcodedFaqData = [
    { question: "Apa itu Sistem CRM Fresh Mart?", answer: "Sistem CRM Fresh Mart membantu mengelola data pelanggan, promosi, loyalty program, dan umpan balik pelanggan." },
    { question: "Bagaimana cara menjadi member?", answer: "Daftar di kasir atau melalui website resmi Fresh Mart." },
    { question: "Apa keuntungan menjadi member?", answer: "Anda mendapatkan promo khusus, poin loyalty, dan penawaran personal." },
    { question: "Bagaimana cara mengecek poin?", answer: "Poin dapat dicek melalui aplikasi atau struk belanja." },
    { question: "Bagaimana cara menukarkan poin?", answer: "Poin bisa ditukar di kasir dengan diskon atau hadiah menarik." },
    { question: "Apakah data pelanggan aman?", answer: "Ya, data pelanggan dikelola sesuai dengan kebijakan privasi kami." },
    { question: "Apa itu program loyalty?", answer: "Program loyalti memberikan reward kepada pelanggan setia Fresh Mart." },
    { question: "Bagaimana saya memberikan umpan balik?", answer: "Gunakan menu 'Umpan Balik' di aplikasi atau website." },
    { question: "Siapa yang bisa mengikuti promo Fresh Mart?", answer: "Promo dapat diikuti oleh semua pelanggan, kecuali ada syarat khusus." },
    { question: "Apakah Fresh Mart memiliki layanan delivery?", answer: "Saat ini layanan delivery belum tersedia, namun sedang dikembangkan." },
    { question: "Bagaimana cara memperbarui data member?", answer: "Silakan hubungi customer service untuk memperbarui data member Anda." },
    { question: "Bagaimana menghubungi customer service?", answer: "Hubungi kami di 1500-XXX atau email support@freshmart.co.id." },
    { question: "Berapa lama keanggotaan berlaku?", answer: "Keanggotaan berlaku seumur hidup selama masih aktif berbelanja." },
    { question: "Bagaimana jika lupa kartu member?", answer: "Cukup sebutkan nomor HP Anda saat transaksi." },
    { question: "Dapatkah member dibatalkan?", answer: "Keanggotaan dapat dibatalkan atas permintaan pelanggan." },
    { question: "Apakah promo berlaku di semua cabang?", answer: "Promo dapat berbeda di tiap cabang, silakan cek detail promo." },
    { question: "Bagaimana saya tahu promo terbaru?", answer: "Cek website, aplikasi, atau notifikasi email resmi Fresh Mart." },
    { question: "Apakah saya bisa mendaftar lebih dari satu akun?", answer: "Setiap pelanggan hanya boleh memiliki satu akun member." },
    { question: "Bagaimana cara upgrade membership?", answer: "Program upgrade membership akan diinformasikan secara berkala." },
    { question: "Bagaimana jika poin saya tidak masuk?", answer: "Segera laporkan ke customer service untuk penyesuaian poin." }
  ];

  // Fetch FAQs from Supabase
  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('faq')
        .select('*')
        .order('created_at', { ascending: false }); // Urutkan dari yang terbaru

      if (error) throw error;
      setFaqs(data || []);
    } catch (err) {
      console.error("Error fetching FAQs:", err.message);
      setError("Gagal memuat FAQ: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // Efek untuk menginsert data hardcoded jika tabel FAQ kosong
  useEffect(() => {
    if (!loading && !error && faqs.length === 0) {
      const insertHardcodedFaqs = async () => {
        try {
          const { error: insertError } = await supabase
            .from('faq')
            .insert(hardcodedFaqData);

          if (insertError) {
            console.error("Error inserting hardcoded FAQs:", insertError.message);
            setError("Gagal menginisialisasi FAQ: " + insertError.message);
          } else {
            console.log("Hardcoded FAQs successfully inserted.");
            fetchFAQs(); // Muat ulang FAQ setelah insert
          }
        } catch (err) {
          console.error("Unexpected error during hardcoded FAQ insertion:", err.message);
          setError("Terjadi kesalahan tak terduga saat inisialisasi FAQ: " + err.message);
        }
      };
      insertHardcodedFaqs();
    }
  }, [loading, error, faqs.length, fetchFAQs, hardcodedFaqData]); // Tambahkan hardcodedFaqData sebagai dependency

  // Perhitungan paginasi dan FAQ yang ditampilkan saat ini
  const totalPages = useMemo(() => Math.ceil(faqs.length / itemsPerPage), [faqs.length]);
  const startIndex = currentPage * itemsPerPage;
  const currentFaq = useMemo(() => faqs.slice(startIndex, startIndex + itemsPerPage), [faqs, startIndex, itemsPerPage]);

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      setSelectedQuestionIndex(null); // Reset pilihan saat pindah halaman
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setSelectedQuestionIndex(null); // Reset pilihan saat pindah halaman
    }
  };

  const handleQuestionClick = (index) => {
    setSelectedQuestionIndex(index === selectedQuestionIndex ? null : index);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenAddForm = () => {
    setIsFormOpen(true);
    setEditingFaqId(null); // Pastikan mode tambah baru
    setFormData({ question: '', answer: '' }); // Bersihkan form
  };

  const handleOpenEditForm = (faqItem) => {
    setIsFormOpen(true);
    setEditingFaqId(faqItem.id); // Set ID FAQ yang akan diedit
    setFormData({ question: faqItem.question, answer: faqItem.answer }); // Isi form dengan data yang ada
  };

  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingFaqId(null);
    setFormData({ question: '', answer: '' });
  };

  const handleSaveFAQ = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Pertanyaan dan jawaban wajib diisi.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingFaqId) {
        // Mode Edit (Update)
        const { error: updateError } = await supabase
          .from('faq')
          .update({
            question: formData.question,
            answer: formData.answer,
          })
          .eq('id', editingFaqId);

        if (updateError) throw updateError;
        alert("FAQ berhasil diperbarui!");
      } else {
        // Mode Tambah Baru (Insert)
        const { error: insertError } = await supabase
          .from('faq')
          .insert([
            {
              question: formData.question,
              answer: formData.answer,
            }
          ]);

        if (insertError) throw insertError;
        alert("FAQ berhasil ditambahkan!");
      }
      
      handleCancelForm(); // Tutup form setelah berhasil
      await fetchFAQs(); // Muat ulang FAQ dari database
      setCurrentPage(0); // Kembali ke halaman pertama
    } catch (err) {
      console.error("Error saving FAQ:", err.message);
      setError("Gagal menyimpan FAQ: " + err.message);
      alert("Terjadi kesalahan saat menyimpan FAQ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFAQ = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus FAQ ini?")) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('faq')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert("FAQ berhasil dihapus!");
      await fetchFAQs(); // Muat ulang FAQ dari database
      setSelectedQuestionIndex(null); // Reset pilihan
      setCurrentPage(0); // Kembali ke halaman pertama jika item di halaman terakhir dihapus
    } catch (err) {
      console.error("Error deleting FAQ:", err.message);
      setError("Gagal menghapus FAQ: " + err.message);
      alert("Terjadi kesalahan saat menghapus FAQ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center">
          <Bell className="animate-bounce h-10 w-10 text-[#3F9540] mx-auto mb-4" />
          <p className="text-gray-700">Memuat FAQ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md text-center border border-red-400 bg-red-100">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error!</h2>
          <p className="text-red-700">{error}</p>
          <button onClick={fetchFAQs} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Coba Lagi</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-xl font-sans">
      <h2 className="text-4xl font-extrabold mb-6 text-center text-gray-800">Kelola FAQ</h2>

      {/* Tombol Tambah FAQ */}
      <div className="mb-6 text-center">
        <button
          onClick={handleOpenAddForm}
          className="bg-[#3F9540] hover:bg-[#2E7C30] text-white px-6 py-3 rounded-full font-semibold transition flex items-center mx-auto"
          disabled={loading}
        >
          <PlusCircle size={20} className="mr-2" /> Tambah FAQ Baru
        </button>
      </div>

      {/* Form Tambah/Edit FAQ */}
      {isFormOpen && (
        <div className="mb-8 border border-gray-300 p-6 rounded-lg bg-gray-50 shadow">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            {editingFaqId ? 'Edit FAQ' : 'Tambah FAQ Baru'}
          </h3>
          <form onSubmit={handleSaveFAQ}>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-gray-700">Pertanyaan</label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleFormChange}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3F9540] focus:outline-none"
                placeholder="Masukkan pertanyaan"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1 text-gray-700">Jawaban</label>
              <textarea
                name="answer"
                value={formData.answer}
                onChange={handleFormChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#3F9540] focus:outline-none"
                placeholder="Masukkan jawaban"
                required
                disabled={loading}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelForm}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md font-medium transition"
                disabled={loading}
              >
                <X size={18} className="inline mr-2" /> Batal
              </button>
              <button
                type="submit"
                className="bg-[#E81F25] hover:bg-[#c61a1f] text-white px-6 py-2 rounded-md font-medium transition"
                disabled={loading}
              >
                <Save size={18} className="inline mr-2" /> {loading ? 'Menyimpan...' : 'Simpan FAQ'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar FAQ */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Kiri: List Pertanyaan */}
        <div className="md:w-1/2 space-y-4">
          {currentFaq.length === 0 && !loading && (
            <div className="p-4 text-center text-gray-500">Tidak ada FAQ yang ditemukan.</div>
          )}
          {currentFaq.map((item, index) => {
            // Find the global index of the current item in the full 'faqs' array
            const globalIndex = faqs.findIndex(faq => faq.id === item.id);
            return (
              <div
                key={item.id} // Use item.id for unique key from database
                className={`w-full text-left p-4 border rounded-xl shadow-md transition
                ${selectedQuestionIndex === globalIndex
                  ? 'bg-[#3F9540] text-white border-[#2E7C30]'
                  : 'bg-[#E81F25]/10 text-gray-900 border-[#3F9540] hover:bg-[#E81F25]/20'
                }`}
              >
                <h3
                  className="font-semibold text-lg cursor-pointer"
                  onClick={() => handleQuestionClick(globalIndex)} // Pass globalIndex
                >
                  {item.question}
                </h3>
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => handleOpenEditForm(item)}
                    className={`text-blue-600 hover:text-blue-800 p-1 rounded-full ${selectedQuestionIndex === globalIndex ? 'bg-white' : 'bg-blue-100'}`}
                    title="Edit FAQ"
                    disabled={loading}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteFAQ(item.id)}
                    className={`text-red-600 hover:text-red-800 p-1 rounded-full ${selectedQuestionIndex === globalIndex ? 'bg-white' : 'bg-red-100'}`}
                    title="Hapus FAQ"
                    disabled={loading}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Kanan: Jawaban */}
        <div className="md:w-1/2 p-6 bg-gray-50 border border-gray-300 rounded-xl shadow-lg flex flex-col justify-between">
          {selectedQuestionIndex !== null && faqs[selectedQuestionIndex] ? ( // Pastikan faqs[selectedQuestionIndex] ada
            <>
              <h3 className="text-xl font-bold text-[#2E7C30] mb-3 border-b pb-2 border-[#3F9540]">
                {faqs[selectedQuestionIndex].question}
              </h3>
              <p className="text-gray-800 text-lg leading-relaxed">
                {faqs[selectedQuestionIndex].answer}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <svg className="w-16 h-16 mb-4 text-[#3F9540]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-xl font-medium">Pilih pertanyaan untuk melihat jawabannya.</p>
              <p className="mt-2 text-sm">Berguna untuk mengelola informasi pelanggan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Paginasi */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 space-x-4">
          <button
            onClick={handleBack}
            disabled={currentPage === 0 || loading}
            className={`px-6 py-3 rounded-full text-lg font-medium transition
              ${currentPage === 0 || loading
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-[#3F9540] text-white hover:bg-[#2E7C30]'}`}
          >
            &larr; Sebelumnya
          </button>
          <span className="text-gray-700 text-lg font-medium">
            Halaman {currentPage + 1} dari {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1 || loading}
            className={`px-6 py-3 rounded-full text-lg font-medium transition
              ${currentPage === totalPages - 1 || loading
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-[#3F9540] text-white hover:bg-[#2E7C30]'}`}
          >
            Selanjutnya &rarr;
          </button>
        </div>
      )}
    </div>
  );
}