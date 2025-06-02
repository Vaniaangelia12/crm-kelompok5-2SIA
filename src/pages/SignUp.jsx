import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const SignUp = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert('Kata sandi dan konfirmasi tidak cocok!');
      return;
    }

    // Simulasi simpan data ke localStorage
    const userData = {
      name: form.name,
      email: form.email,
      password: form.password,
    };
    localStorage.setItem('user', JSON.stringify(userData));

    // Redirect ke halaman login
    navigate('/signin');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 via-yellow-300 to-orange-400 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Supermarket cart icon on top */}
        <div className="absolute top-[-40px] right-[-40px] text-green-500 opacity-20 text-[150px] select-none">
          <FaShoppingCart />
        </div>

        <h2 className="text-4xl font-extrabold text-center text-green-700 mb-8 tracking-wide">
          Buat Akun Baru
        </h2>
        <p className="text-center text-green-600 mb-6 font-semibold">
          Daftar sekarang untuk berbelanja segar dan hemat
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-semibold text-green-800 mb-2">
              Nama Lengkap
            </label>
            <div className="flex items-center border border-green-300 rounded-xl focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400 transition">
              <span className="pl-3 text-green-500">
                <FaUser />
              </span>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-2 rounded-r-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="email" className="block text-sm font-semibold text-green-800 mb-2">
              Email
            </label>
            <div className="flex items-center border border-green-300 rounded-xl focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400 transition">
              <span className="pl-3 text-green-500">
                <FaEnvelope />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Masukkan email Anda"
                className="w-full px-4 py-2 rounded-r-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold text-green-800 mb-2">
              Kata Sandi
            </label>
            <div className="flex items-center border border-green-300 rounded-xl focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400 transition">
              <span className="pl-3 text-green-500">
                <FaLock />
              </span>
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Masukkan kata sandi"
                className="w-full px-4 py-2 rounded-r-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-green-800 mb-2">
              Konfirmasi Sandi
            </label>
            <div className="flex items-center border border-green-300 rounded-xl focus-within:ring-2 focus-within:ring-yellow-400 focus-within:border-yellow-400 transition">
              <span className="pl-3 text-green-500">
                <FaLock />
              </span>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Ulangi kata sandi"
                className="w-full px-4 py-2 rounded-r-xl focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold py-3 rounded-xl shadow-lg transition duration-300"
          >
            Daftar Sekarang
          </button>
        </form>

        <p className="mt-8 text-center text-green-700 font-medium">
          Sudah punya akun?{' '}
          <a href="/signin" className="text-yellow-500 hover:underline font-semibold">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
