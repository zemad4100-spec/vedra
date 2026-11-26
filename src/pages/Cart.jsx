import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartService } from '../services/cartService';
import api from '../services/api';
import { showSuccess, showError, showInfo } from '../utils/toast';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [shippingForm, setShippingForm] = useState({
    shippingRecipient: user?.fullName || '',
    shippingPhone: user?.phone || '',
    shippingCity: 'القاهرة',
    shippingStreet: '',
    shippingBuilding: '',
    paymentMethod: 'COD',
    customerNotes: '',
  });

  const getSessionId = () => {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = 'guest-' + Math.random().toString(36).substring(7);
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  const loadCart = () => {
    setLoading(true);
    cartService.getCart(getSessionId())
      .then(res => setCart(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCart(); }, []);

  const handleUpdate = async (itemId, qty) => {
    if (qty < 1) {
      await handleRemove(itemId);
      return;
    }
    try {
      await cartService.updateItem(itemId, qty, getSessionId());
      loadCart();
    } catch (err) {
      showError('فشل التحديث');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await cartService.removeItem(itemId, getSessionId());
      showSuccess('تم حذف المنتج من السلة');
      loadCart();
    } catch (err) {
      showError('فشل الحذف');
    }
  };

  const handleOpenCheckout = () => {
    if (!user) {
      showInfo('يجب تسجيل الدخول لإتمام الطلب');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      return;
    }
    setShowCheckoutForm(true);
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();
    setCheckoutLoading(true);

    try {
      const res = await api.post('/orders', shippingForm);
      const order = res.data.data;
      
      setCompletedOrder(order);
      setShowCheckoutForm(false);
      showSuccess('تم إنشاء طلبك بنجاح! 🎉');
    } catch (err) {
      showError('فشل إنشاء الطلب: ' + (err.response?.data?.message || err.message));
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl">جاري التحميل...</div>;

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  // ✅ شاشة نجاح الطلب
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">✅</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-3">
            تم إنشاء طلبك بنجاح!
          </h1>
          <p className="text-gray-500 mb-8">
            شكراً لثقتك في Verda 🌿 هيتم التواصل معاك لتأكيد التوصيل.
          </p>

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-right">
            <div className="flex justify-between py-3 border-b">
              <span className="text-sm text-gray-600">رقم الطلب</span>
              <span className="font-bold text-brand-dark">{completedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between py-3 border-b">
              <span className="text-sm text-gray-600">الحالة</span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                {completedOrder.status}
              </span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-sm text-gray-600">الإجمالي</span>
              <span className="font-bold text-brand-main text-lg">
                {completedOrder.grandTotal?.toLocaleString()} ج.م
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full btn-primary py-4 text-base"
            >
              📋 تتبع طلباتك
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-brand-dark py-3 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              🛍️ متابعة التسوق
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-brand-dark mb-8">🛒 سلة المشتريات</h1>

      {isEmpty ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
          <p className="text-7xl mb-6">🛒</p>
          <p className="text-gray-500 text-lg mb-6">السلة فارغة</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/" className="btn-primary inline-block">ابدأ التسوق 🌱</Link>
            {/* ✅ زرار تتبع الطلبات (لو مسجل دخول) */}
            {user && (
              <Link 
                to="/orders" 
                className="btn-outline inline-block"
              >
                📋 تتبع طلباتك
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl flex gap-4 items-center shadow-sm">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/100'}
                  alt={item.productNameAr}
                  className="w-24 h-24 rounded-xl object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/100'; }}
                />
                <div className="flex-1">
                  <h3 className="font-bold text-brand-dark">{item.productNameAr}</h3>
                  <p className="text-brand-main font-bold mt-1">
                    {item.unitPrice?.toLocaleString()} ج.م
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg">
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity - 1)}
                    className="w-8 h-8 font-bold text-lg hover:bg-gray-200 rounded-lg"
                  >-</button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => handleUpdate(item.id, item.quantity + 1)}
                    className="w-8 h-8 font-bold text-lg hover:bg-gray-200 rounded-lg"
                  >+</button>
                </div>
                <div className="text-left">
                  <p className="font-bold text-brand-dark">{(item.lineTotal)?.toLocaleString()} ج.م</p>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-red-600 font-bold text-xs mt-1"
                  >حذف</button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white p-6 rounded-2xl h-fit sticky top-24 shadow-sm">
            <h3 className="text-xl font-bold mb-4 text-brand-dark">ملخص الطلب</h3>
            <div className="flex justify-between mb-3 text-sm">
              <span className="text-gray-600">عدد المنتجات</span>
              <span className="font-bold">{cart.totalItems}</span>
            </div>
            <div className="flex justify-between mb-4 text-sm">
              <span className="text-gray-600">الإجمالي الفرعي</span>
              <span className="font-bold">{cart.subTotal?.toLocaleString()} ج.م</span>
            </div>
            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between font-bold text-xl">
                <span className="text-brand-dark">الإجمالي</span>
                <span className="text-brand-main">{cart.subTotal?.toLocaleString()} ج.م</span>
              </div>
            </div>
            <button
              onClick={handleOpenCheckout}
              className="w-full btn-primary py-4 text-base mb-3"
            >
              إتمام الطلب ✅
            </button>

            {/* ✅ زرار تتبع الطلبات (لو مسجل دخول) */}
            {user && (
              <Link
                to="/orders"
                className="w-full block text-center border-2 border-brand-main text-brand-main py-3 rounded-xl font-bold hover:bg-brand-main hover:text-white transition"
              >
                📋 تتبع طلباتك
              </Link>
            )}

            <Link to="/" className="block text-center text-brand-main font-bold text-sm mt-4 hover:underline">
              ← متابعة التسوق
            </Link>
          </div>
        </div>
      )}

      {/* ✅ Modal إتمام الطلب */}
      {showCheckoutForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-brand-dark">بيانات التوصيل</h2>
              <button 
                onClick={() => setShowCheckoutForm(false)}
                className="text-2xl text-gray-400 hover:text-gray-600"
              >✕</button>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold block mb-1">الاسم *</label>
                  <input
                    type="text"
                    className="input-field"
                    value={shippingForm.shippingRecipient}
                    onChange={(e) => setShippingForm({ ...shippingForm, shippingRecipient: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-bold block mb-1">رقم الهاتف *</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={shippingForm.shippingPhone}
                    onChange={(e) => setShippingForm({ ...shippingForm, shippingPhone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold block mb-1">المدينة *</label>
                <input
                  type="text"
                  className="input-field"
                  value={shippingForm.shippingCity}
                  onChange={(e) => setShippingForm({ ...shippingForm, shippingCity: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold block mb-1">الشارع *</label>
                <input
                  type="text"
                  className="input-field"
                  value={shippingForm.shippingStreet}
                  onChange={(e) => setShippingForm({ ...shippingForm, shippingStreet: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-bold block mb-1">رقم المبنى</label>
                <input
                  type="text"
                  className="input-field"
                  value={shippingForm.shippingBuilding}
                  onChange={(e) => setShippingForm({ ...shippingForm, shippingBuilding: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-bold block mb-1">ملاحظات</label>
                <textarea
                  className="input-field"
                  rows="2"
                  value={shippingForm.customerNotes}
                  onChange={(e) => setShippingForm({ ...shippingForm, customerNotes: e.target.value })}
                  placeholder="أي ملاحظات للمندوب..."
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>الشحن</span>
                  <span>{cart.subTotal >= 500 ? 'مجاني' : '50 ج.م'}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>الضريبة (14%)</span>
                  <span>{(cart.subTotal * 0.14).toLocaleString()} ج.م</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>الإجمالي</span>
                  <span className="text-brand-main">
                    {(
                      cart.subTotal + 
                      (cart.subTotal >= 500 ? 0 : 50) + 
                      (cart.subTotal * 0.14)
                    ).toLocaleString()} ج.م
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={checkoutLoading}
                className="w-full btn-primary py-4 disabled:opacity-50"
              >
                {checkoutLoading ? 'جاري التأكيد...' : '✅ تأكيد الطلب'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}