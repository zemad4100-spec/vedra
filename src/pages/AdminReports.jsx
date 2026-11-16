import { useEffect, useState } from 'react';
import api from '../services/api';
import { showError } from '../utils/toast';

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);

  // Sales Report
  const [salesReport, setSalesReport] = useState(null);
  const [fromDate, setFromDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

  // Products Report
  const [productsReport, setProductsReport] = useState(null);

  // Customers Report
  const [customersReport, setCustomersReport] = useState(null);

  const loadSalesReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports/sales', {
        params: { fromDate, toDate },
      });
      setSalesReport(res.data.data);
    } catch (err) {
      showError('فشل تحميل تقرير المبيعات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports/products');
      setProductsReport(res.data.data);
    } catch (err) {
      showError('فشل تحميل تقرير المنتجات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomersReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/reports/customers');
      setCustomersReport(res.data.data);
    } catch (err) {
      showError('فشل تحميل تقرير العملاء');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sales') loadSalesReport();
    if (activeTab === 'products') loadProductsReport();
    if (activeTab === 'customers') loadCustomersReport();
  }, [activeTab]);

  const tabs = [
    { key: 'sales', label: '💰 تقرير المبيعات' },
    { key: 'products', label: '📦 تقرير المنتجات' },
    { key: 'customers', label: '👥 تقرير العملاء' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-brand-dark mb-6">📈 التقارير</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition ${
              activeTab === tab.key
                ? 'bg-brand-main text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= SALES REPORT ================= */}
      {activeTab === 'sales' && (
        <div>
          {/* Date Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-bold block mb-1">من تاريخ</label>
              <input
                type="date"
                className="input-field"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className="text-sm font-bold block mb-1">إلى تاريخ</label>
              <input
                type="date"
                className="input-field"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <button onClick={loadSalesReport} className="btn-primary" disabled={loading}>
              {loading ? 'جاري التحميل...' : '🔄 تحديث'}
            </button>
          </div>

          {salesReport ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">إجمالي المبيعات</p>
                  <p className="text-2xl font-bold text-green-600">
                    {salesReport.totalSales?.toLocaleString()} ج.م
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-blue-600">{salesReport.totalOrders}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">الطلبات المكتملة</p>
                  <p className="text-2xl font-bold text-purple-600">{salesReport.completedOrders}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">الطلبات الملغية</p>
                  <p className="text-2xl font-bold text-red-600">{salesReport.cancelledOrders}</p>
                </div>
              </div>

              {/* Other Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-gray-500">الخصومات</p>
                  <p className="text-lg font-bold text-red-600">
                    {salesReport.totalDiscount?.toLocaleString()} ج.م
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-gray-500">الضرائب</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {salesReport.totalTax?.toLocaleString()} ج.م
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-gray-500">الشحن</p>
                  <p className="text-lg font-bold text-blue-600">
                    {salesReport.totalShipping?.toLocaleString()} ج.م
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm">
                  <p className="text-xs text-gray-500">متوسط قيمة الطلب</p>
                  <p className="text-lg font-bold text-brand-main">
                    {salesReport.averageOrderValue?.toLocaleString()} ج.م
                  </p>
                </div>
              </div>

              {/* Daily Breakdown */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-brand-dark">📅 التفصيل اليومي</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">التاريخ</th>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">المبيعات</th>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">الطلبات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesReport.dailyBreakdown?.map((day, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3 text-sm">{day.date}</td>
                          <td className="p-3 text-sm font-bold text-green-600">
                            {day.sales?.toLocaleString()} ج.م
                          </td>
                          <td className="p-3 text-sm">{day.orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-10 text-gray-500">لا توجد بيانات</p>
          )}
        </div>
      )}

      {/* ================= PRODUCTS REPORT ================= */}
      {activeTab === 'products' && (
        <div>
          {productsReport ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">إجمالي المنتجات</p>
                  <p className="text-2xl font-bold text-brand-dark">{productsReport.totalProducts}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">منتجات نشطة</p>
                  <p className="text-2xl font-bold text-green-600">{productsReport.activeProducts}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">مخزون منخفض</p>
                  <p className="text-2xl font-bold text-yellow-600">{productsReport.lowStockProducts}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">نفذ من المخزون</p>
                  <p className="text-2xl font-bold text-red-600">{productsReport.outOfStockProducts}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-brand-dark">🏆 أفضل 10 منتجات مبيعاً</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">#</th>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">المنتج</th>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">الكمية المبيعة</th>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">الإيرادات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsReport.topSellingProducts?.map((p, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3 text-sm font-bold">{idx + 1}</td>
                          <td className="p-3 text-sm">{p.nameAr}</td>
                          <td className="p-3 text-sm font-bold text-blue-600">{p.totalSold}</td>
                          <td className="p-3 text-sm font-bold text-green-600">
                            {p.totalRevenue?.toLocaleString()} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-10 text-gray-500">لا توجد بيانات</p>
          )}
        </div>
      )}

      {/* ================= CUSTOMERS REPORT ================= */}
      {activeTab === 'customers' && (
        <div>
          {customersReport ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">إجمالي العملاء</p>
                  <p className="text-2xl font-bold text-brand-dark">{customersReport.totalCustomers}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">عملاء جدد هذا الشهر</p>
                  <p className="text-2xl font-bold text-green-600">{customersReport.newCustomersThisMonth}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4 text-brand-dark">⭐ أفضل 10 عملاء</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">#</th>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">الاسم</th>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">البريد</th>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">الطلبات</th>
                        <th className="p-3 text-right text-xs font-bold text-gray-500">إجمالي المشتريات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customersReport.topCustomers?.map((c, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3 text-sm font-bold">{idx + 1}</td>
                          <td className="p-3 text-sm">{c.fullName}</td>
                          <td className="p-3 text-sm text-gray-600">{c.email}</td>
                          <td className="p-3 text-sm font-bold text-blue-600">{c.totalOrders}</td>
                          <td className="p-3 text-sm font-bold text-green-600">
                            {c.totalSpent?.toLocaleString()} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center py-10 text-gray-500">لا توجد بيانات</p>
          )}
        </div>
      )}
    </div>
  );
}