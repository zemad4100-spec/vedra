import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-brand-dark text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-sand text-brand-dark rounded-xl flex items-center justify-center text-xl font-serif">❧</div>
          {sidebarOpen && (
            <div>
              <h1 className="text-lg font-bold">Vedra</h1>
              <p className="text-[10px] text-gray-400 tracking-widest">ERP SYSTEM</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
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
              >
                <span className="text-xl">{item.label.split(' ')[0]}</span>
                {sidebarOpen && <span className="font-bold text-sm">{item.label.substring(2)}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-700 space-y-2">
          <Link to="/" className="block bg-brand-sand text-brand-dark text-center py-2 rounded-xl font-bold text-sm hover:bg-white transition">
            🌐 عرض المتجر
          </Link>
          <button onClick={logout} className="w-full bg-red-600/20 text-red-400 py-2 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition">
            🚪 تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-2xl">☰</button>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">👤 {user.fullName || 'Admin'}</span>
            <div className="w-10 h-10 bg-brand-main text-white rounded-full flex items-center justify-center font-bold">
              {(user.fullName || 'A')[0]}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}