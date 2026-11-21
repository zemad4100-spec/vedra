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

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-bold text-brand-dark">👥 المستخدمين</h1>
        <button onClick={openAddModal} className="btn-primary">
          + إضافة مستخدم جديد
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-right text-xs font-bold text-gray-500">#</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الاسم</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">البريد الإلكتروني</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الهاتف</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الدور</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الحالة</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الطلبات</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-sm">{u.id}</td>
                <td className="p-4 text-sm font-bold">{u.fullName}</td>
                <td className="p-4 text-sm text-gray-600">{u.email}</td>
                <td className="p-4 text-sm text-gray-600">{u.phone}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    u.role === 'Admin' ? 'bg-red-100 text-red-700' : 
                    u.role === 'Customer' ? 'bg-green-100 text-green-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {u.isActive ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                <td className="p-4 text-sm font-bold">{u.orderCount}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(u)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-200"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u.id, u.isActive)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        u.isActive
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {u.isActive ? '🚫 إيقاف' : '✅ تفعيل'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="8" className="p-8 text-center text-gray-500">لا يوجد مستخدمين</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-brand-dark">
                {editingUser ? '✏️ تعديل المستخدم' : '➕ مستخدم جديد'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-2xl">✕</button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold block mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold block mb-1">البريد الإلكتروني *</label>
                <input
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold block mb-1">رقم الهاتف *</label>
                <input
                  type="tel"
                  className="input-field"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="text-sm font-bold block mb-1">كلمة المرور *</label>
                  <input
                    type="password"
                    className="input-field"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-bold block mb-1">الدور *</label>
                <select
                  className="input-field"
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: Number(e.target.value) })}
                  required
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.displayNameAr || r.roleName}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span className="text-sm font-bold">حساب نشط</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1 py-3">
                  {editingUser ? '💾 حفظ التعديلات' : '✅ إضافة المستخدم'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 px-6 py-3 rounded-xl font-bold hover:bg-gray-300"
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