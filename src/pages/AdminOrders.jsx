import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [designRequests, setDesignRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDesign, setSelectedDesign] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersRes, designRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/design'),
      ]);
      setOrders(ordersRes.data.data || []);
      setDesignRequests(designRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setUpdating(`order-${orderId}`);
    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        newStatus,
        notes: 'تم التحديث من لوحة التحكم',
      });
      showSuccess('تم تحديث الحالة بنجاح');
      loadData();
    } catch (err) {
      showError('فشل التحديث: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateDesignStatus = async (designId, newStatus) => {
    setUpdating(`design-${designId}`);
    try {
      await api.put(`/design/${designId}/status`, {
        status: newStatus,
        notes: 'تم التحديث من لوحة التحكم',
      });
      showSuccess('تم تحديث حالة طلب التصميم');
      loadData();
    } catch (err) {
      showError('فشل التحديث: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(null);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      New: { text: 'جديد', color: 'bg-blue-100 text-blue-700' },
      Confirmed: { text: 'مؤكد', color: 'bg-green-100 text-green-700' },
      Preparing: { text: 'قيد التجهيز', color: 'bg-yellow-100 text-yellow-700' },
      OutForDelivery: { text: 'خرج للتوصيل', color: 'bg-purple-100 text-purple-700' },
      Delivered: { text: 'تم التسليم', color: 'bg-emerald-100 text-emerald-700' },
      Cancelled: { text: 'ملغي', color: 'bg-red-100 text-red-700' },
      Returned: { text: 'مرتجع', color: 'bg-gray-100 text-gray-700' },
      UnderReview: { text: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700' },
      QuoteSent: { text: 'تم إرسال عرض', color: 'bg-blue-100 text-blue-700' },
      Accepted: { text: 'مقبول', color: 'bg-green-100 text-green-700' },
      Rejected: { text: 'مرفوض', color: 'bg-red-100 text-red-700' },
    };
    return labels[status] || { text: status, color: 'bg-gray-100 text-gray-700' };
  };

  const allItems = [
    ...orders.map(o => ({ ...o, _type: 'order' })),
    ...designRequests.map(d => ({ ...d, _type: 'design' })),
  ];

  allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let filteredItems = allItems;
  if (typeFilter === 'orders') {
    filteredItems = filteredItems.filter(i => i._type === 'order');
  } else if (typeFilter === 'designs') {
    filteredItems = filteredItems.filter(i => i._type === 'design');
  }

  if (filter === 'active') {
    filteredItems = filteredItems.filter(i =>
      !['Delivered', 'Cancelled', 'Returned', 'Rejected'].includes(i.status)
    );
  } else if (filter === 'delivered') {
    filteredItems = filteredItems.filter(i => i.status === 'Delivered');
  } else if (filter === 'cancelled') {
    filteredItems = filteredItems.filter(i =>
      ['Cancelled', 'Returned', 'Rejected'].includes(i.status)
    );
  }

  const filterTabs = [
    { key: 'all', label: '📋 الكل', count: allItems.length },
    { key: 'active', label: '🟢 النشطة', count: allItems.filter(i =>
      !['Delivered', 'Cancelled', 'Returned', 'Rejected'].includes(i.status)
    ).length },
    { key: 'delivered', label: '✅ المسلّمة', count: allItems.filter(i => i.status === 'Delivered').length },
    { key: 'cancelled', label: '❌ الملغية', count: allItems.filter(i =>
      ['Cancelled', 'Returned', 'Rejected'].includes(i.status)
    ).length },
  ];

  const typeTabs = [
    { key: 'all', label: '🎯 الكل', count: allItems.length },
    { key: 'orders', label: '📦 طلبات المنتجات', count: orders.length },
    { key: 'designs', label: '🏡 طلبات التصميم', count: designRequests.length },
  ];

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark mb-6">📋 الطلبات</h1>

      {/* Tabs */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {typeTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setTypeFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                typeFilter === tab.key
                  ? 'bg-brand-dark text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition ${
                filter === tab.key
                  ? 'bg-brand-main text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Table - Responsive as Cards on Mobile */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 hidden md:table-header-group">
            <tr>
              <th className="p-4 text-right text-xs font-bold text-gray-500">النوع</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الرقم</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">العميل</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الإجمالي / المساحة</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الحالة</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">التاريخ</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">إجراءات</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {filteredItems.map(item => {
              const statusInfo = getStatusLabel(item.status);
              const isDesign = item._type === 'design';

              return (
                <tr key={`${item._type}-${item.id}`} className={`border-t border-gray-100 hover:bg-gray-50 block md:table-row ${
                  isDesign ? 'bg-purple-50/30' : ''
                }`}>
                  {/* النوع */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">النوع:</span>
                    {isDesign ? (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-bold">
                        🏡 تصميم
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold">
                        📦 طلب
                      </span>
                    )}
                  </td>
                  
                  {/* الرقم */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">الرقم:</span>
                    <span className="font-bold text-sm">
                      {isDesign ? `#${item.id}` : item.orderNumber}
                    </span>
                  </td>

                  {/* العميل */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">العميل:</span>
                    <span className="text-sm">{item.fullName || item.customerName}</span>
                  </td>

                  {/* الإجمالي / المساحة */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">الإجمالي:</span>
                    {isDesign ? (
                      <div>
                        <p className="font-bold text-purple-700 text-sm">
                          {item.spaceSqm ? `${item.spaceSqm} م²` : '-'}
                        </p>
                        {item.budget && (
                          <p className="text-xs text-gray-500">ميزانية: {item.budget.toLocaleString()} ج.م</p>
                        )}
                      </div>
                    ) : (
                      <span className="font-bold text-brand-main text-sm">
                        {item.grandTotal?.toLocaleString()} ج.م
                      </span>
                    )}
                  </td>

                  {/* الحالة */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">الحالة:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </td>

                  {/* التاريخ (تم إصلاحه) */}
                  <td className="p-4 md:table-cell block text-right md:text-right border-b md:border-none">
                    <span className="md:hidden font-bold text-gray-400 text-xs ml-2">التاريخ:</span>
                    <span className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('ar-EG', { 
                        timeZone: 'Africa/Cairo',
                        year: 'numeric', 
                        month: 'numeric', 
                        day: 'numeric' 
                      })}
                    </span>
                  </td>

                  {/* إجراءات */}
                  <td className="p-4 md:table-cell block text-right md:text-right">
                    <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
                      {isDesign ? (
                        <>
                          <button
                            onClick={() => setSelectedDesign(item)}
                            className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-200"
                          >
                            👁️ تفاصيل
                          </button>
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateDesignStatus(item.id, e.target.value)}
                            disabled={updating === `design-${item.id}`}
                            className="text-xs border rounded-lg px-2 py-1.5 w-full md:w-auto"
                          >
                            <option value="New">جديد</option>
                            <option value="UnderReview">قيد المراجعة</option>
                            <option value="QuoteSent">تم إرسال عرض</option>
                            <option value="Accepted">مقبول</option>
                            <option value="Rejected">مرفوض</option>
                          </select>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => navigate(`/admin/orders/${item.id}`)}
                            className="bg-brand-main text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-brand-dark"
                          >
                            🧾 فاتورة
                          </button>
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateOrderStatus(item.id, e.target.value)}
                            disabled={updating === `order-${item.id}`}
                            className="text-xs border rounded-lg px-2 py-1.5 w-full md:w-auto"
                          >
                            <option value="New">جديد</option>
                            <option value="Confirmed">مؤكد</option>
                            <option value="Preparing">قيد التجهيز</option>
                            <option value="OutForDelivery">خرج للتوصيل</option>
                            <option value="Delivered">تم التسليم</option>
                            <option value="Cancelled">ملغي</option>
                          </select>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr className="block md:table-row">
                <td colSpan="7" className="p-8 text-center text-gray-500 block md:table-cell">
                  لا توجد طلبات في هذه الفئة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal تفاصيل التصميم */}
      {selectedDesign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-dark">🏡 طلب تصميم #{selectedDesign.id}</h2>
              <button onClick={() => setSelectedDesign(null)} className="text-2xl">✕</button>
            </div>
            
            <div className="space-y-3 text-sm">
              <div><strong>العميل:</strong> {selectedDesign.fullName}</div>
              <div><strong>الهاتف:</strong> {selectedDesign.phone}</div>
              {selectedDesign.location && <div><strong>العنوان:</strong> {selectedDesign.location}</div>}
              <div><strong>نوع المساحة:</strong> {selectedDesign.requestType}</div>
              {selectedDesign.spaceSqm && <div><strong>المساحة:</strong> {selectedDesign.spaceSqm} م²</div>}
              {selectedDesign.budget && <div><strong>الميزانية:</strong> {selectedDesign.budget.toLocaleString()} ج.م</div>}
              {selectedDesign.designStyle && <div><strong>نمط التصميم:</strong> {selectedDesign.designStyle}</div>}
              {selectedDesign.notes && (
                <div>
                  <strong>ملاحظات:</strong>
                  <p className="bg-gray-50 p-3 rounded-lg mt-1">{selectedDesign.notes}</p>
                </div>
              )}
              <div className="pt-3 border-t">
                <strong>الحالة:</strong> {getStatusLabel(selectedDesign.status).text}
              </div>
            </div>
            
            <button
              onClick={() => setSelectedDesign(null)}
              className="w-full btn-primary mt-6 py-3"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}