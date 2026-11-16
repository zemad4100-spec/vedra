import { Outlet, useNavigate } from 'react-router-dom';

export default function POSLayout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-brand-dark p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💳</span>
          <h1 className="text-lg font-bold">Vedra POS - نقطة البيع</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">👤 {user.fullName || 'Cashier'}</span>
          <button onClick={logout} className="bg-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition">
            خروج
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}