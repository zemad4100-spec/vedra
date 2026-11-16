import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const statusSteps = [
    { key: 'New', label: 'تم الاستلام', icon: '📝' },
    { key: 'Confirmed', label: 'تم التأكيد', icon: '✅' },
    { key: 'Preparing', label: 'قيد التجهيز', icon: '📦' },
    { key: 'OutForDelivery', label: 'خرج للتوصيل', icon: '🚚' },
    { key: 'Delivered', label: 'تم التسليم', icon: '🎉' },
  ];

  const getStatusLabel = (status) => {
    const map = {
      New: { text: 'جديد', color: 'bg-blue-100 text-blue-700', icon: '📝' },
      Confirmed: { text: 'مؤكد', color: 'bg-green-100 text-green-700', icon: '✅' },
      Preparing: { text: 'قيد التجهيز', color: 'bg-yellow-100 text-yellow-700', icon: '📦' },
      OutForDelivery: { text: 'خرج للتوصيل', color: 'bg-purple-100 text-purple-700', icon: '🚚' },
      Delivered: { text: 'تم التسليم', color: 'bg-emerald-100 text-emerald-700', icon: '🎉' },
      Cancelled: { text: 'ملغي', color: 'bg-red-100 text-red-700', icon: '❌' },
      Returned: { text: 'مرتجع', color: 'bg-gray-100 text-gray-700', icon: '↩️' },
    };
    return map[status] || { text: status, color: 'bg-gray-100 text-gray-700', icon: '❓' };
  };

  const getProgress = (status) => {
    if (['Cancelled', 'Returned'].includes(status)) return -1;
    return statusSteps.findIndex(s => s.key === status);
  };

  // فلترة الطلبات
  const activeOrders = orders.filter(o => 
    !['Delivered', 'Cancelled', 'Returned'].includes(o.status)
  );
  const deliveredOrders = orders.filter(o => o.status === 'Delivered');
  const cancelledOrders = orders.filter(o => 
    ['Cancelled', 'Returned'].includes(o.status)
  );

  const displayOrders = 
    filter === 'active' ? activeOrders :
    filter === 'delivered' ? deliveredOrders :
    cancelledOrders;

  const filterTabs = [
    { key: 'active', label: '🟢 الجارية', count: activeOrders.length },
    { key: 'delivered', label: '✅ المسلّمة', count: deliveredOrders.length },
    { key: 'cancelled', label: '❌ الملغية', count: cancelledOrders.length },
  ];

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif font-bold text-brand-dark mb-8">📋 طلباتي</h1>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              filter === tab.key
                ? 'bg-brand-main text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Orders */}
      {displayOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
          <p className="text-6xl mb-4">
            {filter === 'active' ? '🌱' : filter === 'delivered' ? '✅' : '📦'}
          </p>
          <p className="text-gray-500 text-lg mb-6">
            {filter === 'active' && 'لا توجد طلبات جارية'}
            {filter === 'delivered' && 'لا توجد طلبات مسلّمة بعد'}
            {filter === 'cancelled' && 'لا توجد طلبات ملغية'}
          </p>
          {filter === 'active' && (
            <Link to="/" className="btn-primary inline-block">ابدأ التسوق 🌿</Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {displayOrders.map(order => {
            const statusInfo = getStatusLabel(order.status);
            const progress = getProgress(order.status);
            const isCancelled = ['Cancelled', 'Returned'].includes(order.status);

            return (
              <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b">
                  <div>
                    <h3 className="font-bold text-lg text-brand-dark">{order.orderNumber}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.text}
                  </span>
                </div>

                {/* Progress Bar (للطلبات الجارية والمسلّمة) */}
                {!isCancelled && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center relative">
                      {/* Background Line */}
                      <div className="absolute top-5 right-6 left-6 h-1 bg-gray-200 -z-0 rounded"></div>
                      
                      {/* Active Progress */}
                      <div 
                        className="absolute top-5 right-6 h-1 bg-brand-main -z-0 transition-all rounded"
                        style={{ 
                          width: `calc(${progress === 0 ? 0 : (progress / (statusSteps.length - 1)) * 100}% - ${progress === 0 ? 0 : 12}px)`
                        }}
                      ></div>

                      {statusSteps.map((step, idx) => {
                        const isCompleted = idx <= progress;
                        const isCurrent = idx === progress;
                        return (
                          <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition ${
                              isCompleted
                                ? 'bg-brand-main text-white'
                                : 'bg-gray-200 text-gray-400'
                            } ${isCurrent ? 'ring-4 ring-brand-main/20' : ''}`}>
                              {step.icon}
                            </div>
                            <p className={`text-xs mt-2 font-bold text-center ${
                              isCompleted ? 'text-brand-dark' : 'text-gray-400'
                            }`}>
                              {step.label}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cancelled Message */}
                {isCancelled && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-red-700 font-bold">
                      {order.status === 'Cancelled'
                        ? '❌ تم إلغاء هذا الطلب'
                        : '↩️ تم إرجاع هذا الطلب'}
                    </p>
                  </div>
                )}

                {/* Details */}
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">عدد المنتجات</p>
                    <p className="font-bold text-brand-dark">{order.itemCount} منتج</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الإجمالي</p>
                    <p className="font-bold text-brand-main text-lg">
                      {order.grandTotal?.toLocaleString()} ج.م
                    </p>
                  </div>
                  <div className="flex items-end justify-end">
                    <Link
                      to={`/orders/${order.id}`}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      تفاصيل الطلب ←
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}