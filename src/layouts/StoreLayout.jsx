import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cartService } from '../services/cartService';

export default function StoreLayout() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  // جلب بيانات المستخدم والسلة
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  // تحديث عدد السلة كل ما الصفحة تتغير
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
    if (confirm('تسجيل الخروج؟')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream">
      {/* Topbar */}
      <div className="bg-brand-dark text-white text-center py-2 text-sm font-semibold">
        🌿 أضف لمسة خضراء لحياتك — <strong className="text-brand-sand">توصيل آمن لجميع نباتاتك</strong>
      </div>

      {/* Header */}
      <header className="bg-brand-cream sticky top-0 z-40 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-brand-dark text-brand-sand rounded-xl flex items-center justify-center text-2xl font-serif">
              ❧
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-brand-dark">Verda</h1>
              <p className="text-[10px] text-gray-500 font-bold tracking-widest">
                LANDSCAPE & GREEN SPACES
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-bold text-gray-700">
            <Link to="/" className="hover:text-brand-main">الرئيسية</Link>
            <a href="/#products" className="hover:text-brand-main">تسوق النباتات</a>
            <a href="/#design" className="hover:text-brand-main">صمّم مساحتك</a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                {['Admin', 'StoreManager'].includes(user.role) && (
                  <Link to="/admin" className="bg-brand-dark text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-main transition">
                    🛠️ لوحة التحكم
                  </Link>
                )}
                <button onClick={logout} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition">
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-brand-dark text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-main transition">
                تسجيل الدخول
              </Link>
            )}

            {/* Cart Icon - مربوط دلوقتي */}
            <Link to="/cart" className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-xl relative hover:bg-brand-cream transition">
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-brand-sand text-brand-dark text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-brand-dark text-gray-300 py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-sand text-brand-dark rounded-xl flex items-center justify-center text-xl font-serif">
                ❧
              </div>
              <h3 className="text-xl font-serif font-bold text-white">Verda</h3>
            </div>
            <p className="text-sm leading-loose">
              مساحتك الخضراء تبدأ من هنا. نباتات مختارة بعناية، وأفكار تلهمك تضيف لمسة طبيعية لكل مكان.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-brand-sand">الرئيسية</Link></li>
              <li><a href="/#products" className="hover:text-brand-sand">تسوق النباتات</a></li>
              <li><a href="/#design" className="hover:text-brand-sand">تصميم المساحات</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-brand-sand">سياسة الشحن</a></li>
              <li><a href="#" className="hover:text-brand-sand">الاستبدال والاسترجاع</a></li>
              <li><a href="#" className="hover:text-brand-sand">الأسئلة الشائعة</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-sm">
              <li>📞 0100 000 0000</li>
              <li>✉️ hello@verda.example</li>
              <li>📍 القاهرة، مصر</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Verda — جميع الحقوق محفوظة
        </div>
      </footer>
    </div>
  );
}