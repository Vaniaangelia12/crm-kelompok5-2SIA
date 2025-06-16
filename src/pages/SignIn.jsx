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
      navigate('/');
    } else {
      alert('Email atau kata sandi salah!');
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen font-sans"
      style={{
        background: 'linear-gradient(135deg, #3F9540, #E81F25)',
      }}
    >
      <div className="relative bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Icon background */}
        <div className="absolute top-[-40px] right-[-40px] text-[#3F9540] opacity-20 text-[150px] select-none pointer-events-none">
          <FaShoppingCart />
        </div>

        <h2 className="text-4xl font-bold text-center text-[#3F9540] mb-3 tracking-wide">
          Selamat Datang!
        </h2>
        <p className="text-center text-gray-600 mb-8 font-medium">
          Masuk untuk mulai berbelanja segar dan hemat
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#E81F25] transition">
              <span className="pl-3 text-[#3F9540]">
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
                className="w-full px-4 py-2 rounded-r-xl focus:outline-none bg-white text-gray-800"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Kata Sandi
            </label>
            <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#E81F25] transition">
              <span className="pl-3 text-[#3F9540]">
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
                className="w-full px-4 py-2 rounded-r-xl focus:outline-none bg-white text-gray-800"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#E81F25] hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-300"
          >
            Masuk Sekarang
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/forgot-password" className="text-[#E81F25] hover:underline font-medium">
            Lupa kata sandi?
          </a>
        </p>

        <p className="mt-6 text-center text-sm text-gray-700 font-medium">
          Belum punya akun?{' '}
          <a href="/signup" className="text-[#E81F25] hover:underline font-semibold">
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
