import React, { useState } from "react";

const initialFeedbacks = [
  {
    id: 1,
    nama: "Budi",
    email: "budi@example.com",
    kategori: "Saran",
    pesan: "Tolong tambah fitur dark mode.",
  },
  {
    id: 2,
    nama: "Sari",
    email: "sari@example.com",
    kategori: "Keluhan",
    pesan: "Website lambat saat diakses.",
  },
];

const kategoriColors = {
  Saran: "bg-green-100 text-green-800",
  Keluhan: "bg-red-100 text-red-800",
  Pertanyaan: "bg-yellow-100 text-yellow-800",
};

export default function UmpanBalik() {
  const [feedbackList, setFeedbackList] = useState(initialFeedbacks);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    kategori: "Saran",
    pesan: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFeedback = () => {
    if (!formData.nama.trim() || !formData.email.trim() || !formData.pesan.trim()) {
      alert("Mohon isi semua kolom yang diperlukan!");
      return;
    }

    const newFeedback = {
      id: feedbackList.length > 0 ? feedbackList[feedbackList.length - 1].id + 1 : 1,
      ...formData,
    };

    setFeedbackList([...feedbackList, newFeedback]);
    setFormData({ nama: "", email: "", kategori: "Saran", pesan: "" });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus umpan balik ini?")) {
      setFeedbackList(feedbackList.filter((fb) => fb.id !== id));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-extrabold mb-6 text-gray-900 tracking-wide">
        Manajemen Umpan Balik Pelanggan
      </h1>

      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="mb-6 inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition focus:outline-none focus:ring-4 focus:ring-indigo-300"
        aria-expanded={showForm}
        aria-controls="form-umpanbalik"
      >
        {showForm ? (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Batal Tambah Umpan Balik
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path>
            </svg>
            Tambah Umpan Balik
          </>
        )}
      </button>

      {showForm && (
        <section
          id="form-umpanbalik"
          className="bg-white rounded-xl shadow-lg p-8 mb-4 max-w-6xl mx-auto"
          aria-label="Formulir tambah umpan balik"
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="nama" className="block mb-2 font-semibold text-gray-700">
                Nama
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Masukkan nama Anda"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2 font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan email Anda"
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="kategori" className="block mb-2 font-semibold text-gray-700">
                Kategori
              </label>
              <select
                id="kategori"
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition"
              >
                <option value="Saran">Saran</option>
                <option value="Keluhan">Keluhan</option>
                <option value="Pertanyaan">Pertanyaan</option>
              </select>
            </div>

            <div>
              <label htmlFor="pesan" className="block mb-2 font-semibold text-gray-700">
                Pesan
              </label>
              <textarea
                id="pesan"
                name="pesan"
                value={formData.pesan}
                onChange={handleChange}
                rows="5"
                placeholder="Tulis pesan Anda di sini..."
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 transition resize-none"
                required
              ></textarea>
            </div>

            <button
              onClick={handleAddFeedback}
              className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition focus:outline-none focus:ring-4 focus:ring-indigo-300"
              type="button"
            >
              Kirim Umpan Balik
            </button>
          </div>
        </section>
      )}

      {!showForm && (
        <section aria-label="Daftar umpan balik pelanggan" className="overflow-x-auto bg-white rounded-xl shadow-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Pesan
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {feedbackList.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-400 italic">
                    Belum ada umpan balik yang diberikan.
                  </td>
                </tr>
              ) : (
                feedbackList.map(({ id, nama, email, kategori, pesan }) => (
                  <tr
                    key={id}
                    className="hover:bg-indigo-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{nama}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${kategoriColors[kategori]}`}
                      >
                        {kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800 max-w-xl truncate" title={pesan}>
                      {pesan}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(id)}
                        className="text-red-600 hover:text-red-900 font-semibold transition"
                        aria-label={`Hapus umpan balik dari ${nama}`}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}