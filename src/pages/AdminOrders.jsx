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
  
  // ✅ حالات الفلترة والبحث
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
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
      New: { text: 'جديد', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      Confirmed: { text: 'مؤكد', color: 'bg-green-100 text-green-700 border-green-200' },
      Preparing: { text: 'قيد التجهيز', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      OutForDelivery: { text: 'خرج للتوصيل', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      Delivered: { text: 'تم التسليم', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      Cancelled: { text: 'ملغي', color: 'bg-red-100 text-red-700 border-red-200' },
      Returned: { text: 'مرتجع', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      UnderReview: { text: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      QuoteSent: { text: 'تم إرسال عرض', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      Accepted: { text: 'مقبول', color: 'bg-green-100 text-green-700 border-green-200' },
      Rejected: { text: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-200' },
    };
    return labels[status] || { text: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const allItems = [
    ...orders.map(o => ({ ...o, _type: 'order' })),
    ...designRequests.map(d => ({ ...d, _type: 'design' })),
  ];

  allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  let filteredItems = allItems;

  // ✅ فلترة النوع
  if (typeFilter !== 'all') {
    filteredItems = filteredItems.filter(i => i._type === typeFilter);
  }

  // ✅ فلترة الحالة
  if (filter !== 'all') {
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
    } else if (filter === 'new') {
      filteredItems = filteredItems.filter(i => i.status === 'New');
    } else if (filter === 'preparing') {
      filteredItems = filteredItems.filter(i => i.status === 'Preparing');
    } else if (filter === 'outForDelivery') {
      filteredItems = filteredItems.filter(i => i.status === 'OutForDelivery');
    }
  }

  // ✅ فلترة البحث (بالاسم أو رقم الهاتف)
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(i => 
      (i.fullName && i.fullName.toLowerCase().includes(query)) ||
      (i.customerName && i.customerName.toLowerCase().includes(query)) ||
      (i.phone && i.phone.includes(query)) ||
      (i.customerPhone && i.customerPhone.includes(query)) ||
      (i.orderNumber && i.orderNumber.toLowerCase().includes(query))
    );
  }

  const filterTabs = [
    { key: 'all', label: 'الكل', icon: '📋', count: allItems.length },
    { key: 'new', label: 'جديد', icon: '🆕', count: allItems.filter(i => i.status === 'New').length },
    { key: 'preparing', label: 'قيد التجهيز', icon: '⏳', count: allItems.filter(i => i.status === 'Preparing').length },
    { key: 'outForDelivery', label: 'خرج للتوصيل', icon: '🚚', count: allItems.filter(i => i.status === 'OutForDelivery').length },
    { key: 'delivered', label: 'تم التسليم', icon: '✅', count: allItems.filter(i => i.status === 'Delivered').length },
    { key: 'cancelled', label: 'ملغي / مرتجع', icon: '❌', count: allItems.filter(i => ['Cancelled', 'Returned', 'Rejected'].includes(i.status)).length },
  ];

  const typeTabs = [
    { key: 'all', label: 'الكل', icon: '🎯', count: allItems.length },
    { key: 'order', label: 'طلبات المنتجات', icon: '📦', count: orders.length },
    { key: 'design', label: 'طلبات التصميم', icon: '🏡', count: designRequests.length },
  ];

  if (loading) return <div className="text-center py-20 text-gray-500">جاري تحميل الطلبات...</div>;

  return (
    <div className="pb-10 bg-[#f4f7f6] min-h-screen -m-6 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0a2e1f]">📋 الطلبات</h1>
            <p className="text-gray-500 mt-1 text-sm">إدارة ومتابعة جميع الطلبات وطلبات التصميم</p>
          </div>
        </div>

        {/* Filters & Search Section */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-6 space-y-4">
          
          {/* Search Bar */}
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3.5 pr-12 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#15803d] focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="h-px bg-gray-100 w-full"></div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {typeTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition ${
                  typeFilter === tab.key
                    ? 'bg-[#15803d] text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
                <span className={`px-2 py-0.5 rounded-md text-xs ${typeFilter === tab.key ? 'bg-white/20' : 'bg-gray-200'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition ${
                  filter === tab.key
                    ? 'bg-[#0a2e1f] text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span> {tab.label}
                <span className={`px-2 py-0.5 rounded-md text-xs ${filter === tab.key ? 'bg-white/20' : 'bg-gray-200'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">النوع</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">الرقم</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">العميل</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">الإجمالي / المساحة</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">الحالة</th>
                  <th className="p-4 text-right text-xs font-bold text-gray-500">التاريخ</th>
                  <th className="p-4 text-center text-xs font-bold text-gray-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const statusInfo = getStatusLabel(item.status);
                  const isDesign = item._type === 'design';

                  return (
                    <tr key={`${item._type}-${item.id}`} className={`border-b border-gray-50 hover:bg-gray-50/50 transition ${isDesign ? 'bg-purple-50/20' : ''}`}>
                      
                      <td className="p-4">
                        {isDesign ? (
                          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                            🏡 تصميم
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                            📦 طلب
                          </span>
                        )}
                      </td>
                      
                      <td className="p-4 font-bold text-sm text-[#0a2e1f]">
                        {isDesign ? `#${item.id}` : item.orderNumber}
                      </td>

                      <td className="p-4">
                        <p className="text-sm font-bold text-gray-800">{item.fullName || item.customerName}</p>
                        <p className="text-xs text-gray-500">{item.phone || item.customerPhone}</p>
                      </td>

                      <td className="p-4">
                        {isDesign ? (
                          <div>
                            <p className="font-bold text-purple-700 text-sm">{item.spaceSqm ? `${item.spaceSqm} م²` : '-'}</p>
                            {item.budget && <p className="text-xs text-gray-500">ميزانية: {item.budget.toLocaleString()} ج.م</p>}
                          </div>
                        ) : (
                          <span className="font-bold text-[#15803d] text-sm">{item.grandTotal?.toLocaleString()} ج.م</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString('ar-EG', { 
                            timeZone: 'Africa/Cairo', year: 'numeric', month: 'short', day: 'numeric' 
                          })}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {isDesign ? (
                            <>
                              <button
                                onClick={() => setSelectedDesign(item)}
                                className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-100 transition"
                              >
                                👁️ تفاصيل
                              </button>
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateDesignStatus(item.id, e.target.value)}
                                disabled={updating === `design-${item.id}`}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-500 outline-none"
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
                                className="bg-[#15803d] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#0a2e1f] transition shadow-sm"
                              >
                                🧾 فاتورة
                              </button>
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateOrderStatus(item.id, e.target.value)}
                                disabled={updating === `order-${item.id}`}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#15803d] outline-none"
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
                  <tr>
                    <td colSpan="7" className="p-10 text-center text-gray-400">
                      <span className="text-4xl block mb-2 opacity-30">📋</span>
                      لا توجد طلبات تطابق البحث أو الفلتر الحالي
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal تفاصيل التصميم */}
        {selectedDesign && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#0a2e1f] flex items-center gap-2">
                  <span>🏡</span> طلب تصميم #{selectedDesign.id}
                </h2>
                <button onClick={() => setSelectedDesign(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition">
                  ✕
                </button>
              </div>
              
              <div className="space-y-4 text-sm bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <div className="flex justify-between border-b border-gray-200 border-dashed pb-2">
                  <span className="text-gray-500">العميل</span>
                  <span className="font-bold text-[#0a2e1f]">{selectedDesign.fullName}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 border-dashed pb-2">
                  <span className="text-gray-500">الهاتف</span>
                  <span className="font-bold text-[#0a2e1f]">{selectedDesign.phone}</span>
                </div>
                {selectedDesign.location && (
                  <div className="flex justify-between border-b border-gray-200 border-dashed pb-2">
                    <span className="text-gray-500">العنوان</span>
                    <span className="font-bold text-[#0a2e1f]">{selectedDesign.location}</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-gray-200 border-dashed pb-2">
                  <span className="text-gray-500">نوع المساحة</span>
                  <span className="font-bold text-[#0a2e1f]">{selectedDesign.requestType}</span>
                </div>
                {selectedDesign.spaceSqm && (
                  <div className="flex justify-between border-b border-gray-200 border-dashed pb-2">
                    <span className="text-gray-500">المساحة</span>
                    <span className="font-bold text-[#0a2e1f]">{selectedDesign.spaceSqm} م²</span>
                  </div>
                )}
                {selectedDesign.budget && (
                  <div className="flex justify-between border-b border-gray-200 border-dashed pb-2">
                    <span className="text-gray-500">الميزانية</span>
                    <span className="font-bold text-[#15803d]">{selectedDesign.budget.toLocaleString()} ج.م</span>
                  </div>
                )}
                {selectedDesign.designStyle && (
                  <div className="flex justify-between border-b border-gray-200 border-dashed pb-2">
                    <span className="text-gray-500">نمط التصميم</span>
                    <span className="font-bold text-[#0a2e1f]">{selectedDesign.designStyle}</span>
                  </div>
                )}
                {selectedDesign.notes && (
                  <div className="pt-2">
                    <span className="text-gray-500 block mb-1">ملاحظات</span>
                    <p className="bg-white p-3 rounded-xl border border-gray-200 text-gray-800">{selectedDesign.notes}</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedDesign(null)}
                className="w-full bg-[#15803d] text-white mt-6 py-3.5 rounded-xl font-bold hover:bg-[#0a2e1f] transition shadow-lg shadow-[#15803d]/30"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}