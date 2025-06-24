import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase'; // Import Supabase client
import { Send, User, Users, Loader2 } from 'lucide-react';

export default function SendNotification() {
  const [users, setUsers] = useState([]); // List of users for dropdown
  const [selectedUser, setSelectedUser] = useState('all_users'); // Default 'all_users'
  const [message, setMessage] = useState('');
  const [notificationStatus, setNotificationStatus] = useState(''); // Feedback message
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [error, setError] = useState(null);

  // Fetch list of users for the dropdown
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('pengguna')
        .select('id, nama_lengkap, email')
        .order('nama_lengkap', { ascending: true });

      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users for notification:", err.message);
      setError("Gagal memuat daftar pengguna: " + err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSendingNotification(true);
    setNotificationStatus('');
    setError(null);

    if (!message.trim()) {
      setNotificationStatus('Pesan tidak boleh kosong.');
      setSendingNotification(false);
      return;
    }

    try {
      let notificationData = {
        pesan: message.trim(),
        status: 'belum_dibaca',
      };

      if (selectedUser !== 'all_users') {
        notificationData.id_pengguna = selectedUser;
      } else {
        // If sending to all users, id_pengguna will be NULL
        // Ensure your 'notifikasi' table allows NULL for 'id_pengguna'
        notificationData.id_pengguna = null;
      }

      const { error: insertError } = await supabase
        .from('notifikasi')
        .insert(notificationData);

      if (insertError) throw insertError;

      setNotificationStatus('Notifikasi berhasil dikirim!');
      setMessage(''); // Clear message input
      setSelectedUser('all_users'); // Reset selection
    } catch (err) {
      console.error("Error sending notification:", err.message);
      setNotificationStatus('Gagal mengirim notifikasi: ' + err.message);
      setError("Gagal mengirim notifikasi: " + err.message);
    } finally {
      setSendingNotification(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-[#E81F25] mb-6 text-center">Kirim Notifikasi</h1>

      {loadingUsers ? (
        <div className="text-center py-10">
          <Loader2 className="animate-spin h-8 w-8 text-[#E81F25] mx-auto mb-3" />
          <p className="text-gray-600">Memuat daftar pengguna...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <p className="font-bold">Error!</p>
          <p className="block sm:inline">{error}</p>
          <button onClick={fetchUsers} className="ml-4 text-blue-700 hover:underline">Coba Lagi</button>
        </div>
      ) : (
        <form onSubmit={handleSendMessage} className="space-y-6">
          <div>
            <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Penerima:
            </label>
            <div className="relative">
              <select
                id="user-select"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#3F9540] focus:border-[#3F9540] sm:text-sm"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                disabled={sendingNotification}
              >
                <option value="all_users">Semua Pengguna</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nama_lengkap} ({user.email})
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                {selectedUser === 'all_users' ? <Users className="h-5 w-5 text-gray-400" /> : <User className="h-5 w-5 text-gray-400" />}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="notification-message" className="block text-sm font-medium text-gray-700 mb-2">
              Pesan Notifikasi:
            </label>
            <textarea
              id="notification-message"
              rows="5"
              className="shadow-sm focus:ring-[#3F9540] focus:border-[#3F9540] mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-3"
              placeholder="Ketik pesan notifikasi di sini..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sendingNotification}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#3F9540] hover:bg-[#2e7c30] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3F9540] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={sendingNotification}
          >
            {sendingNotification ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" /> Mengirim...
              </>
            ) : (
              <>
                <Send className="-ml-1 mr-2 h-5 w-5" /> Kirim Notifikasi
              </>
            )}
          </button>

          {notificationStatus && (
            <p className={`mt-4 text-center text-sm ${notificationStatus.includes('Gagal') ? 'text-red-600' : 'text-green-600'}`}>
              {notificationStatus}
            </p>
          )}
        </form>
      )}
    </div>
  );
}