import { useEffect, useState } from 'react';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleId: 8,
    isActive: true,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/users/roles'),
      ]);
      // الباك إند بقى بيبعت المستخدمين (من غير العملاء)، فمش محتاجين نفلتر هنا
      setUsers(usersRes.data.data || []);
      setRoles(rolesRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setForm({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      roleId: 8,
      isActive: true,
    });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      password: '',
      roleId: user.roleId,
      isActive: user.isActive,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        const payload = {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          roleId: Number(form.roleId),
          isActive: form.isActive,
        };

        if (form.password && form.password.trim() !== '') {
          payload.password = form.password;
        }

        await api.put(`/admin/users/${editingUser.id}`, payload);
        showSuccess('تم تحديث المستخدم بنجاح');
      } else {
        if (!form.password || form.password.length < 6) {
          setError('كلمة المرور مطلوبة (6 أحرف على الأقل)');
          return;
        }
        const payload = {
          ...form,
          roleId: Number(form.roleId),
        };
        await api.post('/admin/users', payload);
        showSuccess('تم إضافة المستخدم بنجاح');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل الحفظ';
      setError(msg);
      showError(msg);
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`, { isActive: !isActive });
      showSuccess(`تم ${!isActive ? 'تفعيل' : 'إيقاف'} الحساب`);
      loadData();
    } catch (err) {
      showError('فشل: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">جاري تحميل المستخدمين...</div>;

  return (
    <div className="pb-10 bg-[#f4f7f6] min-h-screen -m-6 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a2e1f]">👥 المستخدمين (الموظفين)</h1>
            <p className="text-gray-500 mt-1 text-sm">إدارة حسابات الإداريين والموظفين</p>
          </div>
          <button 
            onClick={openAddModal} 
            className="bg-[#15803d] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0a2e1f] transition shadow-lg shadow-[#15803d]/30 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <span>+</span> إضافة مستخدم جديد
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">#</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">الاسم</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">البريد</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">الهاتف</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">الدور</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">الحالة</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">الطلبات</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4 text-sm text-gray-500 font-bold">#{u.id}</td>
                    <td className="p-4 text-sm font-bold text-[#0a2e1f]">{u.fullName}</td>
                    <td className="p-4 text-sm text-gray-600">{u.email}</td>
                    <td className="p-4 text-sm text-gray-600 font-mono">{u.phone}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        u.role === 'Admin' ? 'bg-red-100 text-red-700 border-red-200' : 
                        u.role === 'Customer' ? 'bg-green-100 text-green-700 border-green-200' : 
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                        u.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {u.isActive ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm font-bold">{u.orderCount}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.isActive)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            u.isActive
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {u.isActive ? '🚫 إيقاف' : '✅ تفعيل'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="8" className="p-10 text-center text-gray-400">
                    <span className="text-4xl block mb-2 opacity-30">👥</span>
                    لا يوجد مستخدمين
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[#0a2e1f] flex items-center gap-2">
                {editingUser ? '✏️ تعديل المستخدم' : '➕ مستخدم جديد'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                ✕
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">الاسم الكامل *</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">البريد الإلكتروني *</label>
                <input
                  type="email"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition text-left"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">رقم الهاتف *</label>
                <input
                  type="tel"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition text-left font-mono"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">
                  {editingUser ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور *'}
                </label>
                <input
                  type="password"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition text-left"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingUser}
                  minLength={editingUser ? 0 : 6}
                  placeholder={editingUser ? 'اتركها فاضية لعدم التغيير' : ''}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">الدور *</label>
                <select
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition"
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}
                  required
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.displayNameAr || r.roleName}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#15803d] rounded focus:ring-[#15803d]"
                />
                <span className="text-sm font-bold text-gray-700">حساب نشط</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button type="submit" className="flex-1 bg-[#15803d] text-white py-3.5 rounded-xl font-bold hover:bg-[#0a2e1f] transition shadow-lg shadow-[#15803d]/30">
                  {editingUser ? '💾 حفظ التعديلات' : '✅ إضافة المستخدم'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white text-gray-700 border-2 border-gray-200 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}