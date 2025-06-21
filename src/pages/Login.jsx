import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserDummy } from '../data/UserDummy'; // sesuaikan path sesuai struktur folder

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Cari user di UserDummy berdasarkan email dan password
    const user = UserDummy.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Simpan data user ke sessionStorage (tanpa spasi di key)
      sessionStorage.setItem('loggedUser', JSON.stringify(user));
      alert('Login Berhasil!');

      // Arahkan berdasarkan role
      if (user.role === 'admin') {
        navigate('/'); // dashboard admin
      } else {
        navigate('/user'); // dashboard user
      }
    } else {
      alert('Email atau password salah!');
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
        <span className="text-[#3F9540]">Masuk</span> Akun
      </h2>
      <p className="mt-2 text-gray-600">
        Selamat datang kembali di FreshMart
      </p>
    </div>

    <form onSubmit={handleLogin} className="space-y-6">
      {/* Input Email */}
      <div>
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
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Input Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent placeholder-gray-400 transition duration-150"
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Lupa Password */}
      <div className="flex items-center justify-end">
        <Link
          to="/forgot"
          className="text-sm font-medium text-[#E81F25] hover:text-[#C2181B] transition duration-150"
        >
          Lupa Password?
        </Link>
      </div>

      {/* Tombol Login */}
      <div>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white font-medium rounded-lg shadow-md hover:from-[#2E7C30] hover:to-[#3F9540] focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-50 transition duration-150"
        >
          Masuk
        </button>
      </div>
    </form>

    {/* Link Daftar Akun */}
    <div className="text-center text-sm text-gray-600">
      Belum punya akun?{' '}
      <Link
        to="/register"
        className="font-medium text-[#3F9540] hover:text-[#2E7C30] transition duration-150"
      >
        Daftar sekarang
      </Link>
    </div>
  </div>
</div>
  );
}