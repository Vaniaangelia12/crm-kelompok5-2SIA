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

    const userData = {
      name: form.name,
      email: form.email,
      password: form.password,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/signin');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Shopping cart icon top-right, light gray */}
        <div className="absolute top-[-40px] right-[-40px] text-gray-300 opacity-30 text-[150px] select-none">
          <FaShoppingCart />
        </div>

        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8 tracking-wide">
          Buat Akun Baru
        </h2>
        <p className="text-center text-gray-600 mb-6 font-semibold">
          Daftar sekarang untuk berbelanja segar dan hemat
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { id: 'name', label: 'Nama Lengkap', type: 'text', icon: <FaUser /> , placeholder: 'Masukkan nama lengkap'},
            { id: 'email', label: 'Email', type: 'email', icon: <FaEnvelope />, placeholder: 'Masukkan email Anda' },
            { id: 'password', label: 'Kata Sandi', type: 'password', icon: <FaLock />, placeholder: 'Masukkan kata sandi' },
            { id: 'confirmPassword', label: 'Konfirmasi Sandi', type: 'password', icon: <FaLock />, placeholder: 'Ulangi kata sandi' }
          ].map(({id, label, type, icon, placeholder}) => (
            <div key={id} className="relative">
              <label htmlFor={id} className="block text-sm font-semibold text-gray-800 mb-2">
                {label}
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-gray-400 focus-within:border-gray-400 transition">
                <span className="pl-3 text-gray-500">
                  {icon}
                </span>
                <input
                  type={type}
                  id={id}
                  name={id}
                  value={form[id]}
                  onChange={handleChange}
                  required
                  placeholder={placeholder}
                  className="w-full px-4 py-2 rounded-r-xl focus:outline-none bg-white text-gray-900"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-gray-400 hover:bg-gray-500 text-gray-900 font-bold py-3 rounded-xl shadow-lg transition duration-300"
          >
            Daftar Sekarang
          </button>
        </form>

        <p className="mt-8 text-center text-gray-700 font-medium">
          Sudah punya akun?{' '}
          <a href="/signin" className="text-gray-600 hover:underline font-semibold">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;