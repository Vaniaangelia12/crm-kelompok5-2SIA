import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nama_lengkap: "",
    email: "",
    password: "",
    konfirmasi_password: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    alamat: "",
    nomor_hp: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.konfirmasi_password) {
      alert("Password dan konfirmasi password tidak cocok!");
      return;
    }
    // Proses pendaftaran di sini
    alert("Registrasi berhasil!");
    // Reset form atau redirect
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3F9540]/10 to-[#E81F25]/5 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
        {/* Header dengan indikator step */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            <span className="text-[#3F9540]">Daftar</span> Membership
          </h2>
          <p className="text-gray-600 mb-6">Bergabunglah dengan FreshMart untuk pengalaman belanja terbaik</p>
          
          {/* Indikator Step */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div className={`flex flex-col items-center ${stepNumber <= step ? 'text-[#3F9540]' : 'text-gray-400'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${stepNumber <= step ? 'border-[#3F9540] bg-[#3F9540]/10' : 'border-gray-300'}`}>
                      {stepNumber}
                    </div>
                    <span className="text-xs mt-1">
                      {stepNumber === 1 && 'Akun'}
                      {stepNumber === 2 && 'Data Diri'}
                      {stepNumber === 3 && 'Alamat'}
                    </span>
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-16 h-1 mx-2 ${stepNumber < step ? 'bg-[#3F9540]' : 'bg-gray-300'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Informasi Akun */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nama_lengkap">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nama_lengkap"
                    name="nama_lengkap"
                    value={form.nama_lengkap}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent"
                    placeholder="contoh@email.com"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent"
                    placeholder="Minimal 8 karakter"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="konfirmasi_password">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="konfirmasi_password"
                    name="konfirmasi_password"
                    value={form.konfirmasi_password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent"
                    placeholder="Ulangi password"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Data Pribadi */}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tempat_lahir">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  id="tempat_lahir"
                  name="tempat_lahir"
                  value={form.tempat_lahir}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent"
                  placeholder="Kota kelahiran"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tanggal_lahir">
                  Tanggal Lahir
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="tanggal_lahir"
                    name="tanggal_lahir"
                    value={form.tanggal_lahir}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${form.jenis_kelamin === 'Laki-laki' ? 'border-[#3F9540] bg-[#3F9540]/10' : 'border-gray-300'}`}>
                    <input
                      type="radio"
                      name="jenis_kelamin"
                      value="Laki-laki"
                      checked={form.jenis_kelamin === 'Laki-laki'}
                      onChange={handleChange}
                      required
                      className="h-4 w-4 text-[#3F9540] focus:ring-[#3F9540]"
                    />
                    <span className="ml-2 text-gray-700">Laki-laki</span>
                  </label>
                  <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${form.jenis_kelamin === 'Perempuan' ? 'border-[#3F9540] bg-[#3F9540]/10' : 'border-gray-300'}`}>
                    <input
                      type="radio"
                      name="jenis_kelamin"
                      value="Perempuan"
                      checked={form.jenis_kelamin === 'Perempuan'}
                      onChange={handleChange}
                      required
                      className="h-4 w-4 text-[#3F9540] focus:ring-[#3F9540]"
                    />
                    <span className="ml-2 text-gray-700">Perempuan</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Kontak & Alamat */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="alamat">
                  Alamat Lengkap
                </label>
                <textarea
                  id="alamat"
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  rows="4"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent"
                  placeholder="Jl. Contoh No. 123, Kota/Kabupaten"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nomor_hp">
                  Nomor HP/WhatsApp
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="nomor_hp"
                    name="nomor_hp"
                    value={form.nomor_hp}
                    onChange={handleChange}
                    required
                    pattern="[0-9]+"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3F9540] focus:border-transparent"
                    placeholder="081234567890"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigasi Step */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition duration-150"
              >
                Kembali
              </button>
            ) : (
              <div></div> // Spacer untuk mempertahankan flex space-between
            )}
            
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white font-medium rounded-lg shadow-md hover:from-[#2E7C30] hover:to-[#3F9540] transition duration-150"
              >
                Lanjut
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-[#3F9540] to-[#2E7C30] text-white font-medium rounded-lg shadow-md hover:from-[#2E7C30] hover:to-[#3F9540] transition duration-150"
              >
                Daftar Sekarang
              </button>
            )}
          </div>
        </form>

        {/* Link kembali ke login */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-[#3F9540] hover:text-[#2E7C30] transition duration-150">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}