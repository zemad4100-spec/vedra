import { useEffect, useState } from 'react';
import api from '../services/api';

const EXPENSE_CATEGORIES = [
  'إيجار', 'رواتب', 'كهرباء', 'مياه', 'إنترنت',
  'صيانة', 'تسويق', 'شحن', 'مشتريات أخرى', 'مصروفات متنوعة'
];

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    category: EXPENSE_CATEGORIES[0],
    description: '',
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    referenceNumber: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [expRes, statsRes] = await Promise.all([
        api.get('/admin/expenses'),
        api.get('/admin/expenses/stats'),
      ]);
      setExpenses(expRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/admin/expenses', {
        ...form,
        amount: Number(form.amount),
      });
      setShowModal(false);
      setForm({
        category: EXPENSE_CATEGORIES[0],
        description: '',
        amount: 0,
        expenseDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        referenceNumber: '',
      });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحفظ');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    try {
      await api.delete(`/admin/expenses/${id}`);
      loadData();
    } catch (err) {
      alert('فشل: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-bold text-brand-dark">💰 المصروفات</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + إضافة مصروف
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <p className="text-xs text-gray-500 font-bold">مصروفات الشهر</p>
            <p className="text-2xl font-bold text-brand-dark">
              {stats.totalThisMonth?.toLocaleString()} ج.م
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <p className="text-xs text-gray-500 font-bold">مصروفات السنة</p>
            <p className="text-2xl font-bold text-brand-main">
              {stats.totalThisYear?.toLocaleString()} ج.م
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <p className="text-xs text-gray-500 font-bold">عدد المصروفات</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalCount}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm">
            <p className="text-xs text-gray-500 font-bold">المتوسط</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.averageExpense?.toLocaleString(undefined, { maximumFractionDigits: 0 })} ج.م
            </p>
          </div>
        </div>
      )}

      {/* By Category */}
      {stats?.byCategory?.length > 0 && (
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4 text-brand-dark">📊 المصروفات حسب الفئة</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.byCategory.map((c, i) => (
              <div key={i} className="bg-brand-cream p-3 rounded-xl">
                <p className="text-xs font-bold text-gray-600">{c.category}</p>
                <p className="text-lg font-bold text-brand-main">{c.total?.toLocaleString()} ج.م</p>
                <p className="text-xs text-gray-500">{c.count} عملية</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-right text-xs font-bold text-gray-500">#</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الفئة</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الوصف</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">المبلغ</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">التاريخ</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">طريقة الدفع</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-sm">{e.id}</td>
                <td className="p-4 text-sm font-bold">{e.category}</td>
                <td className="p-4 text-sm text-gray-600">{e.description || '-'}</td>
                <td className="p-4 text-sm font-bold text-red-600">
                  {e.amount?.toLocaleString()} ج.م
                </td>
                <td className="p-4 text-sm">
                  {new Date(e.expenseDate).toLocaleDateString('ar-EG')}
                </td>
                <td className="p-4 text-sm">{e.paymentMethod || '-'}</td>
                <td className="p-4">
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-200"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">لا توجد مصروفات</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-brand-dark">➕ إضافة مصروف</h2>
              <button onClick={() => setShowModal(false)} className="text-2xl">✕</button>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-bold block mb-1">الفئة *</label>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                >
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold block mb-1">الوصف</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-bold block mb-1">المبلغ *</label>
                <input
                  type="number"
                  className="input-field"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  min="1"
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-bold block mb-1">التاريخ</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.expenseDate}
                  onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-bold block mb-1">طريقة الدفع</label>
                <select
                  className="input-field"
                  value={form.paymentMethod}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                >
                  <option value="Cash">نقدي</option>
                  <option value="Card">بطاقة</option>
                  <option value="Bank">تحويل بنكي</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1 py-3">✅ إضافة</button>
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