import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ بنجيب الإحصائيات من الباك إند بتاعك
        const [statsRes, bestSellersRes] = await Promise.all([
          api.get('/admin/dashboard'), // الـ Endpoint بتاع الإحصائيات
          api.get('/products/best-sellers'), // الـ Endpoint بتاع الأكثر مبيعاً
        ]);
        
        // ✅ بنحط البيانات اللي راجعة في الـ State
        setStats(statsRes.data.data);
        setBestSellers(bestSellersRes.data.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('فشل تحميل البيانات، تأكد من اتصالك بالإنترنت أو من تسجيل الدخول.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-500">جاري تحميل لوحة التحكم...</div>;
  
  if (error) return <div className="text-center py-20 text-red-500 font-bold">{error}</div>;

  // ✅ لو الباك إند رجع بيانات، بنعرضها. لو لسه، بنعرض أصفار
  const displayStats = stats || {
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-l from-[#0a2e1f] to-[#15803d] p-8 md:p-12 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1000&q=80" alt="bg" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">مرحباً بك في نظام Vedra</h1>
            <p className="text-lg text-gray-200">إدارة أذكى .. لعمل أفضل</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col items-center min-w-[200px]">
            <div className="flex items-center gap-2 text-sm font-bold mb-1">
              <span>📅</span> {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span>🕒</span> {new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Sales Card */}
        <div className="bg-[#15803d] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-green-100 mb-1">إجمالي المبيعات</p>
              {/* ✅ هنا بنعرض إجمالي المبيعات من الباك إند */}
              <h3 className="text-3xl font-bold">{displayStats.totalSales?.toLocaleString()} ج.م</h3>
            </div>
            <span className="text-3xl bg-white/20 p-2 rounded-xl">💰</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-green-300 bg-green-900/30 w-fit px-2 py-1 rounded-lg">
            <span>⬆</span> 22%+
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">إجمالي الطلبات</p>
              {/* ✅ هنا بنعرض إجمالي الطلبات */}
              <h3 className="text-3xl font-bold text-gray-800">{displayStats.totalOrders}</h3>
            </div>
            <span className="text-3xl bg-gray-100 p-2 rounded-xl">🛒</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg relative z-10">
            <span>⬆</span> 18%+
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-green-50 to-transparent"></div>
        </div>

        {/* Customers Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">العملاء</p>
              {/* ✅ هنا بنعرض عدد العملاء */}
              <h3 className="text-3xl font-bold text-gray-800">{displayStats.totalCustomers}</h3>
            </div>
            <span className="text-3xl bg-purple-50 text-purple-600 p-2 rounded-xl">👥</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg relative z-10">
            <span>⬆</span> 8%+
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-purple-50 to-transparent"></div>
        </div>

        {/* Products Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">المنتجات</p>
              {/* ✅ هنا بنعرض عدد المنتجات */}
              <h3 className="text-3xl font-bold text-gray-800">{displayStats.totalProducts}</h3>
            </div>
            <span className="text-3xl bg-blue-50 text-blue-600 p-2 rounded-xl">📦</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-lg relative z-10">
            <span>⬆</span> 12%+
          </div>
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-blue-50 to-transparent"></div>
        </div>
      </div>

      {/* Charts & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>📈</span> مبيعات آخر 7 أيام
            </h2>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button className="px-4 py-1 text-sm font-bold bg-white shadow-sm rounded-lg text-gray-800">أسبوع</button>
              <button className="px-4 py-1 text-sm font-bold text-gray-500 hover:text-gray-800">شهر</button>
              <button className="px-4 py-1 text-sm font-bold text-gray-500 hover:text-gray-800">سنة</button>
            </div>
          </div>
          
          <div className="h-64 w-full relative">
            <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
              <line x1="0" y1="50" x2="500" y2="50" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="0" y1="150" x2="500" y2="150" stroke="#f3f4f6" strokeWidth="1" />
              
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#15803d" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#15803d" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              <path d="M0,150 C50,120 100,130 150,80 C200,30 250,80 300,110 C350,140 400,120 450,170 L500,160 L500,200 L0,200 Z" fill="url(#chartGradient)" />
              <path d="M0,150 C50,120 100,130 150,80 C200,30 250,80 300,110 C350,140 400,120 450,170 L500,160" fill="none" stroke="#15803d" strokeWidth="3" strokeLinecap="round" />
              <circle cx="150" cy="80" r="5" fill="#15803d" stroke="#fff" strokeWidth="2" />
              <circle cx="300" cy="110" r="5" fill="#15803d" stroke="#fff" strokeWidth="2" />
              <circle cx="450" cy="170" r="5" fill="#15803d" stroke="#fff" strokeWidth="2" />
            </svg>
            
            <div className="flex justify-between mt-2 text-xs text-gray-400 font-bold">
              <span>11-19</span>
              <span>11-20</span>
              <span>11-21</span>
              <span>11-22</span>
              <span>11-23</span>
              <span>11-24</span>
              <span>11-25</span>
            </div>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span>🏆</span> المنتجات الأكثر مبيعاً
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
            {bestSellers.length > 0 ? (
              bestSellers.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-green-100 text-green-700' : 
                      index === 1 ? 'bg-green-50 text-green-600' : 
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <img src={item.mainImageUrl || 'https://via.placeholder.com/50'} alt={item.nameAr} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">{item.nameAr}</h4>
                      <p className="text-xs text-gray-500">تم بيع {item.totalSold || item.quantity} قطعة</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-[#15803d]">{item.totalRevenue?.toLocaleString() || item.total?.toLocaleString()} ج.م</span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">لا توجد بيانات متاحة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}