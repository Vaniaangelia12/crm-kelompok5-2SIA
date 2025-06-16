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
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Manajemen Umpan Balik</h1>

      <button
        onClick={() => setShowForm((prev) => !prev)}
        className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        {showForm ? "Batal Tambah Umpan Balik" : "Tambah Umpan Balik"}
      </button>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-300 rounded bg-white shadow-sm">
          <div className="mb-2">
            <label className="block mb-1 font-medium text-gray-700">Nama</label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:ring-indigo-400 focus:outline-none"
              placeholder="Masukkan nama Anda"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:ring-indigo-400 focus:outline-none"
              placeholder="Masukkan email"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 font-medium text-gray-700">Kategori</label>
            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:ring-indigo-400 focus:outline-none"
            >
              <option value="Saran">Saran</option>
              <option value="Keluhan">Keluhan</option>
              <option value="Pertanyaan">Pertanyaan</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">Pesan</label>
            <textarea
              name="pesan"
              value={formData.pesan}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border rounded focus:ring-indigo-400 focus:outline-none resize-none"
              placeholder="Tulis pesan Anda..."
            />
          </div>

          <button
            onClick={handleAddFeedback}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Kirim Umpan Balik
          </button>
        </div>
      )}

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pesan</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {feedbackList.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500 italic">
                  Belum ada umpan balik.
                </td>
              </tr>
            ) : (
              feedbackList.map(({ id, nama, email, kategori, pesan }) => (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{nama}</td>
                  <td className="px-6 py-4">{email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${kategoriColors[kategori]}`}>
                      {kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">{pesan}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
