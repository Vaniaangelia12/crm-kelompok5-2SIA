import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleEmailSubmit = (e) => {
    e.preventDefault();

    if (email.trim() === '') {
      alert('Mohon masukkan email Anda.');
      return;
    }

    const storedUserRaw = localStorage.getItem('user');
    const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

    if (!storedUser || storedUser.email !== email) {
      alert('Email tidak ditemukan. Silakan coba lagi.');
      return;
    }

    setStep(2);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (newPassword.trim() === '' || confirmPassword.trim() === '') {
      alert('Mohon isi semua kolom password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Kata sandi dan konfirmasi tidak cocok!');
      return;
    }

    const storedUserRaw = localStorage.getItem('user');
    const storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;

    if (storedUser && storedUser.email === email) {
      const updatedUser = { ...storedUser, password: newPassword };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Kata sandi berhasil diubah! Silakan masuk dengan kata sandi baru.');
      navigate('/signin');
    } else {
      alert('Terjadi kesalahan, silakan coba lagi.');
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen font-sans"
      style={{
        background: 'linear-gradient(135deg, #3F9540, #E81F25)',
      }}
    >
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] text-[#3F9540] opacity-20 text-[150px] select-none">
          <FaShoppingCart />
        </div>

        <h2 className="text-4xl font-extrabold text-center text-[#3F9540] mb-8 tracking-wide">
          Lupa Kata Sandi
        </h2>

        {step === 1 && (
          <>
            <p className="text-center text-gray-600 mb-6 font-semibold">
              Masukkan email Anda untuk mengganti kata sandi
            </p>
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="relative">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                  Email
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#E81F25] focus-within:border-[#E81F25] transition">
                  <span className="pl-3 text-[#3F9540]">
                    <FaEnvelope />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Masukkan email Anda"
                    className="w-full px-4 py-2 rounded-r-xl focus:outline-none bg-white text-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E81F25] hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg transition duration-300"
              >
                Lanjut
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-center text-gray-600 mb-6 font-semibold">
              Masukkan kata sandi baru Anda
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="relative">
                <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                  Kata Sandi Baru
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#E81F25] focus-within:border-[#E81F25] transition">
                  <span className="pl-3 text-[#3F9540]">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Masukkan kata sandi baru"
                    className="w-full px-4 py-2 rounded-r-xl focus:outline-none bg-white text-gray-900"
                  />
                </div>
              </div>

              <div className="relative">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 mb-2">
                  Konfirmasi Kata Sandi
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#E81F25] focus-within:border-[#E81F25] transition">
                  <span className="pl-3 text-[#3F9540]">
                    <FaLock />
                  </span>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Ulangi kata sandi baru"
                    className="w-full px-4 py-2 rounded-r-xl focus:outline-none bg-white text-gray-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E81F25] hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg transition duration-300"
              >
                Ganti Kata Sandi
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
