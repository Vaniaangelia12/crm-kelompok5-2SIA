import React, { useState, useEffect } from 'react';
// Perbarui path import ini:
import { UserDummy } from '../data/UserDummy'; // Pergi satu level ke atas (dari 'pages' ke 'src'), lalu masuk ke 'data/UserDummy'

// Import ikon Lucide React yang relevan
import { User, Mail, Calendar, MapPin, Phone, Award, ClipboardList, PenTool, Save, X, Hash } from 'lucide-react';

export default function Profile() {
    // Diasumsikan kita memiliki ID user yang sedang login.
    // Dalam aplikasi nyata, ini akan didapat dari konteks otentikasi (misal: Redux, Context API, atau local storage).
    // Untuk tujuan dummy, kita akan ambil user pertama (user_001) atau admin_001.
    // Anda bisa menggantinya dengan logika pengambilan user yang sebenarnya.
    const loggedInUserId = "user_001"; // Ganti ini dengan ID user yang sedang login
    // const loggedInUserId = "admin_001"; // Contoh jika ingin menampilkan data admin

    const initialUserData = UserDummy.find(user => user.id === loggedInUserId);

    // State untuk menyimpan data pengguna yang akan ditampilkan dan diedit
    const [userData, setUserData] = useState(initialUserData);
    // State untuk mengontrol mode edit
    const [isEditing, setIsEditing] = useState(false);
    // State untuk menyimpan data sementara saat diedit (sebelum disimpan permanen)
    const [editedData, setEditedData] = useState({});

    // Efek samping untuk inisialisasi editedData saat mode edit diaktifkan
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

    // Jika user tidak ditemukan, tampilkan pesan error
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

    // Handler untuk perubahan input pada mode edit
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    };

    // Handler untuk menyimpan perubahan
    const handleSave = () => {
        // Dalam aplikasi nyata, di sini Anda akan mengirim `editedData` ke API backend
        // untuk memperbarui data pengguna di database.
        setUserData(prev => ({ ...prev, ...editedData })); // Update state lokal setelah disimpan
        setIsEditing(false); // Keluar dari mode edit
        alert("Perubahan berhasil disimpan!");
    };

    // Handler untuk membatalkan perubahan
    const handleCancel = () => {
        setIsEditing(false); // Keluar dari mode edit tanpa menyimpan
    };

    // Fungsi helper untuk format tanggal
    const formatTanggal = (isoDate) => {
        if (!isoDate) return '-';
        const date = new Date(isoDate);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Warna kustom Anda (tanpa tailwind.config.js)
    const freshGreen = '#3F9540';
    const freshGreenLight = '#6ECC6F';
    const freshGreenDark = '#2E7C30';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 w-full max-w-2xl border border-gray-200">
                <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-8">Profil Pengguna</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* NIK (Tidak bisa diedit) */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg shadow-sm border border-gray-200">
                        <Hash size={24} color={freshGreenDark} />
                        <div>
                            <p className="text-sm font-medium text-gray-500">NIK</p>
                            <p className="text-lg font-semibold text-gray-800">{userData.NIK}</p>
                        </div>
                    </div>

                    {/* Nama Lengkap */}
                    <ProfileField
                        label="Nama Lengkap"
                        name="nama_lengkap"
                        value={isEditing ? editedData.nama_lengkap : userData.nama_lengkap}
                        icon={<User size={24} color={freshGreenDark} />}
                        isEditing={isEditing}
                        onChange={handleChange}
                    />

                    {/* Email */}
                    <ProfileField
                        label="Email"
                        name="email"
                        type="email"
                        value={isEditing ? editedData.email : userData.email}
                        icon={<Mail size={24} color={freshGreenDark} />}
                        isEditing={isEditing}
                        onChange={handleChange}
                    />

                    {/* Tempat Lahir */}
                    <ProfileField
                        label="Tempat Lahir"
                        name="tempat_lahir"
                        value={isEditing ? editedData.tempat_lahir : userData.tempat_lahir}
                        icon={<MapPin size={24} color={freshGreenDark} />}
                        isEditing={isEditing}
                        onChange={handleChange}
                    />

                    {/* Tanggal Lahir */}
                    <ProfileField
                        label="Tanggal Lahir"
                        name="tanggal_lahir"
                        type="date" // Menggunakan type date untuk input yang lebih baik
                        value={isEditing ? editedData.tanggal_lahir : userData.tanggal_lahir}
                        icon={<Calendar size={24} color={freshGreenDark} />}
                        isEditing={isEditing}
                        onChange={handleChange}
                        displayValue={!isEditing ? formatTanggal(userData.tanggal_lahir) : null} // Tampilkan tanggal format indah saat tidak edit
                    />

                    {/* Jenis Kelamin */}
                    <ProfileField
                        label="Jenis Kelamin"
                        name="jenis_kelamin"
                        value={isEditing ? editedData.jenis_kelamin : userData.jenis_kelamin}
                        icon={<User size={24} color={freshGreenDark} />}
                        isEditing={isEditing}
                        onChange={handleChange}
                        type="select" // Menggunakan select untuk jenis kelamin
                        options={["Laki-laki", "Perempuan"]}
                    />

                    {/* Alamat */}
                    <ProfileField
                        label="Alamat"
                        name="alamat"
                        value={isEditing ? editedData.alamat : userData.alamat}
                        icon={<MapPin size={24} color={freshGreenDark} />}
                        isEditing={isEditing}
                        onChange={handleChange}
                        type="textarea" // Menggunakan textarea untuk alamat
                    />

                    {/* Nomor HP (Tidak bisa diedit) */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg shadow-sm border border-gray-200">
                        <Phone size={24} color={freshGreenDark} />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Nomor HP</p>
                            <p className="text-lg font-semibold text-gray-800">{userData.nomor_hp}</p>
                        </div>
                    </div>

                    {/* Status Membership (Tidak bisa diedit) */}
                    <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg shadow-sm border border-gray-200 col-span-1 md:col-span-2">
                        <Award size={24} color={freshGreenDark} />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Status Membership</p>
                            <p className="text-lg font-semibold text-gray-800">{userData.status_membership}</p>
                        </div>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-10 flex justify-center space-x-4">
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center px-6 py-3 bg-[#3F9540] text-white font-semibold rounded-lg shadow-md hover:bg-[#2E7C30] transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#3F9540] focus:ring-opacity-75"
                        >
                            <PenTool size={20} className="mr-2" /> Edit Profil
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleSave}
                                className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                            >
                                <Save size={20} className="mr-2" /> Simpan
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center px-6 py-3 bg-gray-400 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-75"
                            >
                                <X size={20} className="mr-2" /> Batal
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// Komponen Pembantu untuk setiap Field Profil
const ProfileField = ({ label, name, value, icon, isEditing, onChange, type = "text", options, displayValue }) => (
    <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-sm font-medium text-gray-500 flex items-center space-x-2 mb-1">
            {icon} <span>{label}</span>
        </p>
        {isEditing ? (
            type === "textarea" ? (
                <textarea
                    name={name}
                    value={value}
                    onChange={onChange}
                    // Tambahkan box-border dan fokus outline/ring yang lebih spesifik
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none text-lg text-gray-800 box-border"
                    rows="3"
                ></textarea>
            ) : type === "select" ? (
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    // Tambahkan box-border dan fokus outline/ring yang lebih spesifik
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none text-lg text-gray-800 bg-white box-border"
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
                    // Tambahkan box-border dan fokus outline/ring yang lebih spesifik
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#3F9540] focus:border-transparent outline-none text-lg text-gray-800 box-border"
                />
            )
        ) : (
            <p className="text-lg font-semibold text-gray-800 min-h-[36px] flex items-center"> {/* Tambahkan min-height dan flex untuk konsistensi vertikal */}
                {displayValue !== null ? displayValue : value || '-'}
            </p>
        )}
    </div>
);