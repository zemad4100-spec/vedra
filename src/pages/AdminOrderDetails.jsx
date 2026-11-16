import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;
  if (!order) return <div className="text-center py-20 text-red-600">الفاتورة غير موجودة</div>;

  return (
    <div>
      {/* Actions */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-300"
        >
          ← رجوع للطلبات
        </button>
        <button
          onClick={handlePrint}
          className="bg-brand-main text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-dark"
        >
          🖨️ طباعة الفاتورة
        </button>
      </div>

      {/* Invoice - يظهر في الطباعة */}
      <div className="bg-white rounded-2xl p-8 shadow-sm print:shadow-none print:rounded-none">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-brand-dark pb-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-brand-dark text-brand-sand rounded-xl flex items-center justify-center text-3xl font-serif">
                ❧
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-brand-dark">Vedra</h1>
                <p className="text-xs text-gray-500 tracking-widest font-bold">LANDSCAPE & GREEN SPACES</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">القاهرة، مصر</p>
            <p className="text-sm text-gray-500">📞 0100 000 0000</p>
            <p className="text-sm text-gray-500">✉️ hello@vedra.example</p>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-brand-dark mb-2">فاتورة</h2>
            <p className="text-sm"><strong>رقم الفاتورة:</strong> {order.orderNumber}</p>
            <p className="text-sm"><strong>التاريخ:</strong> {new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
            <p className="text-sm"><strong>الحالة:</strong> {order.status}</p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-bold text-brand-dark mb-2">بيانات العميل</h3>
            <p className="text-sm">{order.shippingRecipient}</p>
            <p className="text-sm">📞 {order.shippingPhone}</p>
          </div>
          <div>
            <h3 className="font-bold text-brand-dark mb-2">عنوان التوصيل</h3>
            <p className="text-sm">{order.fullShippingAddress}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead className="bg-brand-dark text-white">
            <tr>
              <th className="p-3 text-right text-sm">#</th>
              <th className="p-3 text-right text-sm">المنتج</th>
              <th className="p-3 text-right text-sm">السعر</th>
              <th className="p-3 text-right text-sm">الكمية</th>
              <th className="p-3 text-right text-sm">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="p-3 text-sm">{idx + 1}</td>
                <td className="p-3 text-sm">{item.productNameAr}</td>
                <td className="p-3 text-sm">{item.unitPrice?.toLocaleString()} ج.م</td>
                <td className="p-3 text-sm">{item.quantity}</td>
                <td className="p-3 text-sm font-bold">{item.lineTotal?.toLocaleString()} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span>المجموع الفرعي:</span>
              <span className="font-bold">{order.subTotal?.toLocaleString()} ج.م</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>الخصم:</span>
                <span className="font-bold">- {order.discountAmount?.toLocaleString()} ج.م</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>الشحن:</span>
              <span className="font-bold">{order.shippingCost === 0 ? 'مجاني' : `${order.shippingCost} ج.م`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>الضريبة (14%):</span>
              <span className="font-bold">{order.taxAmount?.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-brand-dark border-t-2 border-brand-dark pt-2">
              <span>الإجمالي:</span>
              <span>{order.grandTotal?.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>شكراً لتعاملك مع Vedra 🌿</p>
          <p>هذه الفاتورة صادرة إلكترونياً ولا تحتاج لختم</p>
        </div>
      </div>
    </div>
  );
}