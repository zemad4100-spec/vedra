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
      password: '', // فاضية عشان المستخدم يكتب بس لو عايز يغير
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
        // تجهيز البيانات للتعديل
        const payload = {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          roleId: Number(form.roleId),
          isActive: form.isActive,
        };

        // لو المستخدم كتب باسورد جديد، نضيفه للبيانات
        if (form.password && form.password.trim() !== '') {
          payload.password = form.password;
        }

        await api.put(`/admin/users/${editingUser.id}`, payload);
        showSuccess('تم تحديث المستخدم بنجاح');
      } else {
        // إضافة مستخدم جديد
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">👥 المستخدمين</h1>
        <button onClick={openAddModal} className="btn-primary w-full sm:w-auto">
          + إضافة مستخدم جديد
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
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
                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 whitespace-nowrap"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.id, u.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg my-8 max-h-[90vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-dark">
                {editingUser ? '✏️ تعديل المستخدم' : '➕ مستخدم جديد'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-2xl text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                ✕
              </button>
            </div>

            {/* Body - Scrollable */}
            <div className="p-5 overflow-y-auto flex-1">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-bold block mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    className="input-field w-full p-3"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-bold block mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    className="input-field w-full p-3"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-bold block mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    className="input-field w-full p-3"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>

                {/* كلمة السر */}
                <div>
                  <label className="text-sm font-bold block mb-1">
                    {editingUser ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور *'}
                  </label>
                  <input
                    type="password"
                    className="input-field w-full p-3"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editingUser}
                    minLength={editingUser ? 0 : 6}
                    placeholder={editingUser ? 'اتركها فاضية لعدم التغيير' : ''}
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      لو مش عايز تغير كلمة السر، سيبها فاضية.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold block mb-1">الدور *</label>
                  <select
                    className="input-field w-full p-3"
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
                    className="w-4 h-4 text-brand-main rounded focus:ring-brand-main"
                  />
                  <span className="text-sm font-bold">حساب نشط</span>
                </label>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-2">
                  <button type="submit" className="btn-primary flex-1 py-3 order-1 sm:order-none">
                    {editingUser ? '💾 حفظ التعديلات' : '✅ إضافة المستخدم'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition order-2 sm:order-none w-full sm:w-auto"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}