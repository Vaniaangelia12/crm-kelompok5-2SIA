import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

const SignUp = () => {
  const [form, setForm] = useState({
    nik: '',
    name: '',
    placeOfBirth: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    phone: '',
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

    const userData = { ...form };
    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/signin');
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen font-sans"
      style={{
        background: 'linear-gradient(135deg, #3F9540 0%, #E81F25 100%)',
      }}
    >
      <div className="relative bg-white p-10 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] text-[#3F9540] opacity-20 text-[150px] select-none pointer-events-none">
          <FaShoppingCart />
        </div>

        <h2 className="text-4xl font-bold text-center text-[#3F9540] mb-3 tracking-wide">
          Registrasi
        </h2>
        <p className="text-center text-gray-600 mb-8 font-medium">
          Isi data lengkap sesuai KTP Anda untuk pendaftaran
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid 2 kolom */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="nik" className="block text-sm font-semibold text-gray-700 mb-2">NIK</label>
              <input type="text" id="nik" name="nik" value={form.nik} onChange={handleChange} required
                placeholder="Masukkan NIK"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E81F25]" />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
              <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required
                placeholder="Masukkan nama sesuai KTP"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E81F25]" />
            </div>

            <div>
              <label htmlFor="placeOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">Tempat Lahir</label>
              <input type="text" id="placeOfBirth" name="placeOfBirth" value={form.placeOfBirth} onChange={handleChange} required
                placeholder="Contoh: Pekanbaru"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E81F25]" />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Lahir</label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E81F25]" />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">Jenis Kelamin</label>
              <select id="gender" name="gender" value={form.gender} onChange={handleChange} required
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E81F25] text-gray-700">
                <option value="">Pilih</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
              <input type="text" id="address" name="address" value={form.address} onChange={handleChange} required
                placeholder="Contoh: Jl. Sudirman No. 10"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E81F25]" />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Nomor HP</label>
              <input type="text" id="phone" name="phone" value={form.phone} onChange={handleChange} required
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E81F25]" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="Masukkan email"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#E81F25]" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Kata Sandi</label>
            <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#E81F25]">
              <span className="pl-3 text-[#3F9540]"><FaLock /></span>
              <input type="password" id="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="Masukkan kata sandi"
                className="w-full px-4 py-2 rounded-r-xl focus:outline-none" />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">Konfirmasi Sandi</label>
            <div className="flex items-center border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-[#E81F25]">
              <span className="pl-3 text-[#3F9540]"><FaLock /></span>
              <input type="password" id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
                placeholder="Ulangi kata sandi"
                className="w-full px-4 py-2 rounded-r-xl focus:outline-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#E81F25] hover:bg-red-600 text-white font-semibold py-3 rounded-xl shadow-lg transition duration-300"
          >
            Daftar Sekarang
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-700 font-medium">
          Sudah punya akun?{' '}
          <a href="/signin" className="text-[#E81F25] hover:underline font-semibold">
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
