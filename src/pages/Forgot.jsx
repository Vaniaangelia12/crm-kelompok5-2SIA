import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../supabase'; // Import Supabase client
import { Loader2 } from 'lucide-react'; // Import Loader2 icon

export default function Forgot() {
  const navigate = useNavigate();
  // State untuk mengontrol tampilan langkah-langkah:
  // 1: Memasukkan email untuk mengirim link reset
  // 2: Menampilkan pesan untuk memeriksa email
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // State baru untuk indikator loading

  // Fungsi untuk menangani pengiriman link reset password
  const handleSendResetLink = async (e) => {
    e.preventDefault();
    setMessage(""); // Hapus pesan sebelumnya
    setLoading(true); // Mulai loading

    if (!email) {
      setMessage("Mohon masukkan email Anda.");
      setLoading(false);
      return;
    }

    try {
      // Menggunakan Supabase untuk mengirim email reset password.
      // `redirectTo` adalah URL di mana pengguna akan diarahkan setelah mengklik link di email.
      // Anda perlu membuat route baru di aplikasi Anda (misalnya `/reset-password-confirm`)
      // untuk menangani proses pengaturan password baru setelah pengguna diverifikasi.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password-confirm', // Sesuaikan URL ini dengan route aplikasi Anda
      });

      if (error) {
        // Penanganan error spesifik dari Supabase (misalnya email tidak ditemukan)
        if (error.message.includes("not found") || error.message.includes("No user found")) {
          setMessage("Email tidak terdaftar.");
        } else {
          setMessage("Gagal mengirim link reset password: " + error.message);
        }
        console.error("Error sending reset password email:", error.message);
      } else {
        setMessage(`Link reset password telah dikirim ke email: ${email}. Mohon cek inbox atau folder spam Anda.`);
        setStep(2); // Pindah ke langkah "periksa email"
      }
    } catch (err) {
      console.error("Terjadi kesalahan tak terduga saat mengirim link reset:", err);
      setMessage("Terjadi kesalahan tak terduga. Silakan coba lagi.");
    } finally {
      setLoading(false); // Selesai loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3F9540]/20 to-[#E81F25]/10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-xl shadow-lg border border-gray-100 space-y-8">
        {/* Header dengan logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-[#3F9540]/10 p-4 rounded-full">
              <svg className="w-10 h-10 text-[#3F9540]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-800">
            <span className="text-[#3F9540]">Lupa</span> Password
          </h2>
          <p className="mt-2 text-gray-600">
            {step === 1 && "Masukkan email Anda untuk mendapatkan link reset password"}
            {step === 2 && "Mohon cek email Anda untuk link reset password."}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendResetLink} className="space-y-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent placeholder-gray-400 transition duration-150"
                placeholder="contoh@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading} // Nonaktifkan input saat loading
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white font-medium rounded-lg shadow-md hover:from-[#2E7C30] hover:to-[#3F9540] focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-50 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading} // Nonaktifkan tombol saat loading
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} /> Mengirim...
                </>
              ) : (
                "Kirim Link Reset Password" // Teks tombol diperbarui
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center">
            <p className="text-gray-700">
              Kami telah mengirimkan link reset password ke alamat email Anda (<span className="font-semibold">{email}</span>).
              <br />
              Mohon periksa inbox atau folder spam Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setStep(1); // Izinkan pengguna kembali untuk memasukkan email berbeda
                setEmail("");
                setMessage("");
              }}
              className="w-full mt-4 text-center text-[#3F9540] hover:underline"
            >
              Kirim ulang atau masukkan email berbeda
            </button>
            <button
                type="button"
                onClick={() => navigate("/login")}
                className="w-full py-3 px-4 bg-[#E81F25] text-white font-medium rounded-lg shadow-md hover:bg-[#c21a1f] focus:outline-none focus:ring-2 focus:ring-[#E81F25] focus:ring-opacity-50 transition duration-150"
            >
                Kembali ke Login
            </button>
          </div>
        )}

        {message && (
          <p className={`mt-4 text-center text-sm ${message.includes("Gagal") || message.includes("tidak terdaftar") || message.includes("kesalahan") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}