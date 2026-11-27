
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

export default function StoreLayout() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user && ['Admin', 'StoreManager'].includes(user.role);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    } catch (err) {
      console.error('User data error:', err);
    }
  }, []);

  const fetchCartCount = async () => {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;

    try {
      const res = await cartService.getCart(sessionId);
      setCartCount(res.data.data?.totalItems || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCartCount();

    const updateCart = () => fetchCartCount();
    window.addEventListener('cart-updated', updateCart);

    return () => {
      window.removeEventListener('cart-updated', updateCart);
    };
  }, [location.pathname]);

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const value = search.trim();
    if (value) {
      navigate(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const navLink = (to, label, icon) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition ${
        location.pathname === to
          ? 'bg-green-100 text-green-800'
          : 'text-gray-700 hover:bg-green-50 hover:text-green-800'
      }`}
    >
      <span>{icon}</span>
      {label}
    </Link>
  );

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#f7faf7]">

      {/* Announcement */}
      <div className="bg-[#082e1d] text-white text-center py-2 px-3 text-xs sm:text-sm font-semibold">
        🌿 توصيل آمن لجميع نباتاتك — أضف لمسة خضراء لحياتك
      </div>

      {/* Header */}
      <header className="bg-[#0a3824] sticky top-0 z-50 shadow-lg">

        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3">

          <div className="flex items-center justify-between gap-3">

            {/* Mobile menu */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden w-10 h-10 rounded-xl bg-white/10 text-white text-xl flex items-center justify-center"
              aria-label="القائمة"
            >
              {mobileMenu ? '✕' : '☰'}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="text-3xl sm:text-4xl">🌿</div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                  Verda
                </h1>
                <p className="text-[8px] sm:text-[9px] text-green-300 font-bold tracking-widest">
                  LIVE GREEN · LIVE BETTER
                </p>
              </div>
            </Link>

            {/* Desktop search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:block flex-1 max-w-xl"
            >
              <div className="relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن نبات أو منتج..."
                  className="w-full bg-white rounded-full py-3 pr-12 pl-5 text-gray-800 outline-none focus:ring-2 focus:ring-green-400"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xl"
                >
                  🔍
                </button>
              </div>
            </form>

            {/* Header actions */}
            <div className="flex items-center gap-2 sm:gap-5 text-white">

              {/* Account */}
              <div className="hidden sm:flex flex-col items-center text-xs gap-1">
                <span className="text-xl">👤</span>
                <span>{user ? 'حسابي' : 'حسابي'}</span>
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex flex-col items-center gap-1 hover:text-green-300"
              >
                <span className="text-2xl">🛒</span>
                <span className="hidden sm:block text-xs">السلة</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-yellow-400 text-green-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Admin button - Desktop */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-green-950 px-4 py-2 rounded-xl font-black text-sm transition"
                >
                  ⚙️ لوحة التحكم
                </Link>
              )}

              {/* Login / Logout */}
              {user ? (
                <button
                  onClick={logout}
                  className="hidden sm:block bg-white/10 hover:bg-red-500 px-3 py-2 rounded-lg text-xs transition"
                >
                  خروج
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold"
                >
                  دخول
                </Link>
              )}

            </div>
          </div>

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="md:hidden mt-3">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن نبات أو منتج..."
                className="w-full rounded-xl bg-white py-3 pr-11 pl-4 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-green-400"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                🔍
              </button>
            </div>
          </form>

        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block bg-[#116b3b]">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 py-2">

            <Link to="/" className="text-white px-5 py-2 rounded-lg hover:bg-white/10 font-bold text-sm">
              🏠 الرئيسية
            </Link>

            <Link to="/products" className="text-white px-5 py-2 rounded-lg hover:bg-white/10 font-bold text-sm">
              🌿 تسوق النباتات
            </Link>

            <a href="/#best-sellers" className="text-white px-5 py-2 rounded-lg hover:bg-white/10 font-bold text-sm">
              ⭐ الأكثر مبيعاً
            </a>

            <a href="/#design" className="text-white px-5 py-2 rounded-lg hover:bg-white/10 font-bold text-sm">
              🎨 صمم مساحتك
            </a>

          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-green-100 shadow-xl p-4 space-y-2">

            {navLink('/', 'الرئيسية', '🏠')}
            {navLink('/products', 'تسوق النباتات', '🌿')}
            {navLink('/cart', 'سلة المشتريات', '🛒')}
            {navLink('/#best-sellers', 'الأكثر مبيعاً', '⭐')}
            {navLink('/#design', 'صمم مساحتك', '🎨')}

            {/* Admin visible on mobile */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center justify-between bg-[#0a3824] text-white p-4 rounded-xl font-black shadow-md"
              >
                <span>⚙️ لوحة تحكم الإدارة</span>
                <span>←</span>
              </Link>
            )}

            {user && (
              <button
                onClick={logout}
                className="w-full text-right p-3 text-red-600 font-bold bg-red-50 rounded-xl"
              >
                🚪 تسجيل الخروج
              </button>
            )}

          </div>
        )}

      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#082e1d] text-gray-300 mt-12">

        <div className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          <div>
            <h3 className="text-3xl font-black text-white mb-3">
              🌿 Verda
            </h3>
            <p className="text-sm leading-7 text-gray-300">
              مساحتك الخضراء تبدأ من هنا. نباتات مختارة بعناية وأفكار تلهمك تضيف لمسة طبيعية لكل مكان.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
            <div className="space-y-3 flex flex-col text-sm">
              <Link to="/" className="hover:text-green-400">الرئيسية</Link>
              <Link to="/products" className="hover:text-green-400">تسوق النباتات</Link>
              <Link to="/design" className="hover:text-green-400">تصميم المساحات</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">خدمة العملاء</h4>
            <div className="space-y-3 flex flex-col text-sm">
              <a href="#" className="hover:text-green-400">سياسة الشحن</a>
              <a href="#" className="hover:text-green-400">الاستبدال والاسترجاع</a>
              <a href="#" className="hover:text-green-400">الأسئلة الشائعة</a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">تواصل معنا</h4>
            <div className="space-y-3 text-sm">
              <p>📞 0100 000 0000</p>
              <p>✉️ hello@verda.example</p>
              <p>📍 القاهرة، مصر</p>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 py-5 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Verda — جميع الحقوق محفوظة
        </div>

      </footer>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_15px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-4 py-2">

          <Link to="/" className="flex flex-col items-center gap-1 text-green-800 text-xs">
            <span className="text-xl">🏠</span>
            الرئيسية
          </Link>

          <Link to="/products" className="flex flex-col items-center gap-1 text-gray-600 text-xs">
            <span className="text-xl">🌿</span>
            المنتجات
          </Link>

          <Link to="/cart" className="relative flex flex-col items-center gap-1 text-gray-600 text-xs">
            <span className="text-xl">🛒</span>
            السلة
            {cartCount > 0 && (
              <span className="absolute top-0 right-1/2 translate-x-5 bg-red-500 text-white rounded-full text-[9px] px-1.5">
                {cartCount}
              </span>
            )}
          </Link>

          {isAdmin ? (
            <Link to="/admin" className="flex flex-col items-center gap-1 text-green-800 font-black text-xs">
              <span className="text-xl">⚙️</span>
              الإدارة
            </Link>
          ) : (
            <Link to={user ? '/profile' : '/login'} className="flex flex-col items-center gap-1 text-gray-600 text-xs">
              <span className="text-xl">👤</span>
              حسابي
            </Link>
          )}

        </div>
      </div>

    </div>
  );
}
