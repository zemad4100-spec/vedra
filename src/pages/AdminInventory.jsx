import { useEffect, useState } from 'react';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast'; // استخدمنا التوست بدل alert

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addQty, setAddQty] = useState(0);
  const [addNotes, setAddNotes] = useState('');
  const [adding, setAdding] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invRes, statsRes] = await Promise.all([
        api.get('/admin/inventory'),
        api.get('/admin/inventory/stats'),
      ]);
      setInventory(invRes.data.data || []);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = inventory.filter(item => {
    const matchesSearch = item.productNameAr.includes(search) || item.sku.includes(search);
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'low') return item.stockStatus === 'LowStock';
    if (filter === 'out') return item.stockStatus === 'OutOfStock';
    return true;
  });

  const openAddStock = (item) => {
    setSelectedProduct(item);
    setAddQty(0);
    setAddNotes('');
    setShowAddModal(true);
  };

  const handleAddStock = async () => {
    if (addQty <= 0) {
      showError('ادخل كمية صحيحة');
      return;
    }
    setAdding(true);
    try {
      await api.post('/admin/inventory/add-stock', {
        productId: selectedProduct.productId,
        quantity: addQty,
        notes: addNotes || 'إضافة كمية يدوية'
      });
      setShowAddModal(false);
      loadData();
      showSuccess('✅ تمت إضافة الكمية بنجاح');
    } catch (err) {
      showError('فشل: ' + (err.response?.data?.message || err.message));
    } finally {
      setAdding(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'OutOfStock') return { text: '❌ نفد', color: 'bg-red-100 text-red-700' };
    if (status === 'LowStock') return { text: '⚠️ قليل', color: 'bg-yellow-100 text-yellow-700' };
    return { text: '✅ متوفر', color: 'bg-green-100 text-green-700' };
  };

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;

  return (
    <div className="pb-10">
      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark mb-6">📦 المخزن</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-bold mb-1">إجمالي المنتجات</p>
            <p className="text-xl sm:text-2xl font-bold text-brand-dark">{stats.totalProducts}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-bold mb-1">إجمالي الكميات</p>
            <p className="text-xl sm:text-2xl font-bold text-brand-main">{stats.totalQuantity}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-bold mb-1">مخزون قليل</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.lowStockCount}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-500 font-bold mb-1">نفد من المخزون</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.outOfStockCount}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 col-span-2 md:col-span-1">
            <p className="text-xs text-gray-500 font-bold mb-1">قيمة المخزون</p>
            <p className="text-xl sm:text-2xl font-bold text-brand-dark truncate">
              {stats.totalInventoryValue?.toLocaleString()} <span className="text-sm">ج.م</span>
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="🔍 ابحث بالاسم أو الكود..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field flex-1"
        />
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
              filter === 'all' ? 'bg-brand-main text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            الكل ({inventory.length})
          </button>
          <button
            onClick={() => setFilter('low')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
              filter === 'low' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⚠️ قليل ({stats?.lowStockCount || 0})
          </button>
          <button
            onClick={() => setFilter('out')}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
              filter === 'out' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            ❌ نفد ({stats?.outOfStockCount || 0})
          </button>
        </div>
      </div>

      {/* Table - Responsive */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 hidden md:table-header-group">
            <tr>
              <th className="p-4 text-right text-xs font-bold text-gray-500">المنتج</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الكود</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">القسم</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الكمية</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الحد الأدنى</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الحالة</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">القيمة</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">إضافة</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {filtered.map(item => {
              const badge = getStatusBadge(item.stockStatus);
              return (
                <tr key={item.productId} className="border-t border-gray-100 hover:bg-gray-50 block md:table-row">
                  
                  {/* المنتج */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">المنتج:</span>
                    <span className="text-sm font-bold text-brand-dark">{item.productNameAr}</span>
                  </td>

                  {/* الكود */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">الكود:</span>
                    <span className="text-sm text-gray-600">{item.sku}</span>
                  </td>

                  {/* القسم */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">القسم:</span>
                    <span className="text-sm">{item.categoryNameAr}</span>
                  </td>

                  {/* الكمية */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">الكمية:</span>
                    <span className="text-sm font-bold">{item.availableQuantity}</span>
                  </td>

                  {/* الحد الأدنى */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">الحد الأدنى:</span>
                    <span className="text-sm text-gray-500">{item.lowStockThreshold}</span>
                  </td>

                  {/* الحالة */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">الحالة:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                      {badge.text}
                    </span>
                  </td>

                  {/* القيمة */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">القيمة:</span>
                    <span className="text-sm font-bold text-brand-main">
                      {((item.costPrice || 0) * item.availableQuantity).toLocaleString()} ج.م
                    </span>
                  </td>

                  {/* إضافة */}
                  <td className="p-4 md:table-cell block text-right md:text-right">
                    <button
                      onClick={() => openAddStock(item)}
                      className="bg-brand-main text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand-dark transition w-full md:w-auto mt-2 md:mt-0"
                    >
                      + إضافة كمية
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr className="block md:table-row">
                <td colSpan="8" className="p-8 text-center text-gray-500 block md:table-cell">
                  لا توجد منتجات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Stock Modal */}
      {showAddModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md my-8 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-brand-dark">➕ إضافة كمية للمخزن</h2>
              <button onClick={() => setShowAddModal(false)} className="text-2xl text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">✕</button>
            </div>

            <div className="mb-4 bg-brand-cream p-4 rounded-xl">
              <p className="font-bold text-brand-dark">{selectedProduct.productNameAr}</p>
              <p className="text-sm text-gray-500 mt-1">الكمية الحالية: {selectedProduct.availableQuantity}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-bold block mb-1">الكمية المضافة *</label>
                <input
                  type="number"
                  value={addQty}
                  onChange={(e) => setAddQty(Number(e.target.value))}
                  className="input-field w-full p-3"
                  min="1"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">ملاحظات (اختياري)</label>
                <input
                  type="text"
                  value={addNotes}
                  onChange={(e) => setAddNotes(e.target.value)}
                  className="input-field w-full p-3"
                  placeholder="مثال: توريد من المورد"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleAddStock}
                disabled={adding}
                className="btn-primary flex-1 py-3"
              >
                {adding ? 'جاري الإضافة...' : '✅ إضافة'}
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition w-full sm:w-auto"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}