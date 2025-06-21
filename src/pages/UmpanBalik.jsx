import React, { useState } from "react";
import { UmpanBalikDummy } from "../data/UmpanBalikDummy"; // Sesuaikan path jika berbeda

const kategoriColors = {
  saran: "bg-green-100 text-green-800",
  keluhan: "bg-red-100 text-red-800",
  pertanyaan: "bg-yellow-100 text-yellow-800",
};

export default function UmpanBalikAdmin() {
  const initialFeedbackList = UmpanBalikDummy.map(fb => ({
    ...fb,
    tanggal: fb.tanggal || new Date().toISOString(), // Pastikan ada tanggal
    adminNote: fb.adminNote || "", // Pastikan ada adminNote
  }));

  const [feedbackList, setFeedbackList] = useState(initialFeedbackList);
  const [editingNote, setEditingNote] = useState(null);
  const [noteValue, setNoteValue] = useState("");

  const handleEditNote = (id, currentNote) => {
    setEditingNote(id);
    setNoteValue(currentNote);
  };

  const handleSaveNote = (id) => {
    setFeedbackList(feedbackList.map(fb =>
      fb.id === id ? { ...fb, adminNote: noteValue } : fb
    ));
    setEditingNote(null);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Yakin ingin menghapus umpan balik ini?")) {
      setFeedbackList(feedbackList.filter((fb) => fb.id !== id));
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    try {
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (e) {
      console.error("Invalid date string:", dateString, e);
      return "Tanggal tidak valid";
    }
  };

  return (
    <div className="max-w-10xl mx-auto font-sans">
      <h1 className="text-3xl font-extrabold mb-6 text-[#E81F25] tracking-wide">
        Manajemen Umpan Balik Pelanggan
      </h1>

      <section aria-label="Daftar umpan balik pelanggan" className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#E81F25]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Pesan
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Catatan Admin
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {feedbackList.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-gray-400 italic">
                  Belum ada umpan balik yang diberikan.
                </td>
              </tr>
            ) : (
              feedbackList.map(({ id, nama, email, kategori, isi, tanggal, adminNote }) => (
                <tr
                  key={id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${kategoriColors[kategori.toLowerCase()]}`}
                    >
                      {kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {formatDate(tanggal)}
                  </td>
                  {/* Perubahan utama di sini: menambahkan title={isi} */}
                  <td className="px-6 py-4 text-gray-800 max-w-xs whitespace-pre-wrap break-words">
                    {isi}
                  </td>
                  <td className="px-6 py-4 text-gray-800 max-w-xs">
                    {editingNote === id ? (
                      <div className="space-y-2">
                        <textarea
                          value={noteValue}
                          onChange={(e) => setNoteValue(e.target.value)}
                          rows="3"
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#E81F25] focus:border-[#E81F25]"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveNote(id)}
                            className="px-3 py-1 bg-[#3F9540] text-white text-sm rounded hover:bg-[#2e7a2f]"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {adminNote ? (
                          <div className="line-clamp-3">{adminNote}</div>
                        ) : (
                          <span className="text-gray-400 italic">Belum ada catatan</span>
                        )}
                        <button
                          onClick={() => handleEditNote(id, adminNote)}
                          className="mt-1 text-xs text-[#E81F25] hover:underline"
                        >
                          {adminNote ? "Edit Catatan" : "Tambah Catatan"}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleDelete(id)}
                      className="text-[#E81F25] hover:text-[#c61a1f] font-semibold transition"
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
    </div>
  );
}