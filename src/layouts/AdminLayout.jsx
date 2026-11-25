import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', label: 'لوحة التحكم', icon: '🏠', exact: true },
    { path: '/admin/pos', label: 'نقطة البيع (POS)', icon: '🛒' },
    { path: '/admin/purchase-invoices', label: 'فواتير الشراء', icon: '🛍️' },
    { path: '/admin/orders', label: 'الطلبات', icon: '📋' },
    { path: '/admin/products', label: 'المنتجات', icon: '📦' },
    { path: '/admin/suppliers', label: 'الموردين', icon: '🚚' },
    { path: '/admin/customers', label: 'العملاء', icon: '👥' },
    { path: '/admin/inventory', label: 'المخزن', icon: '🏠' },
    { path: '/admin/expenses', label: 'المصروفات', icon: '💰' },
    { path: '/admin/reports', label: 'التقارير', icon: '📊' },
    { path: '/admin/users', label: 'المستخدمين', icon: '👥' },
  ];

  return (
    <div className="min-h-screen flex bg-[#f4f7f6] overflow-hidden relative" dir="rtl">
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`bg-[#0a2e1f] text-white transition-all duration-300 flex flex-col z-50 fixed lg:static inset-y-0 right-0 ${sidebarOpen ? 'translate-x-0 w-64' : 'translate-x-full lg:translate-x-0 lg:w-20'}`}>
        
        <div className="p-6 flex flex-col items-center justify-center border-b border-[#1a4a34]">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-white tracking-wide">Vedra</h1>
            <span className="text-2xl text-[#4ade80]">🌿</span>
          </div>
          <p className="text-[10px] text-[#4ade80] tracking-widest font-bold">ERP SYSTEM</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar mt-2">
          {menuItems.map(item => {
            const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#15803d] text-white shadow-md' : 'text-gray-300 hover:bg-[#15803d]/50 hover:text-white'}`}>
                <span className="text-xl shrink-0">{item.icon}</span>
                {sidebarOpen && <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#1a4a34] space-y-3 shrink-0">
          <div className="bg-[#0f3d29] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎧</span>
              <div>
                <p className="text-xs text-gray-300 font-bold">دعم فني</p>
                <p className="text-sm font-bold text-[#4ade80]">24/7</p>
              </div>
            </div>
          </div>
          
          <button onClick={logout} className="w-full bg-[#7f1d1d] text-white py-3 rounded-xl font-bold text-sm hover:bg-red-800 transition flex items-center justify-center gap-2 whitespace-nowrap">
            {sidebarOpen ? 'تسجيل الخروج' : '🚪'}
            {sidebarOpen && <span>🚪</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center shrink-0 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-2xl text-gray-700 hover:text-[#15803d] transition">
              ☰
            </button>
            
            <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 w-96">
              <span className="text-gray-400 ml-2">🔍</span>
              <input type="text" placeholder="ابحث في النظام..." className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* ✅ 1. زرار المتجر */}
            <Link to="/" className="flex items-center gap-2 bg-[#f0fdf4] text-[#15803d] px-3 py-2 rounded-xl font-bold text-sm hover:bg-[#15803d] hover:text-white transition">
              <span>🌐</span>
              <span className="hidden md:block">المتجر</span>
            </Link>

            {/* ✅ 2. زرار الجرس (يوجه للطلبات) */}
            <Link to="/admin/orders" className="relative text-2xl text-gray-600 hover:text-[#15803d] transition">
              🔔
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
            </Link>
            
            <div className="flex items-center gap-2 border-r border-gray-200 pr-2 md:pr-4">
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-gray-800">{user.fullName || 'Admin'}</p>
                <p className="text-xs text-gray-500">مدير النظام</p>
              </div>
              <div className="w-10 h-10 bg-[#15803d] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm">
                {(user.fullName || 'A')[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}