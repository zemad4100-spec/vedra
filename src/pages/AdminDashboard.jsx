
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await api.get('/admin/dashboard', {
          params: { period }
        });

        setStats(res.data.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('فشل تحميل البيانات.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading && !stats) {
    return (
      <div className="text-center py-20 text-gray-500">
        جاري تحميل لوحة التحكم...
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="text-center py-20 text-red-500 font-bold">
        {error}
      </div>
    );
  }

  const displayStats = stats || {
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    topProducts: [],
    salesChart: []
  };

  // بيانات الرسم البياني
  const chartData = displayStats.salesChart || [];

  const maxSales = Math.max(
    ...chartData.map(d => Number(d.sales) || 0),
    1
  );

  // ألوان الأعمدة
  const getBarColor = (sales) => {
    const percentage = (Number(sales) / maxSales) * 100;

    if (percentage >= 75) return '#ef4444';
    if (percentage >= 40) return '#f59e0b';
    return '#16a34a';
  };

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-l from-[#0a2e1f] to-[#15803d] p-8 md:p-12 text-white shadow-lg">

        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1000&q=80"
            alt="bg"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              مرحباً بك في نظام Vedra
            </h1>

            <p className="text-lg text-gray-200">
              إدارة أذكى .. لعمل أفضل
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col items-center min-w-[200px]">

            <div className="flex items-center gap-2 text-sm font-bold mb-1">
              <span>📅</span>
              {new Date().toLocaleDateString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>

            <div className="flex items-center gap-2 text-2xl font-bold">
              <span>🕒</span>
              {new Date().toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

        {/* Total Sales */}
        <div className="bg-[#15803d] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">

          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-green-100 mb-1">
                إجمالي المبيعات
              </p>

              <h3 className="text-3xl font-bold">
                {displayStats.totalSales?.toLocaleString()} ج.م
              </h3>
            </div>

            <span className="text-3xl bg-white/20 p-2 rounded-xl">
              💰
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-green-300 bg-green-900/30 w-fit px-2 py-1 rounded-lg">
            <span>⬆</span> 22%+
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">
                إجمالي الطلبات
              </p>

              <h3 className="text-3xl font-bold text-gray-800">
                {displayStats.totalOrders}
              </h3>
            </div>

            <span className="text-3xl bg-gray-100 p-2 rounded-xl">
              🛒
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg relative z-10">
            <span>⬆</span> 18%+
          </div>

          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-green-50 to-transparent"></div>
        </div>

        {/* Customers */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">
                العملاء
              </p>

              <h3 className="text-3xl font-bold text-gray-800">
                {displayStats.totalCustomers}
              </h3>
            </div>

            <span className="text-3xl bg-purple-50 text-purple-600 p-2 rounded-xl">
              👥
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg relative z-10">
            <span>⬆</span> 8%+
          </div>

          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-purple-50 to-transparent"></div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">
                المنتجات
              </p>

              <h3 className="text-3xl font-bold text-gray-800">
                {displayStats.totalProducts}
              </h3>
            </div>

            <span className="text-3xl bg-blue-50 text-blue-600 p-2 rounded-xl">
              📦
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg relative z-10">
            <span>⬆</span> 12%+
          </div>

          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-blue-50 to-transparent"></div>
        </div>

      </div>

      {/* Charts & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">

            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>📊</span>
              مبيعات {
                period === 'week'
                  ? 'آخر 7 أيام'
                  : period === 'month'
                    ? 'آخر شهر'
                    : 'آخر سنة'
              }
            </h2>

            {/* Period Buttons */}
            <div className="flex bg-gray-100 rounded-xl p-1">

              <button
                onClick={() => setPeriod('week')}
                className={`px-4 py-1 text-sm font-bold rounded-lg transition ${
                  period === 'week'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                أسبوع
              </button>

              <button
                onClick={() => setPeriod('month')}
                className={`px-4 py-1 text-sm font-bold rounded-lg transition ${
                  period === 'month'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                شهر
              </button>

              <button
                onClick={() => setPeriod('year')}
                className={`px-4 py-1 text-sm font-bold rounded-lg transition ${
                  period === 'year'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                سنة
              </button>

            </div>
          </div>

          {/* Vertical Bar Chart */}
          <div className="h-64 w-full relative">

            {chartData.length > 0 ? (

              <div className="h-full flex flex-col">

                {/* Chart Grid */}
                <div className="flex-1 relative">

                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="w-full border-t border-dashed border-gray-100"
                      />
                    ))}
                  </div>

                  {/* Bars - Small Gaps */}
                  <div className="absolute inset-0 flex items-end justify-center gap-2 px-1">

                    {chartData.map((item, index) => {

                      const sales = Number(item.sales) || 0;

                      const height = (sales / maxSales) * 90;

                      const color = getBarColor(sales);

                      return (
                        <div
                          key={index}
                          className="group relative w-8 sm:w-9 shrink-0 h-full flex flex-col justify-end items-center"
                        >

                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">

                            <div className="bg-gray-900 text-white rounded-xl px-3 py-2 shadow-xl text-center whitespace-nowrap">

                              <p className="text-sm font-bold">
                                {sales.toLocaleString('ar-EG')} ج.م
                              </p>

                              <p className="text-xs text-gray-300 mt-1">
                                {item.date}
                              </p>

                            </div>
                          </div>

                          {/* Bar */}
                          <div
                            className="w-full rounded-t-md transition-all duration-500 hover:brightness-110 cursor-pointer relative"
                            style={{
                              height: `${height}%`,
                              backgroundColor: color,
                              minHeight: sales > 0 ? '4px' : '0px'
                            }}
                          >
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/30 rounded-t-md" />
                          </div>

                        </div>
                      );
                    })}

                  </div>
                </div>

                {/* Dates */}
                <div className="flex justify-center gap-2 mt-3">

                  {chartData.map((item, index) => (
                    <div
                      key={index}
                      className="w-8 sm:w-9 shrink-0 text-center text-[10px] md:text-xs text-gray-400 font-bold truncate"
                      title={item.date}
                    >
                      {item.date}
                    </div>
                  ))}

                </div>

              </div>

            ) : (

              <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                لا توجد بيانات مبيعات لهذه الفترة
              </div>

            )}

          </div>

          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-5 text-xs font-bold text-gray-500 flex-wrap">

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              أعلى المبيعات
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              مبيعات متوسطة
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-600"></span>
              مبيعات منخفضة
            </div>

          </div>

        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>🏆</span>
              المنتجات الأكثر مبيعاً
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">

            {displayStats.topProducts &&
            displayStats.topProducts.length > 0 ? (

              displayStats.topProducts.map((item, index) => (

                <div
                  key={item.productId}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition"
                >

                  <div className="flex items-center gap-3">

                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? 'bg-green-100 text-green-700'
                          : index === 1
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div>
                      <h4 className="text-sm font-bold text-gray-800">
                        {item.nameAr}
                      </h4>

                      <p className="text-xs text-gray-500">
                        تم بيع {item.soldCount || 0} قطعة
                      </p>
                    </div>

                  </div>

                  <span className="text-sm font-bold text-[#15803d]">
                    {item.totalRevenue?.toLocaleString() || 0} ج.م
                  </span>

                </div>

              ))

            ) : (

              <p className="text-center text-gray-500 py-4">
                لا توجد بيانات متاحة
              </p>

            )}

          </div>
        </div>

      </div>
    </div>
  );
}
