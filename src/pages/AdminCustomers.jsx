import { useEffect, useState } from 'react';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users/customers');
      setCustomers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, []);

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`, { isActive: !isActive });
      showSuccess(`تم ${!isActive ? 'تفعيل' : 'إيقاف'} الحساب`);
      loadCustomers();
    } catch (err) {
      showError('فشل: ' + (err.response?.data?.message || err.message));
    }
  };

  const filtered = customers.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-bold text-brand-dark">👥 العملاء</h1>
        <div className="text-sm text-gray-500">
          إجمالي: <strong>{customers.length}</strong> عميل
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 بحث بالاسم أو الإيميل أو الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-right text-xs font-bold text-gray-500">#</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الاسم</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">البريد</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الهاتف</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الطلبات</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الحالة</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-sm">{c.id}</td>
                <td className="p-4 text-sm font-bold">{c.fullName}</td>
                <td className="p-4 text-sm text-gray-600">{c.email}</td>
                <td className="p-4 text-sm text-gray-600">{c.phone}</td>
                <td className="p-4 text-sm">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                    {c.orderCount} طلب
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {c.isActive ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleStatus(c.id, c.isActive)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      c.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {c.isActive ? '🚫 إيقاف' : '✅ تفعيل'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  لا يوجد عملاء
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}