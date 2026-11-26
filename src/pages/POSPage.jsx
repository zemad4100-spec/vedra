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
    <div className="h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 bg-[#f4f7f6]">
      
      {/* المنتجات */}
      <div className="lg:col-span-2 bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col">
        <h2 className="text-xl font-bold text-[#0a2e1f] mb-4 flex items-center gap-2">
          <span>🛍️</span> المنتجات
        </h2>
        <div className="relative mb-4">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="ابحث بالاسم أو الكود..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 pr-12 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15803d] focus:border-transparent transition-all"
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-10">جاري التحميل...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto pr-1 custom-scrollbar">
            {filtered.map(p => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white border border-gray-100 p-4 rounded-2xl text-right hover:shadow-lg hover:border-[#15803d]/30 hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#f0fdf4] rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
                <p className="font-bold text-sm text-gray-800 truncate mb-1">{p.nameAr}</p>
                <p className="text-[10px] text-gray-400 bg-gray-50 inline-block px-2 py-0.5 rounded-md mb-3">{p.sku}</p>
                <div className="flex justify-between items-end mt-2">
                  <p className="text-[#15803d] font-bold text-lg">{p.effectivePrice?.toLocaleString()} <span className="text-xs">ج.م</span></p>
                  <span className="w-8 h-8 bg-[#15803d]/10 text-[#15803d] rounded-full flex items-center justify-center group-hover:bg-[#15803d] group-hover:text-white transition-colors">+</span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                لا توجد منتجات مطابقة للبحث
              </div>
            )}
          </div>
        )}
      </div>

      {/* السلة والدفع */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col h-full max-h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#0a2e1f] flex items-center gap-2">
            <span>🛒</span> الفاتورة
          </h3>
          <span className="bg-[#f0fdf4] text-[#15803d] px-3 py-1 rounded-lg text-sm font-bold">
            {cart.length} عنصر
          </span>
        </div>

        <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-1 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-5xl mb-3 opacity-50">🛒</span>
              <p>الفاتورة فارغة، ابدأ بإضافة منتجات</p>
            </div>
          ) : cart.map(item => (
            <div key={item.id} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 relative group">
              <div className="flex justify-between items-start mb-2 pr-6">
                <p className="font-bold text-sm text-gray-800">{item.nameAr}</p>
                <button 
                  onClick={() => removeItem(item.id)} 
                  className="absolute top-3 left-3 text-red-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                >
                  🗑️
                </button>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                  <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-md flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold">-</button>
                  <span className="font-bold w-8 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-md flex items-center justify-center text-[#15803d] hover:bg-[#f0fdf4] font-bold">+</button>
                </div>
                <p className="font-bold text-[#15803d]">{(item.effectivePrice * item.quantity)?.toLocaleString()} <span className="text-xs">ج.م</span></p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">اسم العميل</label>
              <input
                type="text"
                placeholder="عميل نقدي"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#15803d]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 mb-1 block">رقم الهاتف</label>
              <input
                type="tel"
                placeholder="اختياري"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#15803d]"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>المجموع الفرعي:</span>
              <span className="font-bold">{subTotal?.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>الضريبة (14%):</span>
              <span className="font-bold">{tax?.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2 text-[#0a2e1f]">
              <span>الإجمالي:</span>
              <span>{total?.toLocaleString()} ج.م</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 mb-1 block">المبلغ المدفوع</label>
            <input
              type="number"
              placeholder="0"
              value={paid || ''}
              onChange={(e) => setPaid(Number(e.target.value))}
              className="w-full p-3 rounded-xl border-2 border-[#15803d] bg-white text-lg font-bold text-[#0a2e1f] focus:outline-none focus:ring-4 focus:ring-[#15803d]/20 transition-all"
            />
            {paid > 0 && (
              <div className={`flex justify-between text-sm mt-2 font-bold px-2 ${change >= 0 ? 'text-[#15803d]' : 'text-red-500'}`}>
                <span>الباقي للعميل:</span>
                <span>{change?.toLocaleString()} ج.م</span>
              </div>
            )}
          </div>

          <button
            onClick={checkout}
            disabled={submitting || cart.length === 0}
            className="w-full bg-[#15803d] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0a2e1f] transition-all shadow-lg shadow-[#15803d]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="animate-pulse">جاري الحفظ...</span>
            ) : (
              <>
                <span>✅</span> إتمام البيع
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal نجاح البيع */}
      {completedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md text-center shadow-2xl animate-fade-in">
            <div className="w-20 h-20 bg-[#f0fdf4] rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
              <span className="text-5xl">🎉</span>
            </div>

            <h2 className="text-2xl font-bold text-[#0a2e1f] mb-1">تم البيع بنجاح!</h2>
            <p className="text-gray-500 text-sm mb-6">الفاتورة جاهزة للطباعة</p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-right border border-gray-100">
              <div className="flex justify-between py-2 border-b border-gray-200 border-dashed">
                <span className="text-sm text-gray-600">رقم الفاتورة</span>
                <span className="font-bold text-[#0a2e1f]">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 border-dashed">
                <span className="text-sm text-gray-600">الإجمالي</span>
                <span className="font-bold text-[#0a2e1f]">
                  {completedOrder.grandTotal?.toLocaleString()} ج.م
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 border-dashed">
                <span className="text-sm text-gray-600">المبلغ المدفوع</span>
                <span className="font-bold text-[#15803d]">
                  {completedOrder.paidAmount?.toLocaleString()} ج.م
                </span>
              </div>
              {completedOrder.changeAmount > 0 && (
                <div className="flex justify-between py-2 pt-3">
                  <span className="text-sm font-bold text-gray-700">الباقي للعميل</span>
                  <span className="font-bold text-red-600 bg-red-50 px-2 rounded-md">
                    {completedOrder.changeAmount?.toLocaleString()} ج.م
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={printInvoice}
                className="w-full bg-[#15803d] text-white py-3.5 rounded-xl font-bold hover:bg-[#0a2e1f] transition shadow-lg shadow-[#15803d]/30 flex items-center justify-center gap-2"
              >
                <span>🖨️</span> طباعة الفاتورة
              </button>
              <button
                onClick={startNewSale}
                className="w-full bg-white text-[#0a2e1f] border-2 border-gray-200 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <span>🔄</span> فاتورة جديدة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}