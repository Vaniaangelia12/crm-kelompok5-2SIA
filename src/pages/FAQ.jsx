import React, { useState } from 'react';

export default function FAQ() {
    const faqData = [
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

    const [currentPage, setCurrentPage] = useState(0);
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
    const itemsPerPage = 5;

    const startIndex = currentPage * itemsPerPage;
    const currentFaq = faqData.slice(startIndex, startIndex + itemsPerPage);
    const totalPages = Math.ceil(faqData.length / itemsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
            setSelectedQuestionIndex(null);
        }
    };

    const handleBack = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
            setSelectedQuestionIndex(null);
        }
    };

    const handleQuestionClick = (index) => {
        setSelectedQuestionIndex(index === selectedQuestionIndex ? null : index);
    };

    const selectedAnswerText = selectedQuestionIndex !== null
        ? faqData[selectedQuestionIndex].answer
        : "Pilih pertanyaan dari daftar di samping untuk melihat jawabannya di sini.";

    const selectedQuestionText = selectedQuestionIndex !== null
        ? faqData[selectedQuestionIndex].question
        : "Belum Ada Pertanyaan Terpilih";

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-xl font-sans">
            <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-800">Pertanyaan Umum (FAQ)</h2>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Bagian Kiri: Daftar Pertanyaan */}
                <div className="md:w-1/2 space-y-4">
                    {currentFaq.map((item, index) => {
                        const globalIndex = startIndex + index;
                        return (
                            <button
                                key={globalIndex}
                                className={`w-full text-left p-4 border rounded-xl shadow-md cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75
                                    ${selectedQuestionIndex === globalIndex
                                        ? 'bg-[#3F9540] text-white border-[#2E7C30] shadow-lg' // Warna utama dan sedikit lebih gelap untuk border
                                        : 'bg-[#6ECC6F] text-gray-900 border-[#3F9540] hover:bg-[#6ECC6F]/80 hover:shadow-lg' // Warna lebih terang dan border utama
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
                    {selectedQuestionIndex !== null ? (
                        <>
                            <h3 className="text-xl font-bold text-[#2E7C30] mb-3 border-b pb-2 border-[#3F9540]"> {/* Warna lebih gelap untuk teks, utama untuk border */}
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

            {/* Paginasi */}
            <div className="flex justify-center items-center mt-10 space-x-4">
                <button
                    onClick={handleBack}
                    disabled={currentPage === 0}
                    className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ease-in-out
                        ${currentPage === 0
                            ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                            : 'bg-[#3F9540] text-white hover:bg-[#2E7C30] focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75' // Warna utama dan sedikit lebih gelap saat hover
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
                    className={`px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ease-in-out
                        ${currentPage === totalPages - 1
                            ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                            : 'bg-[#3F9540] text-white hover:bg-[#2E7C30] focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75' // Warna utama dan sedikit lebih gelap saat hover
                        }`}
                >
                    Selanjutnya &rarr;
                </button>
            </div>
        </div>
    );
}