import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      setIsLoggedIn(true);
      try {
        setUserName(JSON.parse(user).fullName || 'حسابي');
      } catch {
        setUserName('حسابي');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center py-2 text-sm border-b border-gray-100">
          <div className="flex items-center gap-4 text-gray-600">
            <a href="tel:+201000000000" className="hover:text-primary-600">📞 01000000000</a>
            <a href="mailto:info@plantstore.com" className="hover:text-primary-600">✉️ info@plantstore.com</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="hover:text-primary-600">🌐 العربية</button>
            <button className="hover:text-primary-600">💵 EGP</button>
          </div>
        </div>

        {/* Main Nav */}
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-3xl">🌿</span>
            <div>
              <h1 className="text-2xl font-bold text-primary-700">مشتل أونلاين</h1>
              <p className="text-xs text-gray-500">Online Plant Store</p>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن نبات، أصيص، سماد..."
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <Link to="/wishlist" className="relative hover:text-primary-600">
              <span className="text-2xl">❤️</span>
            </Link>
            <Link to="/cart" className="relative hover:text-primary-600">
              <span className="text-2xl">🛒</span>
              <span className="absolute -top-1 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
            </Link>
            
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 hover:text-primary-600"
                >
                  <span className="text-2xl">👤</span>
                  <span className="hidden md:block text-sm font-semibold">{userName}</span>
                </button>
                {showMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50">حسابي</Link>
                    <Link to="/orders" className="block px-4 py-2 hover:bg-gray-50">طلباتي</Link>
                    <Link to="/wishlist" className="block px-4 py-2 hover:bg-gray-50">المفضلة</Link>
                    <button onClick={handleLogout} className="w-full text-right px-4 py-2 hover:bg-gray-50 text-red-600">
                      تسجيل خروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm">تسجيل الدخول</Link>
            )}
          </div>
        </div>

        {/* Categories Nav */}
        <nav className="flex items-center gap-6 py-3 border-t border-gray-100 text-sm font-semibold">
          <Link to="/category/natural-indoor-plants" className="hover:text-primary-600">نباتات داخلية</Link>
          <Link to="/category/natural-outdoor-plants" className="hover:text-primary-600">نباتات خارجية</Link>
          <Link to="/category/fragrant-plants" className="hover:text-primary-600">نباتات عطرية</Link>
          <Link to="/category/pots-planters" className="hover:text-primary-600">أصص وأحواض</Link>
          <Link to="/category/soil-fertilizers-tools" className="hover:text-primary-600">تربة وأسمدة</Link>
          <Link to="/offers" className="text-red-600 hover:text-red-700">🔥 عروض</Link>
          <Link to="/blog" className="hover:text-primary-600">المدونة</Link>
        </nav>
      </div>
    </header>
  );
}