import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaEnvelope, FaLock } from 'react-icons/fa';

const SignIn = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (
      storedUser &&
      form.email === storedUser.email &&
      form.password === storedUser.password
    ) {
      // Login berhasil
      navigate('/');
    } else {
      // Login gagal
      alert('Email atau kata sandi salah!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Shopping cart icon top-right, light gray */}
        <div className="absolute top-[-40px] right-[-40px] text-gray-300 opacity-30 text-[150px] select-none">
          <FaShoppingCart />
        </div>

        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-wide">
          Selamat Datang!
        </h2>
        <p className="text-center text-gray-600 mb-6 font-semibold">
          Masuk untuk mulai berbelanja segar dan hemat
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
              Email
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-gray-400 transition">
              <span className="pl-3 text-gray-500">
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
                className="w-full px-4 py-2 rounded-r-xl focus:outline-none bg-white text-gray-900"
              />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
              Kata Sandi
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-gray-400 transition">
              <span className="pl-3 text-gray-500">
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
                className="w-full px-4 py-2 rounded-r-xl focus:outline-none bg-white text-gray-900"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-400 hover:bg-gray-500 text-gray-900 font-bold py-3 rounded-xl shadow-lg transition duration-300"
          >
            Masuk Sekarang
          </button>
        </form>

        <p className="mt-4 text-center text-gray-700">
          <a href="/forgot-password" className="text-gray-600 hover:underline font-semibold">
            Lupa kata sandi?
          </a>
        </p>

        <p className="mt-8 text-center text-gray-700 font-medium">
          Belum punya akun?{' '}
          <a href="/signup" className="text-gray-600 hover:underline font-semibold">
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
