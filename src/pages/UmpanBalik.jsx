import React, { useState, useEffect, useCallback } from "react";
// No need for Link here
// import { UmpanBalikDummy } from "../data/UmpanBalikDummy"; // REMOVED: Using real data now
import { supabase } from '../supabase'; // Import Supabase client
import { ListFilter, ChevronDown, Edit, Save, XCircle, Trash2, Loader2 } from 'lucide-react'; // Add icons for clarity

// MEMINDAHKAN DEFINISI kategoriColors ke dalam komponen agar lebih terjamin scope-nya
// const kategoriColors = {
//   saran: "bg-green-100 text-green-800",
//   keluhan: "bg-red-100 text-red-800",
//   pertanyaan: "bg-yellow-100 text-yellow-800",
// };

const FEEDBACKS_PER_PAGE = 10; // Number of feedbacks to display per page

export default function UmpanBalikAdmin() {
  // Pindahkan definisi kategoriColors ke sini
  const kategoriColors = {
    saran: "bg-green-100 text-green-800",
    keluhan: "bg-red-100 text-red-800",
    pertanyaan: "bg-yellow-100 text-yellow-800",
  };

  const kategoriOptions = ["keluhan", "saran", "pertanyaan"]; // Pindahkan definisi kategoriOptions ke sini

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for admin actions
  const [editingNote, setEditingNote] = useState(null);
  const [noteValue, setNoteValue] = useState("");
  const [savingNote, setSavingNote] = useState(false); // For saving note loading state
  const [deletingFeedback, setDeletingFeedback] = useState(null); // For delete loading state

  // States for filtering and pagination
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [sortOrder, setSortOrder] = useState("terbaru"); // 'terbaru', 'terlama', 'nama_asc', 'nama_desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Function to fetch feedbacks from Supabase
  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Pastikan semua kolom yang dibutuhkan ada di tabel umpan_balik, termasuk 'adminNote'
      let query = supabase.from('umpan_balik').select('id, nama, email, kategori, isi, tanggal_kirim, adminNote', { count: 'exact' });

      // Apply category filter
      if (filterCategory !== "Semua") {
        query = query.eq('kategori', filterCategory);
      }

      // Apply sorting
      if (sortOrder === "terbaru") {
        query = query.order('tanggal_kirim', { ascending: false });
      } else if (sortOrder === "terlama") {
        query = query.order('tanggal_kirim', { ascending: true });
      } else if (sortOrder === "nama_asc") {
        query = query.order('nama', { ascending: true });
      } else if (sortOrder === "nama_desc") {
        query = query.order('nama', { ascending: false });
      }

      // Apply pagination
      const from = (currentPage - 1) * FEEDBACKS_PER_PAGE;
      const to = from + FEEDBACKS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error: supabaseError, count } = await query;

      if (supabaseError) {
        throw supabaseError;
      }

      setFeedbackList(data || []);
      setTotalPages(Math.ceil(count / FEEDBACKS_PER_PAGE));

    } catch (err) {
      console.error("Error fetching feedbacks:", err.message);
      setError("Gagal memuat daftar umpan balik: " + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterCategory, sortOrder]);

  // Initial fetch on component mount and when filter/sort/page changes
  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleEditNote = (id, currentNote) => {
    setEditingNote(id);
    setNoteValue(currentNote);
  };

  const handleSaveNote = async (id) => {
    setSavingNote(true);
    setError(null);
    try {
      // Pastikan kolom 'adminNote' ada di tabel 'umpan_balik' di database Supabase Anda
      const { error: supabaseError } = await supabase
        .from('umpan_balik')
        .update({ adminNote: noteValue }) // <-- Perbarui kolom 'adminNote'
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      setFeedbackList(feedbackList.map(fb =>
        fb.id === id ? { ...fb, adminNote: noteValue } : fb
      ));
      setEditingNote(null);
      setNoteValue("");
      alert("Catatan admin berhasil diperbarui!");
    } catch (err) {
      console.error("Error saving admin note:", err.message);
      setError("Gagal menyimpan catatan admin: " + err.message);
      alert("Terjadi kesalahan saat menyimpan catatan: " + err.message);
    } finally {
      setSavingNote(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setNoteValue("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus umpan balik ini?")) {
      return;
    }
    
    setDeletingFeedback(id);
    setError(null);
    try {
      const { error: supabaseError } = await supabase
        .from('umpan_balik')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      setFeedbackList(feedbackList.filter((fb) => fb.id !== id));
      alert("Umpan balik berhasil dihapus!");
    } catch (err) {
      console.error("Error deleting feedback:", err.message);
      setError("Gagal menghapus umpan balik: " + err.message);
      alert("Terjadi kesalahan saat menghapus umpan balik: " + err.message);
    } finally {
      setDeletingFeedback(null);
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

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return (
      <div className="max-w-10xl mx-auto font-sans p-6 text-center">
        <Loader2 className="animate-spin h-10 w-10 text-[#E81F25] mx-auto mb-4" />
        <p className="text-gray-600">Memuat data umpan balik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-10xl mx-auto font-sans p-6 text-center bg-red-100 border border-red-400 text-red-700 rounded-lg">
        <p className="font-medium">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-10xl mx-auto font-sans p-6">
      <h1 className="text-3xl font-extrabold mb-6 text-[#E81F25] tracking-wide">
        Manajemen Umpan Balik Pelanggan
      </h1>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <label htmlFor="filterCategory" className="sr-only">Filter Kategori</label>
            <select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-[#E81F25] focus:border-transparent cursor-pointer pl-10"
            >
              <option value="Semua">Semua Kategori</option>
              {kategoriOptions.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <ListFilter className="text-gray-400 w-5 h-5" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="relative flex-grow">
            <label htmlFor="sortOrder" className="sr-only">Urutkan Berdasarkan</label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-[#E81F25] focus:border-transparent cursor-pointer pl-10"
            >
              <option value="terbaru">Tanggal Terbaru</option>
              <option value="terlama">Tanggal Terlama</option>
              <option value="nama_asc">Nama Pengirim (A-Z)</option>
              <option value="nama_desc">Nama Pengirim (Z-A)</option>
            </select>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <ChevronDown className="text-gray-400 w-5 h-5" />
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>

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
              feedbackList.map(({ id, nama, email, kategori, isi, tanggal_kirim, adminNote }) => (
                <tr
                  key={id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">{nama}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${kategoriColors[kategori.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                    {formatDate(tanggal_kirim)}
                  </td>
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
                            className="px-3 py-1 bg-[#3F9540] text-white text-sm rounded hover:bg-[#2e7a2f] flex items-center"
                            disabled={savingNote}
                          >
                            {savingNote ? <Loader2 className="animate-spin mr-1 w-4 h-4" /> : <Save className="w-4 h-4 mr-1" />}
                            {savingNote ? "Menyimpan..." : "Simpan"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 flex items-center"
                            disabled={savingNote}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
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
                          className="mt-1 text-xs text-[#E81F25] hover:underline flex items-center"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          {adminNote ? "Edit Catatan" : "Tambah Catatan"}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleDelete(id)}
                      className="text-[#E81F25] hover:text-[#c61a1f] font-semibold transition flex items-center mx-auto"
                      aria-label={`Hapus umpan balik dari ${nama}`}
                      disabled={deletingFeedback === id}
                    >
                      {deletingFeedback === id ? <Loader2 className="animate-spin mr-1 w-4 h-4" /> : <Trash2 className="w-4 h-4 mr-1" />}
                      {deletingFeedback === id ? "Menghapus..." : "Hapus"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sebelumnya
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => goToPage(i + 1)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentPage === i + 1
                  ? 'bg-[#E81F25] text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}