import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { cartService } from '../services/cartService';
import { showSuccess, showError, showInfo } from '../utils/toast';

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const sessionId = localStorage.getItem('sessionId');

  const [form, setForm] = useState({
    shippingRecipient: user.fullName || '',
    shippingPhone: user.phone || '',
    shippingCity: 'القاهرة',
    shippingStreet: '',
    shippingBuilding: '',
    paymentMethod: 'COD',
    customerNotes: '',
  });

  useEffect(() => {
    if (!user.fullName) {
      showInfo('يجب تسجيل الدخول أولاً');
      setTimeout(() => navigate('/login'), 1000);
      return;
    }

    cartService.getCart(sessionId)
      .then(res => {
        const cartData = res.data.data;
        if (!cartData || cartData.items.length === 0) {
          showInfo('السلة فارغة');
          navigate('/cart');
          return;
        }
        setCart(cartData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [sessionId, navigate, user.fullName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/orders', form);
      showSuccess('تم إنشاء الطلب بنجاح! 🎉');
      setTimeout(() => navigate('/orders'), 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'فشل إنشاء الطلب';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl">جاري التحميل...</div>;
  if (!cart) return null;

  const shippingCost = cart.subTotal >= 500 ? 0 : 50;
  const taxAmount = cart.subTotal * 0.14;
  const grandTotal = cart.subTotal + shippingCost + taxAmount;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-brand-dark mb-8">إتمام الطلب</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">بيانات التوصيل</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold mb-1 block">الاسم</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.shippingRecipient}
                  onChange={(e) => setForm({ ...form, shippingRecipient: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">رقم الهاتف</label>
                <input
                  type="tel"
                  className="input-field"
                  value={form.shippingPhone}
                  onChange={(e) => setForm({ ...form, shippingPhone: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">المدينة</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.shippingCity}
                  onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">الشارع</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.shippingStreet}
                  onChange={(e) => setForm({ ...form, shippingStreet: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-bold mb-1 block">رقم المبنى</label>
                <input
                  type="text"
                  className="input-field"
                  value={form.shippingBuilding}
                  onChange={(e) => setForm({ ...form, shippingBuilding: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">طريقة الدفع</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={form.paymentMethod === 'COD'}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                />
                <span className="font-bold">💰 الدفع عند الاستلام</span>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="Card"
                  checked={form.paymentMethod === 'Card'}
                  onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                />
                <span className="font-bold">💳 بطاقة ائتمانية (قيد التطوير)</span>
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">ملاحظات إضافية</h2>
            <textarea
              className="input-field"
              rows="3"
              value={form.customerNotes}
              onChange={(e) => setForm({ ...form, customerNotes: e.target.value })}
              placeholder="أي ملاحظات للمندوب..."
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
          
          <div className="space-y-2 mb-4 max-h-48 overflow-auto">
            {cart.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.productNameAr} × {item.quantity}</span>
                <span className="font-bold">{item.lineTotal?.toLocaleString()} ج.م</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>المجموع الفرعي</span>
              <span>{cart.subTotal?.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between">
              <span>الشحن</span>
              <span>{shippingCost === 0 ? 'مجاني' : `${shippingCost} ج.م`}</span>
            </div>
            <div className="flex justify-between">
              <span>الضريبة (14%)</span>
              <span>{taxAmount.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>الإجمالي</span>
              <span className="text-brand-main">{grandTotal.toLocaleString()} ج.م</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary py-4 mt-6 disabled:opacity-50"
          >
            {submitting ? 'جاري التأكيد...' : '✅ تأكيد الطلب'}
          </button>
        </div>
      </form>
    </div>
  );
}