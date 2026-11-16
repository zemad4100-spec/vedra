import { useEffect, useState } from 'react';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [search, setSearch] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    isActive: true,
  });

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/suppliers');
      setSuppliers(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSuppliers(); }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setForm({
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name || '',
      contactName: supplier.contactName || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      notes: supplier.notes || '',
      isActive: supplier.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, form);
        showSuccess('تم تحديث المورد بنجاح');
      } else {
        await api.post('/suppliers', form);
        showSuccess('تم إضافة المورد بنجاح');
      }
      setShowModal(false);
      loadSuppliers();
    } catch (err) {
      showError(err.response?.data?.message || 'فشل الحفظ');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      showSuccess('تم حذف المورد');
      loadSuppliers();
    } catch (err) {
      showError('فشل الحذف: ' + (err.response?.data?.message || err.message));
    }
  };

  const filtered = suppliers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.contactName?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search)
  );

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-bold text-brand-dark">🚚 الموردين</h1>
        <button onClick={openAddModal} className="btn-primary">
          + إضافة مورد جديد
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="🔍 بحث بالاسم أو الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-right text-xs font-bold text-gray-500">#</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الاسم</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">جهة الاتصال</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الهاتف</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">البريد</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الحالة</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-sm">{s.id}</td>
                <td className="p-4 text-sm font-bold">{s.name}</td>
                <td className="p-4 text-sm text-gray-600">{s.contactName || '-'}</td>
                <td className="p-4 text-sm text-gray-600">{s.phone || '-'}</td>
                <td className="p-4 text-sm text-gray-600">{s.email || '-'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {s.isActive ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(s)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-200"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-200"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  لا يوجد موردين
                </td>
              </tr>
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
                {editingSupplier ? '✏️ تعديل المورد' : '➕ مورد جديد'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-2xl">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold block mb-1">اسم المورد *</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">جهة الاتصال</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold block mb-1">الهاتف</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold block mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="input-field"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">العنوان</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">ملاحظات</label>
                <textarea
                  className="input-field"
                  rows="2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <span className="text-sm font-bold">المورد نشط</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1 py-3">
                  {editingSupplier ? '💾 حفظ التعديلات' : '✅ إضافة المورد'}
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