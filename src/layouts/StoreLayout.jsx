
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

  const isAdmin = user &&
    ['Admin', 'StoreManager'].includes(user.role);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    } catch (err) {
      console.error('User Error:', err);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearch(params.get('search') || '');
  }, [location.search]);

  const fetchCartCount = async () => {
    const sessionId = localStorage.getItem('sessionId');

    if (!sessionId) {
      setCartCount(0);
      return;
    }

    try {
      const res = await cartService.getCart(sessionId);
      setCartCount(res.data.data?.totalItems || 0);
    } catch (err) {
      console.error('Cart Error:', err);
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
    if (!location.hash) return;

    const sectionId = location.hash.slice(1);

    const timer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash, location.search]);

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname, location.hash]);

  const handleSearch = (e) => {
    e.preventDefault();

    const term = search.trim();

    navigate({
      pathname: '/',
      search: term ? `?search=${encodeURIComponent(term)}` : '',
      hash: '#products'
    });
  };

  const clearSearch = () => {
    setSearch('');
    navigate({
      pathname: '/',
      search: '',
      hash: '#products'
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setCartCount(0);
    navigate('/login');
  };

  const menuLink = (to, label, icon) => (
    <Link
      to={to}
      onClick={() => setMobileMenu(false)}
      className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-800 font-bold text-sm"
    >
      <span className="text-xl">{icon}</span>
      {label}
    </Link>
  );

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#f7faf7]">

      <div className="bg-[#082e1d] text-white text-center py-2 px-3 text-xs sm:text-sm font-semibold">
        🌿 توصيل آمن لجميع نباتاتك — أضف لمسة خضراء لحياتك
      </div>

      <header className="bg-[#0a3824] sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3">
          <div className="flex items-center justify-between gap-3">

            <button
              type="button"
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden w-10 h-10 rounded-xl bg-white/10 text-white text-xl flex items-center justify-center shrink-0"
              aria-label="القائمة"
            >
              {mobileMenu ? '✕' : '☰'}
            </button>

            <Link to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-3xl sm:text-4xl">🌿</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Verda
                </h1>
                <p className="text-[8px] text-green-300 font-bold tracking-widest">
                  LIVE GREEN · LIVE BETTER
                </p>
              </div>
            </Link>

            <form
              onSubmit={handleSearch}
              className="hidden md:block flex-1 max-w-xl"
            >
              <div className="relative">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن نبات أو منتج..."
                  className="w-full bg-white rounded-full py-3 pr-12 pl-12 text-gray-800 outline-none focus:ring-2 focus:ring-green-400"
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    aria-label="مسح البحث"
                  >
                    ✕
                  </button>
                )}

                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  aria-label="بحث"
                >
                  🔍
                </button>
              </div>
            </form>

            <div className="flex items-center gap-3 sm:gap-5 text-white">

              <Link
                to={user ? '/profile' : '/login'}
                className="hidden sm:flex flex-col items-center text-xs gap-1"
              >
                <span className="text-xl">👤</span>
                <span>حسابي</span>
              </Link>

              <Link
                to="/cart"
                className="relative flex flex-col items-center gap-1"
              >
                <span className="text-2xl">🛒</span>
                <span className="hidden sm:block text-xs">السلة</span>

                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-yellow-400 text-green-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-green-950 px-4 py-2 rounded-xl font-black text-sm transition"
                >
                  ⚙️ لوحة التحكم
                </Link>
              )}

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

          <form onSubmit={handleSearch} className="md:hidden mt-3">
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن نبات أو منتج..."
                className="w-full rounded-xl bg-white py-3 pr-11 pl-11 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-green-400"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-label="مسح البحث"
                >
                  ✕
                </button>
              )}

              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="بحث"
              >
                🔍
              </button>
            </div>
          </form>
        </div>

        <nav className="hidden md:block bg-[#116b3b]">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 py-2">
            <Link to="/" className="text-white px-4 py-2 rounded-lg hover:bg-white/10 font-bold text-sm">
              🏠 الرئيسية
            </Link>
            <Link to="/#products" className="text-white px-4 py-2 rounded-lg hover:bg-white/10 font-bold text-sm">
              🛒 تسوق الآن
            </Link>
            <Link to="/#best-sellers" className="text-white px-4 py-2 rounded-lg hover:bg-white/10 font-bold text-sm">
              ⭐ الأكثر مبيعاً
            </Link>
            <Link to="/#design" className="text-white px-4 py-2 rounded-lg hover:bg-white/10 font-bold text-sm">
              🎨 صمم الآن
            </Link>
          </div>
        </nav>

        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-green-100 shadow-xl p-4 space-y-2">
            {menuLink('/', 'الرئيسية', '🏠')}
            {menuLink('/#products', 'الأقسام والمنتجات', '🛒')}
            {menuLink('/#best-sellers', 'الأكثر مبيعاً', '⭐')}
            {menuLink('/#design', 'صمم الآن', '🎨')}
            {menuLink('/cart', 'سلة المشتريات', '🛍️')}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileMenu(false)}
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

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#082e1d] text-gray-300 mt-12">
        <div className="max-w-7xl mx-auto px-5 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          <div>
            <h3 className="text-3xl font-black text-white mb-3">
              🌿 Verda
            </h3>
            <p className="text-sm leading-7">
              مساحتك الخضراء تبدأ من هنا. نباتات مختارة بعناية وأفكار تلهمك تضيف لمسة طبيعية لكل مكان.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
            <div className="space-y-3 flex flex-col text-sm">
              <Link to="/" className="hover:text-green-400">الرئيسية</Link>
              <Link to="/#products" className="hover:text-green-400">تسوق النباتات</Link>
              <Link to="/#design" className="hover:text-green-400">تصميم المساحات</Link>
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
    </div>
  );
}
