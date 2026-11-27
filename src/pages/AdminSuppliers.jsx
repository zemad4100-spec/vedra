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

  if (loading) return <div className="text-center py-20 text-gray-500">جاري تحميل الموردين...</div>;

  return (
    <div className="pb-10 bg-[#f4f7f6] min-h-screen -m-6 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a2e1f]">🚚 الموردين</h1>
            <p className="text-gray-500 mt-1 text-sm">إدارة بيانات الموردين والجهات الخارجية</p>
          </div>
          <button 
            onClick={openAddModal} 
            className="bg-[#15803d] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#0a2e1f] transition shadow-lg shadow-[#15803d]/30 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <span>+</span> إضافة مورد جديد
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="relative w-full md:w-96">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="بحث بالاسم أو الهاتف..."
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
                  <th className="p-4 text-right text-xs font-bold text-gray-500">جهة الاتصال</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">الهاتف</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">البريد</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">الحالة</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="p-4 text-sm text-gray-500 font-bold">#{s.id}</td>
                    <td className="p-4 text-sm font-bold text-[#0a2e1f]">{s.name}</td>
                    <td className="p-4 text-sm text-gray-600">{s.contactName || '-'}</td>
                    <td className="p-4 text-sm text-gray-600 font-mono">{s.phone || '-'}</td>
                    <td className="p-4 text-sm text-gray-600">{s.email || '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                        s.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {s.isActive ? 'نشط' : 'موقوف'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(s)}
                          className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-gray-400">
                      <span className="text-4xl block mb-2 opacity-30">🚚</span>
                      لا يوجد موردين مطابقين للبحث
                    </td>
                  </tr>
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
                {editingSupplier ? '✏️ تعديل المورد' : '➕ مورد جديد'}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">اسم المورد *</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">جهة الاتصال</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition"
                  value={form.contactName}
                  onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">الهاتف</label>
                  <input
                    type="tel"
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition text-left font-mono"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">البريد الإلكتروني</label>
                  <input
                    type="email"
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition text-left"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">العنوان</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1.5">ملاحظات</label>
                <textarea
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition resize-none"
                  rows="2"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer py-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#15803d] rounded focus:ring-[#15803d]"
                />
                <span className="text-sm font-bold text-gray-700">المورد نشط</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button type="submit" className="flex-1 bg-[#15803d] text-white py-3.5 rounded-xl font-bold hover:bg-[#0a2e1f] transition shadow-lg shadow-[#15803d]/30">
                  {editingSupplier ? '💾 حفظ التعديلات' : '✅ إضافة المورد'}
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