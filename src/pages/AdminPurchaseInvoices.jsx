import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
        setProducts(prodRes.data.data.items || []);

        const prods = prodRes.data.data.items || [];
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
    if (!selectedProduct) return;
    if (selectedQty <= 0) return alert('الكمية يجب أن تكون أكبر من صفر');
    if (selectedCost <= 0) return alert('التكلفة يجب أن تكون أكبر من صفر');

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

      alert('✅ تم حفظ الفاتورة بنجاح');
      navigate(`/admin/purchase-invoices/${invoice.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-serif font-bold text-brand-dark">➕ فاتورة شراء جديدة</h1>
        <button
          onClick={() => navigate('/admin/purchase-invoices')}
          className="bg-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-300"
        >
          ← رجوع
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-brand-dark">بيانات الفاتورة</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold block mb-1">المورد *</label>
                <select
                  className="input-field"
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
                <label className="text-sm font-bold block mb-1">تاريخ الفاتورة</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.orderDate}
                  onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">التاريخ المتوقع للاستلام</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.expectedDate}
                  onChange={(e) => setForm({ ...form, expectedDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-brand-dark">إضافة منتجات</h2>
            <div className="grid md:grid-cols-4 gap-2 items-end">
              <div className="md:col-span-2">
                <label className="text-sm font-bold block mb-1">المنتج</label>
                <select
                  className="input-field"
                  value={selectedProduct}
                  onChange={(e) => handleProductChange(e.target.value)}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.nameAr} - {p.sku}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">الكمية</label>
                <input
                  type="number"
                  className="input-field"
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(Number(e.target.value))}
                  min="1"
                />
              </div>
              <div>
                <label className="text-sm font-bold block mb-1">سعر التكلفة</label>
                <input
                  type="number"
                  className="input-field"
                  value={selectedCost}
                  onChange={(e) => setSelectedCost(Number(e.target.value))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-3 bg-brand-main text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-dark transition"
            >
              + إضافة المنتج
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-right text-xs font-bold text-gray-500">المنتج</th>
                  <th className="p-3 text-right text-xs font-bold text-gray-500">الكمية</th>
                  <th className="p-3 text-right text-xs font-bold text-gray-500">سعر التكلفة</th>
                  <th className="p-3 text-right text-xs font-bold text-gray-500">الإجمالي</th>
                  <th className="p-3 text-right text-xs font-bold text-gray-500"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.productId} className="border-t border-gray-100">
                    <td className="p-3">
                      <p className="font-bold text-sm">{item.productNameAr}</p>
                      <p className="text-xs text-gray-500">{item.sku}</p>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItemQty(item.productId, Number(e.target.value))}
                        className="w-20 border rounded-lg px-2 py-1 text-sm"
                        min="1"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        value={item.unitCost}
                        onChange={(e) => updateItemCost(item.productId, Number(e.target.value))}
                        className="w-24 border rounded-lg px-2 py-1 text-sm"
                        min="0"
                        step="0.01"
                      />
                    </td>
                    <td className="p-3 font-bold text-brand-main">
                      {item.lineTotal?.toLocaleString()} ج.م
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan="5" className="p-6 text-center text-gray-500">لم تتم إضافة أي منتجات</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <label className="text-sm font-bold block mb-1">ملاحظات</label>
            <textarea
              className="input-field"
              rows="2"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-4 text-brand-dark">الملخص</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">الإجمالي الفرعي</span>
              <span className="font-bold">{subTotal.toLocaleString()} ج.م</span>
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">الضريبة</label>
              <input
                type="number"
                className="input-field"
                value={form.taxAmount}
                onChange={(e) => setForm({ ...form, taxAmount: Number(e.target.value) })}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">الشحن</label>
              <input
                type="number"
                className="input-field"
                value={form.shippingCost}
                onChange={(e) => setForm({ ...form, shippingCost: Number(e.target.value) })}
                min="0"
                step="0.01"
              />
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span className="text-brand-dark">الإجمالي</span>
              <span className="text-brand-main">{totalAmount.toLocaleString()} ج.م</span>
            </div>
            <div>
              <label className="text-sm font-bold block mb-1">المبلغ المدفوع</label>
              <input
                type="number"
                className="input-field"
                value={form.paidAmount}
                onChange={(e) => setForm({ ...form, paidAmount: Number(e.target.value) })}
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span className="text-brand-dark">المتبقي</span>
              <span className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                {remaining.toLocaleString()} ج.م
              </span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full btn-primary py-4 text-lg mt-4 disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : '💾 حفظ الفاتورة'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}