import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../supabase'; // Sesuaikan path ini jika supabase.js ada di tempat lain
import { Bell } from 'lucide-react'; // Import ikon untuk loading/error

export default function FAQuser() {
  const [faqs, setFaqs] = useState([]); // State untuk menyimpan data FAQ dari Supabase
  const [loading, setLoading] = useState(true); // State untuk indikator loading
  const [error, setError] = useState(null); // State untuk pesan error

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const itemsPerPage = 5;

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
      console.error("Error fetching FAQs for user:", err.message);
      setError("Gagal memuat FAQ: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  // Perhitungan paginasi dan FAQ yang ditampilkan saat ini (menggunakan 'faqs' dari Supabase)
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

  // Menampilkan pertanyaan dan jawaban berdasarkan data dari Supabase
  const selectedAnswerText = selectedQuestionIndex !== null && faqs[selectedQuestionIndex]
    ? faqs[selectedQuestionIndex].answer
    : "Pilih pertanyaan dari daftar di samping untuk melihat jawabannya di sini.";

  const selectedQuestionText = selectedQuestionIndex !== null && faqs[selectedQuestionIndex]
    ? faqs[selectedQuestionIndex].question
    : "Belum Ada Pertanyaan Terpilih";

  // Loading state for initial fetch
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

  // Error state display
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
    <div className="mt-4 max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100 font-sans">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-800">Pertanyaan Umum (FAQ)</h2>

      {faqs.length === 0 && !loading && (
        <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-200">
          <p className="text-gray-600">Tidak ada FAQ yang ditemukan saat ini.</p>
        </div>
      )}

      {faqs.length > 0 && (
        <div className="flex flex-col md:flex-row gap-8">
          {/* Bagian Kiri: Daftar Pertanyaan */}
          <div className="md:w-1/2 space-y-4">
            {currentFaq.map((item, index) => {
              // Menemukan indeks global dari item saat ini di array 'faqs' penuh
              const globalIndex = faqs.findIndex(faq => faq.id === item.id);
              return (
                <button
                  key={item.id} // Menggunakan item.id sebagai kunci unik dari database
                  className={`w-full text-left p-4 border rounded-xl shadow-md cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75
                    ${selectedQuestionIndex === globalIndex
                      ? 'bg-[#3F9540] text-white border-[#2E7C30] shadow-lg' // Warna utama dan sedikit lebih gelap untuk border
                      : 'bg-[#E81F25]/10 text-gray-900 border-[#3F9540] hover:bg-[#E81F25]/20 hover:shadow-lg' // Warna lebih terang dan border utama
                    }`}
                  onClick={() => handleQuestionClick(globalIndex)}
                >
                  <h3 className="font-semibold text-lg">{item.question}</h3>
                </button>
              );
            })}
          </div>

          {/* Bagian Kanan: Area Jawaban yang Lebih Baik */}
          <div className="md:w-1/2 p-6 bg-gray-50 border border-gray-300 rounded-xl shadow-lg flex flex-col justify-between transition-all duration-300 ease-in-out">
            {selectedQuestionIndex !== null && faqs[selectedQuestionIndex] ? (
              <>
                <h3 className="text-xl font-bold text-[#2E7C30] mb-3 border-b pb-2 border-[#3F9540]">
                  {selectedQuestionText}
                </h3>
                <p className="text-gray-800 text-lg leading-relaxed flex-grow">
                  {selectedAnswerText}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <svg className="w-16 h-16 mb-4 text-[#3F9540]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-xl font-medium">
                  Pilih pertanyaan untuk melihat jawabannya di sini.
                </p>
                <p className="mt-2 text-sm">
                  Ini akan membantu Anda menemukan informasi yang relevan.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paginasi */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-10 space-x-4">
          <button
            onClick={handleBack}
            disabled={currentPage === 0}
            className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ease-in-out
              ${currentPage === 0
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-[#3F9540] text-white hover:bg-[#2E7C30] focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75 cursor-pointer'
              }`}
          >
            &larr; Sebelumnya
          </button>
          <span className="text-gray-700 text-lg font-medium">
            Halaman {currentPage + 1} dari {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            className={`px-6 py-3 rounded-full text-lg font-medium cursor-pointer transition-all duration-300 ease-in-out
              ${currentPage === totalPages - 1
                ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                : 'bg-[#3F9540] text-white hover:bg-[#2E7C30] focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75'
              }`}
          >
            Selanjutnya &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
