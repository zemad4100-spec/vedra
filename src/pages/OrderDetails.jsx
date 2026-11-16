import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;
  if (!order) return null;

  const getStatusLabel = (status) => {
    const map = {
      New: { text: 'جديد', color: 'bg-blue-100 text-blue-700' },
      Confirmed: { text: 'مؤكد', color: 'bg-green-100 text-green-700' },
      Preparing: { text: 'قيد التجهيز', color: 'bg-yellow-100 text-yellow-700' },
      OutForDelivery: { text: 'خرج للتوصيل', color: 'bg-purple-100 text-purple-700' },
      Delivered: { text: 'تم التسليم', color: 'bg-emerald-100 text-emerald-700' },
      Cancelled: { text: 'ملغي', color: 'bg-red-100 text-red-700' },
      Returned: { text: 'مرتجع', color: 'bg-gray-100 text-gray-700' },
    };
    return map[status] || { text: status, color: 'bg-gray-100' };
  };

  const statusInfo = getStatusLabel(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link to="/orders" className="text-brand-main font-bold mb-6 inline-block">
        ← رجوع للطلبات
      </Link>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex justify-between items-start mb-8 pb-6 border-b">
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        </div>

        {/* Shipping Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-bold text-brand-dark mb-2">📍 عنوان التوصيل</h3>
            <p className="text-sm text-gray-600">{order.fullShippingAddress}</p>
            <p className="text-sm text-gray-600 mt-1">📞 {order.shippingPhone}</p>
          </div>
          <div>
            <h3 className="font-bold text-brand-dark mb-2">💳 طريقة الدفع</h3>
            <p className="text-sm text-gray-600">
              {order.paymentMethod === 'COD' ? 'الدفع عند الاستلام' : 'بطاقة ائتمانية'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              الحالة: {order.paymentStatus === 'Paid' ? '✅ مدفوع' : '⏳ في الانتظار'}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="mb-8">
          <h3 className="font-bold text-brand-dark mb-4">🛒 المنتجات</h3>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="font-bold text-sm">{item.productNameAr}</p>
                  <p className="text-xs text-gray-500">
                    {item.unitPrice?.toLocaleString()} ج.م × {item.quantity}
                  </p>
                </div>
                <p className="font-bold text-brand-main">
                  {item.lineTotal?.toLocaleString()} ج.م
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t pt-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>المجموع الفرعي</span>
              <span>{order.subTotal?.toLocaleString()} ج.م</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>الخصم</span>
                <span>- {order.discountAmount?.toLocaleString()} ج.م</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>الشحن</span>
              <span>{order.shippingCost === 0 ? 'مجاني' : `${order.shippingCost} ج.م`}</span>
            </div>
            <div className="flex justify-between">
              <span>الضريبة (14%)</span>
              <span>{order.taxAmount?.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-brand-dark pt-3 border-t">
              <span>الإجمالي</span>
              <span className="text-brand-main">{order.grandTotal?.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}