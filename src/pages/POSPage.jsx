import { useEffect, useState } from 'react';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState({ name: 'عميل نقدي', phone: '' });
  const [paid, setPaid] = useState(0);
  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    api.get('/products', { params: { pageSize: 100 } })
      .then(res => setProducts(res.data.data.items || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p =>
    p.nameAr.includes(search) || p.sku?.includes(search)
  );

  const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const removeItem = (id) => setCart(cart.filter(i => i.id !== id));

  const subTotal = cart.reduce((sum, i) => sum + (i.effectivePrice * i.quantity), 0);
  const tax = subTotal * 0.14;
  const total = subTotal + tax;
  const change = paid - total;

  const checkout = async () => {
    if (cart.length === 0) return showError('السلة فارغة');
    if (paid < total) return showError('المبلغ المدفوع أقل من الإجمالي');

    setSubmitting(true);
    try {
      const payload = {
        customerName: customer.name || 'عميل نقدي',
        customerPhone: customer.phone || null,
        items: cart.map(i => ({
          productId: i.id,
          quantity: i.quantity,
          unitPrice: i.effectivePrice,
        })),
        paidAmount: paid,
        paymentMethod: 'COD',
      };

      const res = await api.post('/orders/pos-order', payload);
      const order = res.data.data;

      // إظهار Modal النجاح
      setCompletedOrder({
        ...order,
        paidAmount: paid,
        changeAmount: paid - order.grandTotal,
      });

      showSuccess('تم إنشاء الفاتورة بنجاح! 🎉');
    } catch (err) {
      showError('فشل: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const printInvoice = () => {
    if (!completedOrder) return;
    window.open(`/admin/orders/${completedOrder.id}`, '_blank');
  };

  const startNewSale = () => {
    setCompletedOrder(null);
    setCart([]);
    setPaid(0);
    setCustomer({ name: 'عميل نقدي', phone: '' });
  };

  return (
    <>
      <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Products */}
        <div className="lg:col-span-2 bg-gray-800 rounded-2xl p-4 flex flex-col">
          <input
            type="text"
            placeholder="🔍 ابحث بالاسم أو الكود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-main"
          />

          {loading ? (
            <p className="text-center text-gray-400 py-10">جاري التحميل...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-auto">
              {filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-gray-700 p-3 rounded-xl text-right hover:bg-gray-600 transition"
                >
                  <p className="font-bold text-sm text-white truncate">{p.nameAr}</p>
                  <p className="text-xs text-gray-400">{p.sku}</p>
                  <p className="text-brand-sand font-bold mt-2">{p.effectivePrice?.toLocaleString()} ج.م</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="bg-gray-800 rounded-2xl p-4 flex flex-col">
          <h3 className="text-xl font-bold mb-4">🛒 الفاتورة الحالية</h3>

          <div className="flex-1 overflow-auto mb-4 space-y-2">
            {cart.length === 0 ? (
              <p className="text-center text-gray-400 py-10">الفاتورة فارغة</p>
            ) : cart.map(item => (
              <div key={item.id} className="bg-gray-700 p-3 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold text-sm">{item.nameAr}</p>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 text-xs">🗑️</button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="bg-gray-600 w-7 h-7 rounded font-bold">-</button>
                    <span className="font-bold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="bg-gray-600 w-7 h-7 rounded font-bold">+</button>
                  </div>
                  <p className="font-bold text-brand-sand">{(item.effectivePrice * item.quantity)?.toLocaleString()} ج.م</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 pt-3 space-y-3">
            <input
              type="text"
              placeholder="اسم العميل"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              className="w-full p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 text-sm"
            />
            <input
              type="tel"
              placeholder="رقم الهاتف"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="w-full p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 text-sm"
            />
            <input
              type="number"
              placeholder="المبلغ المدفوع"
              value={paid || ''}
              onChange={(e) => setPaid(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 text-sm"
            />

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span>{subTotal?.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span>الضريبة (14%):</span>
                <span>{tax?.toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-2">
                <span>الإجمالي:</span>
                <span className="text-brand-sand">{total?.toLocaleString()} ج.م</span>
              </div>
              {paid > 0 && (
                <div className="flex justify-between text-sm">
                  <span>الباقي:</span>
                  <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {change?.toLocaleString()} ج.م
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={checkout}
              disabled={submitting || cart.length === 0}
              className="w-full bg-brand-main text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-dark transition disabled:opacity-50"
            >
              {submitting ? 'جاري الحفظ...' : '✅ إتمام البيع'}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Modal نجاح البيع */}
      {completedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl">✅</span>
            </div>

            <h2 className="text-2xl font-bold text-brand-dark mb-2">تم البيع بنجاح!</h2>
            <p className="text-gray-500 text-sm mb-6">الفاتورة جاهزة للطباعة</p>

            {/* Invoice Details */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-right">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-600">رقم الفاتورة</span>
                <span className="font-bold text-brand-dark">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-600">الإجمالي</span>
                <span className="font-bold text-brand-dark">
                  {completedOrder.grandTotal?.toLocaleString()} ج.م
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-600">المبلغ المدفوع</span>
                <span className="font-bold text-green-600">
                  {completedOrder.paidAmount?.toLocaleString()} ج.م
                </span>
              </div>
              {completedOrder.changeAmount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">الباقي للعميل</span>
                  <span className="font-bold text-red-600">
                    {completedOrder.changeAmount?.toLocaleString()} ج.م
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={printInvoice}
                className="w-full bg-brand-main text-white py-3 rounded-xl font-bold hover:bg-brand-dark transition"
              >
                🖨️ طباعة الفاتورة
              </button>
              <button
                onClick={startNewSale}
                className="w-full bg-gray-200 text-brand-dark py-3 rounded-xl font-bold hover:bg-gray-300 transition"
              >
                🔄 فاتورة جديدة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}