import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

export default function StoreLayout() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    const fetchCartCount = async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        try {
          const res = await cartService.getCart(sessionId);
          setCartCount(res.data.data?.totalItems || 0);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchCartCount();
  }, [location.pathname]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf9]">
      {/* Topbar */}
      <div className="bg-[#0a2e1f] text-white text-center py-1.5 text-[10px] sm:text-xs font-semibold">
        🌿 توصيل آمن لجميع نباتاتك — أضف لمسة خضراء لحياتك
      </div>

      {/* Header */}
      <header className="bg-[#0f3d29] sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="text-3xl text-[#4ade80]">🌿</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">Verda</h1>
              <p className="text-[7px] sm:text-[8px] text-[#4ade80] font-bold tracking-widest">LIVE GREEN .. LIVE BETTER</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                className="w-full px-5 py-2 pr-12 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#4ade80]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 sm:gap-5 text-white text-xs">
            
            {/* Profile Link (user icon) */}
            <Link to={user ? "/profile" : "/login"} className="flex flex-col items-center gap-1 hover:text-[#4ade80] transition">
              <span className="text-xl sm:text-2xl">👤</span>
              <span className="hidden sm:block">{user ? user.fullName.split(' ')[0] : 'حسابي'}</span>
            </Link>

            {/* Wishlist (Best Sellers) */}
            <Link to="/#best-sellers" className="flex flex-col items-center gap-1 hover:text-[#4ade80] transition">
              <span className="text-xl sm:text-2xl">❤️</span>
              <span className="hidden sm:block">المفضلة</span>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="flex flex-col items-center gap-1 hover:text-[#4ade80] transition relative">
              <span className="text-xl sm:text-2xl">🛒</span>
              <span className="hidden sm:block">السلة</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-[#4ade80] text-[#0a2e1f] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Admin / Logout (only if logged in) */}
            {user ? (
              <div className="flex flex-col items-center gap-1">
                {['Admin', 'StoreManager'].includes(user.role) && (
                  <Link to="/admin" className="bg-white/10 px-2 py-1 rounded-md text-[10px] hover:bg-white/20 transition hidden sm:block">لوحة التحكم</Link>
                )}
                <button onClick={logout} className="text-[10px] text-red-300 hover:text-red-100">خروج</button>
              </div>
            ) : (
              <Link to="/login" className="bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition">دخول</Link>
            )}
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-[#15803d] border-t border-[#0f3d29]">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 py-2 overflow-x-auto no-scrollbar text-[11px] sm:text-sm font-bold text-white/90">
            <Link to="/" className="hover:text-white whitespace-nowrap flex items-center gap-1">
              <span>🏠</span> الرئيسية
            </Link>
            <Link to="/products" className="hover:text-white whitespace-nowrap flex items-center gap-1">
              <span>📦</span> الأقسام
            </Link>
            <a href="/#offers" className="hover:text-white whitespace-nowrap flex items-center gap-1">
              <span>🏷️</span> العروض
            </a>
            <a href="/#best-sellers" className="hover:text-white whitespace-nowrap flex items-center gap-1">
              <span>⭐</span> الأكثر مبيعاً
            </a>
            <a href="/#about" className="hover:text-white whitespace-nowrap flex items-center gap-1">
              <span>ℹ️</span> من نحن
            </a>
            <Link to="/design" className="hover:text-white whitespace-nowrap flex items-center gap-1">
              <span>🎨</span> صمّم مساحتك
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#0a2e1f] text-gray-300 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl text-[#4ade80]">🌿</span>
              <h3 className="text-xl font-bold text-white">Verda</h3>
            </div>
            <p className="text-sm leading-relaxed">
              مساحتك الخضراء تبدأ من هنا. نباتات مختارة بعناية، وأفكار تلهمك تضيف لمسة طبيعية لكل مكان.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-[#4ade80]">الرئيسية</Link></li>
              <li><Link to="/products" className="hover:text-[#4ade80]">تسوق النباتات</Link></li>
              <li><Link to="/design" className="hover:text-[#4ade80]">تصميم المساحات</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#4ade80]">سياسة الشحن</a></li>
              <li><a href="#" className="hover:text-[#4ade80]">الاستبدال والاسترجاع</a></li>
              <li><a href="#" className="hover:text-[#4ade80]">الأسئلة الشائعة</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-sm">
              <li>📞 0100 000 0000</li>
              <li>✉️ hello@verda.example</li>
              <li>📍 القاهرة، مصر</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#15803d] mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Verda — جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  );
}