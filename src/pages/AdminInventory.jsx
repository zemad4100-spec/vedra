import { useEffect, useState } from 'react';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

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
      const payload = {
        ProductId: selectedProduct.productId,
        Quantity: addQty,
        WarehouseId: 1,
        Notes: addNotes || 'إضافة كمية يدوية'
      };

      await api.post('/admin/inventory/add-stock', payload);
      
      setShowAddModal(false);
      loadData();
      showSuccess('✅ تمت إضافة الكمية بنجاح');
    } catch (err) {
      console.error('Error Response:', err.response?.data);
      showError('فشل: ' + (err.response?.data?.message || err.message));
    } finally {
      setAdding(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'OutOfStock') return { text: '❌ نفد', color: 'bg-red-100 text-red-700 border-red-200' };
    if (status === 'LowStock') return { text: '⚠️ قليل', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { text: '✅ متوفر', color: 'bg-green-100 text-green-700 border-green-200' };
  };

  if (loading) return <div className="text-center py-20 text-gray-500">جاري تحميل المخزن...</div>;

  return (
    <div className="pb-10 bg-[#f4f7f6] min-h-screen -m-6 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a2e1f]">📦 المخزن</h1>
            <p className="text-gray-500 mt-1 text-sm">إدارة المخزون والكميات المتاحة</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              <p className="text-xs text-gray-500 font-bold mb-1 flex items-center gap-1"><span>📦</span> إجمالي المنتجات</p>
              <p className="text-2xl font-bold text-[#0a2e1f]">{stats.totalProducts}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              <p className="text-xs text-gray-500 font-bold mb-1 flex items-center gap-1"><span>🛒</span> إجمالي الكميات</p>
              <p className="text-2xl font-bold text-[#15803d]">{stats.totalQuantity}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              <p className="text-xs text-gray-500 font-bold mb-1 flex items-center gap-1"><span>⚠️</span> مخزون قليل</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStockCount}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              <p className="text-xs text-gray-500 font-bold mb-1 flex items-center gap-1"><span>❌</span> نفد من المخزون</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group col-span-2 md:col-span-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#15803d]/10 rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
              <p className="text-xs text-gray-500 font-bold mb-1 flex items-center gap-1"><span>💰</span> قيمة المخزون</p>
              <p className="text-2xl font-bold text-[#0a2e1f] truncate">
                {stats.totalInventoryValue?.toLocaleString()} <span className="text-sm">ج.م</span>
              </p>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="ابحث بالاسم أو الكود..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 pr-12 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#15803d] outline-none transition"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
                filter === 'all' ? 'bg-[#15803d] text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              الكل ({inventory.length})
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
                filter === 'low' ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              ⚠️ قليل ({stats?.lowStockCount || 0})
            </button>
            <button
              onClick={() => setFilter('out')}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition whitespace-nowrap ${
                filter === 'out' ? 'bg-red-500 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              ❌ نفد ({stats?.outOfStockCount || 0})
            </button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">المنتج</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">الكود</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">القسم</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">الكمية</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">الحد الأدنى</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">الحالة</th>
                  <th className="p-4 text-left text-xs font-bold text-gray-500">القيمة</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const badge = getStatusBadge(item.stockStatus);
                  return (
                    <tr key={item.productId} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <p className="font-bold text-sm text-[#0a2e1f]">{item.productNameAr}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-500 font-mono">{item.sku}</td>
                      <td className="p-4 text-sm text-gray-600">{item.categoryNameAr}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-lg font-bold ${
                          item.availableQuantity <= 0 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.availableQuantity}
                        </span>
                      </td>
                      <td className="p-4 text-center text-sm text-gray-500">{item.lowStockThreshold}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                          {badge.text}
                        </span>
                      </td>
                      <td className="p-4 text-left font-bold text-[#15803d]">
                        {((item.costPrice || 0) * item.availableQuantity).toLocaleString()} <span className="text-xs">ج.م</span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => openAddStock(item)}
                          className="bg-[#f0fdf4] text-[#15803d] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#15803d] hover:text-white transition shadow-sm whitespace-nowrap"
                        >
                          + إضافة كمية
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-10 text-center text-gray-400">
                      <span className="text-4xl block mb-2 opacity-30">📦</span>
                      لا توجد منتجات مطابقة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Stock Modal */}
        {showAddModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#0a2e1f] flex items-center gap-2">
                  <span>➕</span> إضافة كمية للمخزن
                </h2>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                  ✕
                </button>
              </div>

              <div className="mb-6 bg-[#f0fdf4] p-4 rounded-2xl border border-[#15803d]/20">
                <p className="font-bold text-[#0a2e1f]">{selectedProduct.productNameAr}</p>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-600">الكود: {selectedProduct.sku}</p>
                  <p className="text-sm font-bold text-[#15803d]">الكمية الحالية: {selectedProduct.availableQuantity}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">الكمية المضافة *</label>
                  <input
                    type="number"
                    value={addQty}
                    onChange={(e) => setAddQty(Number(e.target.value))}
                    className="w-full p-3 rounded-xl border-2 border-[#15803d] bg-white focus:ring-4 focus:ring-[#15803d]/20 outline-none text-lg font-bold text-[#0a2e1f]"
                    min="1"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">ملاحظات (اختياري)</label>
                  <input
                    type="text"
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none transition"
                    placeholder="مثال: توريد من المورد"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={handleAddStock}
                  disabled={adding}
                  className="flex-1 bg-[#15803d] text-white py-3.5 rounded-xl font-bold hover:bg-[#0a2e1f] transition shadow-lg shadow-[#15803d]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <span className="animate-pulse">جاري الإضافة...</span>
                  ) : (
                    <>
                      <span>✅</span> تأكيد الإضافة
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="bg-white text-gray-700 border-2 border-gray-200 px-6 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}