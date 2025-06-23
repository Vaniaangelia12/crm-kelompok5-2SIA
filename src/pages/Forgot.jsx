import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Forgot() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Mohon masukkan email Anda.");
      return;
    }
    const otpCode = generateOtp();
    setGeneratedOtp(otpCode);
    setMessage(`Kode OTP telah dikirim ke email: ${email} (Simulasi: ${otpCode})`);
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      setMessage("OTP valid! Silakan buat password baru Anda.");
      setStep(3);
    } else {
      setMessage("OTP salah, silakan coba lagi.");
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage("Password minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Password dan konfirmasi password tidak cocok.");
      return;
    }
    // Simulasi reset password berhasil
    // Redirect ke /login dengan state notifikasi
    navigate("/login", {
      replace: true,
      state: { resetSuccess: true, email: email },
    });
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
            Masukkan email Anda untuk mendapatkan kode OTP
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-6">
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
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white font-medium rounded-lg shadow-md hover:from-[#2E7C30] hover:to-[#3F9540] focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-50 transition duration-150"
            >
              Kirim Kode OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Masukkan Kode OTP
            </label>
            <div className="relative">
              <input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                placeholder="6 digit kode OTP"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent placeholder-gray-400 transition duration-150"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#E81F25] text-white py-2 rounded hover:bg-red-700 transition"
            >
              Verifikasi OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setMessage("");
                setOtp("");
              }}
              className="w-full mt-2 text-center text-[#3F9540] hover:underline"
            >
              Kirim ulang kode OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Masukkan password baru"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent placeholder-gray-400 transition duration-150"
              />
            </div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Ulangi password baru"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent placeholder-gray-400 transition duration-150"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white py-2 rounded hover:from-[#2E7C30] hover:to-[#3F9540] transition duration-150"
            >
              Reset Password
            </button>
          </form>
        )}

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}