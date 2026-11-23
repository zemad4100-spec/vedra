import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  // بنبدأ بقفل القائمة في الموبايل، وفتحها في الشاشات الكبيرة
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // تأثير عشان نقفل القائمة أوتوماتيك لما المستخدم يغير الصفحة (في الموبايل)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // تأثير عشان نظبط حالة القائمة لو المستخدم عمل Resize للشاشة
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', label: '📊 لوحة التحكم', exact: true },
    { path: '/admin/pos', label: '💳 نقطة البيع (POS)' },
    { path: '/admin/purchase-invoices', label: '🛍️ فواتير الشراء' },
    { path: '/admin/orders', label: '📋 الطلبات' },
    { path: '/admin/products', label: '📦 المنتجات' },
    { path: '/admin/suppliers', label: '🚚 الموردين' },
    { path: '/admin/customers', label: '👤 العملاء' },
    { path: '/admin/inventory', label: '📦 المخزن' },
    { path: '/admin/expenses', label: '💰 المصروفات' },
    { path: '/admin/reports', label: '📈 التقارير' },
    { path: '/admin/users', label: '👥 المستخدمين' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 overflow-hidden relative">
      
      {/* Overlay: خلفية سوداء شفافة تظهر في الموبايل لما القائمة تكون مفتوحة */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`bg-brand-dark text-white transition-all duration-300 flex flex-col z-50 fixed lg:static inset-y-0 right-0
          ${sidebarOpen ? 'translate-x-0 w-64' : 'translate-x-full lg:translate-x-0 lg:w-20'}
        `}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-sand text-brand-dark rounded-xl flex items-center justify-center text-xl font-serif shrink-0">❧</div>
            {sidebarOpen && (
              <div className="whitespace-nowrap">
                <h1 className="text-lg font-bold">Vedra</h1>
                <p className="text-[10px] text-gray-400 tracking-widest">ERP SYSTEM</p>
              </div>
            )}
          </div>
          {/* زرار قفل القائمة يظهر بس في الموبايل */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white text-2xl">
            ✕
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map(item => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  isActive ? 'bg-brand-main text-white' : 'text-gray-300 hover:bg-gray-800'
                }`}
                title={!sidebarOpen ? item.label.substring(2) : ''} // tooltip للشاشات الكبيرة
              >
                <span className="text-xl shrink-0">{item.label.split(' ')[0]}</span>
                {sidebarOpen && <span className="font-bold text-sm whitespace-nowrap">{item.label.substring(2)}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-700 space-y-2 shrink-0">
          <Link to="/" className="block bg-brand-sand text-brand-dark text-center py-2 rounded-xl font-bold text-sm hover:bg-white transition whitespace-nowrap">
            {sidebarOpen ? '🌐 عرض المتجر' : '🌐'}
          </Link>
          <button onClick={logout} className="w-full bg-red-600/20 text-red-400 py-2 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-2 whitespace-nowrap">
            {sidebarOpen ? '🚪 تسجيل الخروج' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-2xl text-gray-700 hover:text-brand-main transition">
              ☰
            </button>
            {/* عنوان الصفحة الحالية في الموبايل (اختياري) */}
            <span className="text-sm font-bold text-gray-500 lg:hidden">
              {menuItems.find(item => item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path))?.label.substring(2) || 'لوحة التحكم'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold hidden sm:block">👤 {user.fullName || 'Admin'}</span>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-brand-main text-white rounded-full flex items-center justify-center font-bold shrink-0">
              {(user.fullName || 'A')[0]}
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