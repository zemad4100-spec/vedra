import { useEffect, useState } from 'react';
import { reportService } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getDashboardStats()
      .then(res => setStats(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-xl">جاري التحميل...</div>;
  if (!stats) return <div className="text-center py-20 text-red-600">فشل تحميل البيانات</div>;

  const statCards = [
    { label: 'إجمالي المبيعات', value: `${stats.totalSales?.toLocaleString()} ج.م`, icon: '💰', color: 'bg-green-100 text-green-700' },
    { label: 'إجمالي الطلبات', value: stats.totalOrders, icon: '🛒', color: 'bg-blue-100 text-blue-700' },
    { label: 'العملاء', value: stats.totalCustomers, icon: '👥', color: 'bg-purple-100 text-purple-700' },
    { label: 'المنتجات', value: stats.totalProducts, icon: '📦', color: 'bg-orange-100 text-orange-700' },
    { label: 'صافي الربح', value: `${stats.netProfit?.toLocaleString()} ج.م`, icon: '💵', color: 'bg-emerald-100 text-emerald-700' },
    { label: 'طلبات جديدة', value: stats.newOrders, icon: '🔔', color: 'bg-yellow-100 text-yellow-700' },
    { label: 'قيد التجهيز', value: stats.pendingOrders, icon: '⏳', color: 'bg-indigo-100 text-indigo-700' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-brand-dark mb-6">📊 نظرة عامة</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center text-2xl mb-3`}>
              {s.icon}
            </div>
            <p className="text-sm text-gray-500 font-bold mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-brand-dark">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-4 text-brand-dark">🏆 المنتجات الأكثر مبيعاً</h3>
          <div className="space-y-3">
            {stats.topProducts?.length > 0 ? stats.topProducts.map((p, i) => (
              <div key={i} className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div>
                  <p className="font-bold text-sm">{p.nameAr}</p>
                  <p className="text-xs text-gray-500">تم بيع {p.soldCount} قطعة</p>
                </div>
                <p className="font-bold text-brand-main">{p.totalRevenue?.toLocaleString()} ج.م</p>
              </div>
            )) : <p className="text-gray-500 text-center py-4">لا توجد بيانات بعد</p>}
          </div>
        </div>

        {/* Sales Chart Placeholder */}
        <div className="bg-white p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold mb-4 text-brand-dark">📈 مبيعات آخر 7 أيام</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {stats.salesChart?.map((d, i) => {
              const max = Math.max(...stats.salesChart.map(x => x.sales || 0), 1);
              const h = ((d.sales || 0) / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-bold">{d.sales ? d.sales.toLocaleString() : ''}</div>
                  <div className="w-full bg-brand-main rounded-t-lg transition-all" style={{ height: `${Math.max(h, 5)}%` }} />
                  <div className="text-[10px] text-gray-500">{d.date?.substring(5)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}