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

  if (loading) return <div className="text-center py-20 text-gray-500">جاري تحميل العملاء...</div>;

  return (
    <div className="pb-10 bg-[#f4f7f6] min-h-screen -m-6 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a2e1f]">👥 العملاء</h1>
            <p className="text-gray-500 mt-1 text-sm">إدارة حسابات العملاء والطلبات</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 font-bold text-[#15803d]">
            إجمالي: {customers.length} عميل
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="relative w-full md:w-96">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="بحث بالاسم أو الإيميل أو الهاتف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 pr-12 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#15803d] outline-none transition"
            />
          </div>
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
                  <th className="p-4 text-center text-xs font-bold text-gray-500">الطلبات</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">الحالة</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4 text-sm text-gray-500 font-bold">#{c.id}</td>
                    <td className="p-4 text-sm font-bold text-[#0a2e1f]">{c.fullName}</td>
                    <td className="p-4 text-sm text-gray-600">{c.email}</td>
                    <td className="p-4 text-sm text-gray-600 font-mono">{c.phone}</td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold">
                        {c.orderCount} طلب
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                        c.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {c.isActive ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(c.id, c.isActive)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                          c.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {c.isActive ? '🚫 إيقاف' : '✅ تفعيل'}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-gray-400">
                      <span className="text-4xl block mb-2 opacity-30">👥</span>
                      لا يوجد عملاء مطابقين للبحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}