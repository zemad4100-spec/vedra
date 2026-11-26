import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

export default function AdminPurchaseInvoiceNew() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    supplierId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    taxAmount: 0,
    shippingCost: 0,
    paidAmount: 0,
    notes: '',
  });

  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedCost, setSelectedCost] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [supRes, prodRes] = await Promise.all([
          api.get('/admin/suppliers'),
          api.get('/products', { params: { pageSize: 100 } }),
        ]);
        setSuppliers(supRes.data.data || []);
        const prods = prodRes.data.data.items || [];
        setProducts(prods);

        if (prods.length > 0) {
          setSelectedProduct(prods[0].id);
          setSelectedCost(prods[0].costPrice || prods[0].basePrice || 0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleProductChange = (productId) => {
    setSelectedProduct(productId);
    const product = products.find(p => p.id === parseInt(productId));
    if (product) setSelectedCost(product.costPrice || product.basePrice || 0);
  };

  const addItem = () => {
    if (!selectedProduct) return showError('يجب اختيار منتج');
    if (selectedQty <= 0) return showError('الكمية يجب أن تكون أكبر من صفر');
    if (selectedCost <= 0) return showError('التكلفة يجب أن تكون أكبر من صفر');

    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;

    const existing = items.find(i => i.productId === product.id);

    if (existing) {
      setItems(items.map(i => i.productId === product.id
        ? { ...i, quantity: i.quantity + selectedQty, lineTotal: (i.quantity + selectedQty) * i.unitCost }
        : i
      ));
    } else {
      setItems([...items, {
        productId: product.id,
        productNameAr: product.nameAr,
        sku: product.sku,
        quantity: selectedQty,
        unitCost: selectedCost,
        lineTotal: selectedQty * selectedCost,
      }]);
    }

    setSelectedQty(1);
    showSuccess('تمت إضافة المنتج للفاتورة');
  };

  const removeItem = (productId) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const updateItemQty = (productId, qty) => {
    if (qty <= 0) return removeItem(productId);
    setItems(items.map(i => i.productId === productId
      ? { ...i, quantity: qty, lineTotal: qty * i.unitCost }
      : i
    ));
  };

  const updateItemCost = (productId, cost) => {
    if (cost < 0) return;
    setItems(items.map(i => i.productId === productId
      ? { ...i, unitCost: cost, lineTotal: i.quantity * cost }
      : i
    ));
  };

  const subTotal = items.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);
  const totalAmount = subTotal + Number(form.taxAmount) + Number(form.shippingCost);
  const remaining = totalAmount - Number(form.paidAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.supplierId) return setError('يجب اختيار المورد');
    if (items.length === 0) return setError('يجب إضافة منتج واحد على الأقل');

    setSaving(true);
    try {
      const payload = {
        supplierId: Number(form.supplierId),
        warehouseId: 1,
        orderDate: form.orderDate,
        expectedDate: form.expectedDate || null,
        taxAmount: Number(form.taxAmount),
        shippingCost: Number(form.shippingCost),
        paidAmount: Number(form.paidAmount),
        notes: form.notes,
        items: items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          unitCost: i.unitCost,
        })),
      };

      const res = await api.post('/admin/purchase-invoices', payload);
      const invoice = res.data.data;

      showSuccess('✅ تم حفظ الفاتورة بنجاح');
      navigate(`/admin/purchase-invoices/${invoice.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل الحفظ';
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">جاري التحميل...</div>;

  return (
    <div className="pb-10 bg-[#f4f7f6] min-h-screen -m-6 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a2e1f]">➕ فاتورة شراء جديدة</h1>
            <p className="text-gray-500 mt-1 text-sm">قم بتسجيل تفاصيل الفاتورة والمنتجات المشتراة</p>
          </div>
          <button
            onClick={() => navigate('/admin/purchase-invoices')}
            className="flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition shadow-sm w-full sm:w-auto justify-center"
          >
            <span>→</span> رجوع للفواتير
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-center gap-2"><span>⚠️</span> {error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Invoice Details Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-5 text-[#0a2e1f] flex items-center gap-2">
                <span>📄</span> بيانات الفاتورة
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">المورد *</label>
                  <select
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] focus:border-transparent outline-none transition"
                    value={form.supplierId}
                    onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                    required
                  >
                    <option value="">اختر المورد...</option>
                    {suppliers.filter(s => s.isActive).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">تاريخ الفاتورة</label>
                  <input
                    type="date"
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] focus:border-transparent outline-none transition"
                    value={form.orderDate}
                    onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">التاريخ المتوقع للاستلام</label>
                  <input
                    type="date"
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] focus:border-transparent outline-none transition"
                    value={form.expectedDate}
                    onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Add Products Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold mb-5 text-[#0a2e1f] flex items-center gap-2">
                <span>📦</span> إضافة منتجات
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-5">
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">المنتج</label>
                  <select
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] focus:border-transparent outline-none transition"
                    value={selectedProduct}
                    onChange={(e) => handleProductChange(e.target.value)}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.nameAr} - {p.sku}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">الكمية</label>
                  <input
                    type="number"
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] focus:border-transparent outline-none transition text-center"
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">سعر التكلفة</label>
                  <input
                    type="number"
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] focus:border-transparent outline-none transition text-center"
                    value={selectedCost}
                    onChange={(e) => setSelectedCost(Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full bg-[#15803d] text-white p-3 rounded-xl font-bold hover:bg-[#0a2e1f] transition shadow-sm flex items-center justify-center gap-1"
                  >
                    <span>+</span> إضافة
                  </button>
                </div>
              </div>
            </div>

            {/* Items Table Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-gray-700">المنتجات المضافة ({items.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="p-4 text-right text-xs font-bold text-gray-500">المنتج</th>
                      <th className="p-4 text-center text-xs font-bold text-gray-500">الكمية</th>
                      <th className="p-4 text-center text-xs font-bold text-gray-500">سعر التكلفة</th>
                      <th className="p-4 text-left text-xs font-bold text-gray-500">الإجمالي</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.productId} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                        <td className="p-4">
                          <p className="font-bold text-sm text-[#0a2e1f]">{item.productNameAr}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{item.sku}</p>
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQty(item.productId, Number(e.target.value))}
                            className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-[#15803d] outline-none"
                            min="1"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="number"
                            value={item.unitCost}
                            onChange={(e) => updateItemCost(item.productId, Number(e.target.value))}
                            className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:ring-2 focus:ring-[#15803d] outline-none"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="p-4 text-left font-bold text-[#15803d]">
                          {item.lineTotal?.toLocaleString()} <span className="text-xs">ج.م</span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-10 text-center text-gray-400">
                          <span className="text-4xl block mb-2 opacity-30">🛒</span>
                          لم تتم إضافة أي منتجات بعد
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <label className="text-sm font-bold text-gray-700 block mb-2">ملاحظات إضافية</label>
              <textarea
                className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] focus:border-transparent outline-none transition resize-none"
                rows="3"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="أي ملاحظات بخصوص التوريد أو المورد..."
              />
            </div>
          </div>

          {/* Sidebar Summary (Right) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-6">
              <h2 className="text-xl font-bold mb-6 text-[#0a2e1f] flex items-center gap-2">
                <span>🧾</span> ملخص الفاتورة
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-bold">الإجمالي الفرعي</span>
                  <span className="font-bold text-gray-800">{subTotal.toLocaleString()} ج.م</span>
                </div>
                
                <div>
                  <label className="text-sm font-bold text-gray-500 block mb-1.5">الضريبة</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full p-3 pl-12 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none text-left font-bold"
                      value={form.taxAmount}
                      onChange={(e) => setForm({ ...form, taxAmount: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ج.م</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-bold text-gray-500 block mb-1.5">الشحن</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full p-3 pl-12 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#15803d] outline-none text-left font-bold"
                      value={form.shippingCost}
                      onChange={(e) => setForm({ ...form, shippingCost: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ج.م</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-[#0a2e1f]">الإجمالي</span>
                  <span className="text-2xl font-bold text-[#15803d]">{totalAmount.toLocaleString()} <span className="text-sm">ج.م</span></span>
                </div>

                <div className="pt-2">
                  <label className="text-sm font-bold text-gray-500 block mb-1.5">المبلغ المدفوع</label>
                  <div className="relative">
                    <input
                      type="number"
                      className="w-full p-3 pl-12 rounded-xl border-2 border-[#15803d] bg-white focus:ring-4 focus:ring-[#15803d]/20 outline-none text-left font-bold text-lg text-[#0a2e1f]"
                      value={form.paidAmount}
                      onChange={(e) => setForm({ ...form, paidAmount: Number(e.target.value) })}
                      min="0"
                      step="0.01"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#15803d] font-bold text-sm">ج.م</span>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <span className="text-sm font-bold text-gray-500">المتبقي</span>
                  <span className={`font-bold text-lg ${remaining > 0 ? 'text-red-500' : 'text-[#15803d]'}`}>
                    {remaining.toLocaleString()} <span className="text-xs">ج.م</span>
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#15803d] text-white py-4 rounded-xl font-bold text-lg mt-6 hover:bg-[#0a2e1f] transition shadow-lg shadow-[#15803d]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <span className="animate-pulse">جاري الحفظ...</span>
                  ) : (
                    <>
                      <span>💾</span> حفظ الفاتورة
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}