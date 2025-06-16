import React, { useState, useEffect } from 'react';
import { UserDummy } from '../data/UserDummy'; // Pastikan path ini benar

// Import ikon Lucide React yang relevan
import { User, Mail, Calendar, MapPin, Phone, Award, ClipboardList, PenTool, Save, X, Hash } from 'lucide-react';

export default function Profile() {
    // Diasumsikan kita memiliki ID user yang sedang login.
    // Untuk tujuan dummy, kita akan ambil user pertama (user_001) atau admin_001.
    const loggedInUserId = "user_001"; // Ganti ini dengan ID user yang sedang login
    // const loggedInUserId = "admin_001"; // Contoh jika ingin menampilkan data admin

    const initialUserData = UserDummy.find(user => user.id === loggedInUserId);

    const [userData, setUserData] = useState(initialUserData);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});

    // Effect untuk menginisialisasi editedData saat masuk mode edit
    useEffect(() => {
        if (isEditing) {
            setEditedData({
                nama_lengkap: userData.nama_lengkap,
                email: userData.email,
                tempat_lahir: userData.tempat_lahir,
                tanggal_lahir: userData.tanggal_lahir,
                jenis_kelamin: userData.jenis_kelamin,
                alamat: userData.alamat,
            });
        }
    }, [isEditing, userData]);

    // Tampilkan pesan error jika user tidak ditemukan
    if (!userData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error: Pengguna tidak ditemukan!</h2>
                    <p className="text-gray-700">Mohon pastikan ID pengguna yang Anda cari benar.</p>
                </div>
            </div>
        );
    }

    // Handler perubahan input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    // Handler simpan perubahan
    const handleSave = () => {
        setUserData(prev => ({ ...prev, ...editedData }));
        setIsEditing(false);
        alert("Perubahan berhasil disimpan!");
    };

    // Handler batal perubahan
    const handleCancel = () => {
        setIsEditing(false);
    };

    // Fungsi format tanggal
    const formatTanggal = (isoDate) => {
        if (!isoDate) return '-';
        const date = new Date(isoDate);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Warna kustom Anda
    const freshGreen = '#3F9540';
    const freshGreenLight = '#6ECC6F';
    const freshGreenDark = '#2E7C30';

    return (
        <div className="flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 w-full max-w-4xl border border-gray-200"> {/* Lebar Maksimal diperkecil menjadi max-w-4xl */}
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center mb-8 md:mb-10">Profil Pengguna</h2>

        {/* Grid untuk Tata Letak yang Lebih Terkontrol */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mx-auto"> {/* Grid yang lebih fleksibel */}
            {/* NIK (Tidak bisa diedit) */}
            <ProfileFieldFixed
                label="NIK"
                value={userData.NIK}
                icon={<Hash size={20} color={freshGreenDark} />} // Ukuran ikon diperkecil
                freshGreenDark={freshGreenDark}
            />

            {/* Nama Lengkap */}
            <ProfileField
                label="Nama Lengkap"
                name="nama_lengkap"
                value={isEditing ? editedData.nama_lengkap : userData.nama_lengkap}
                icon={<User  size={20} color={freshGreenDark} />}
                isEditing={isEditing}
                onChange={handleChange}
                freshGreen={freshGreen}
                freshGreenDark={freshGreenDark}
            />

            {/* Email */}
            <ProfileField
                label="Email"
                name="email"
                type="email"
                value={isEditing ? editedData.email : userData.email}
                icon={<Mail size={20} color={freshGreenDark} />}
                isEditing={isEditing}
                onChange={handleChange}
                freshGreen={freshGreen}
                freshGreenDark={freshGreenDark}
            />

            {/* Tempat Lahir (Tidak bisa diedit) */}
            <ProfileFieldFixed
                label="Tempat Lahir"
                value={userData.tempat_lahir}
                icon={<MapPin size={20} color={freshGreenDark} />}
                freshGreenDark={freshGreenDark}
            />

            {/* Tanggal Lahir (Tidak bisa diedit) */}
            <ProfileFieldFixed
                label="Tanggal Lahir"
                value={formatTanggal(userData.tanggal_lahir)} // Pastikan format tanggal sesuai
                icon={<Calendar size={20} color={freshGreenDark} />}
                freshGreenDark={freshGreenDark}
            />

            {/* Jenis Kelamin (Tidak bisa diedit) */}
            <ProfileFieldFixed
                label="Jenis Kelamin"
                value={userData.jenis_kelamin}
                icon={<User  size={20} color={freshGreenDark} />}
                freshGreenDark={freshGreenDark}
            />

            {/* Alamat */}
            <ProfileField
                label="Alamat"
                name="alamat"
                value={isEditing ? editedData.alamat : userData.alamat}
                icon={<MapPin size={20} color={freshGreenDark} />}
                isEditing={isEditing}
                onChange={handleChange}
                type="textarea"
                freshGreen={freshGreen}
                freshGreenDark={freshGreenDark}
                className="col-span-1 sm:col-span-2 lg:col-span-3" // Alamat akan mengambil lebih banyak kolom
            />

            {/* Nomor HP (Tidak bisa diedit) */}
            <ProfileFieldFixed
                label="Nomor HP"
                value={userData.nomor_hp}
                icon={<Phone size={20} color={freshGreenDark} />}
                freshGreenDark={freshGreenDark}
            />

            {/* Status Membership (Tidak bisa diedit) */}
            <ProfileFieldFixed
                label="Status Membership"
                value={userData.status_membership}
                icon={<Award size={20} color={freshGreenDark} />}
                className="col-span-1 sm:col-span-2 lg:col-span-2" // Status membership akan mengambil lebih banyak kolom
                freshGreenDark={freshGreenDark}
            />
        </div>


                {/* Tombol Aksi */}
                <div className="mt-8 md:mt-10 flex justify-center space-x-4">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center px-5 py-2.5 bg-[#3F9540] text-white font-semibold rounded-lg shadow-md hover:bg-[#2E7C30] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75 text-base"
                        >
                            <PenTool size={18} className="mr-2" /> Edit Profil
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleSave}
                                className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 text-base"
                            >
                                <Save size={18} className="mr-2" /> Simpan
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center px-5 py-2.5 bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75 text-base"
                            >
                                <X size={18} className="mr-2" /> Batal
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Komponen Pembantu untuk Field yang BISA Diedit
const ProfileField = ({ label, name, value, icon, isEditing, onChange, type = "text", options, displayValue, freshGreen, freshGreenDark, className }) => (
    <div className={`p-3 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[90px] flex flex-col justify-between ${className || ''}`}>
        <p className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
            {icon} <span>{label}</span>
        </p>
        {isEditing ? (
            type === "textarea" ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--fresh-green] focus:border-transparent outline-none text-base text-gray-800 box-border resize-y min-h-[40px]"
                    style={{ '--fresh-green': freshGreen }}
                    rows="3"
                ></textarea>
            ) : type === "select" ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--fresh-green] focus:border-transparent outline-none text-base text-gray-800 bg-white box-border"
                    style={{ '--fresh-green': freshGreen }}
                >
                    {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[--fresh-green] focus:border-transparent outline-none text-base text-gray-800 box-border"
                    style={{ '--fresh-green': freshGreen }}
                />
            )
        ) : (
            <p className="text-base font-semibold text-gray-800 min-h-[32px] flex items-center flex-grow break-words">
                {value || '-'} {/* Tampilkan value dari userData ketika tidak dalam mode edit */}
            </p>
        )}
    </div>
);


// Komponen Pembantu untuk Field yang TIDAK BISA Diedit (Fixed)
const ProfileFieldFixed = ({ label, value, icon, className, freshGreenDark }) => (
    <div className={`p-3 bg-gray-100 rounded-lg shadow-sm border border-gray-200 min-h-[90px] flex flex-col justify-between ${className || ''}`}> {/* min-h sedikit dikurangi */}
        <p className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
            {icon} <span>{label}</span>
        </p>
        <p className="text-base font-semibold text-gray-800 min-h-[32px] flex items-center flex-grow break-words"> {/* text-base, min-h sedikit dikurangi */}
            {value || '-'}
        </p>
    </div>
);