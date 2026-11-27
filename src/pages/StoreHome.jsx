import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

// توحيد النص العربي لتسهيل البحث
const normalizeText = (value) => {
  return String(value || '')
    .toLocaleLowerCase()
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ـ/g, '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/\s+/g, ' ');
};

export default function StoreHome() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);

  const rawSearchTerm = searchParams.get('search') || '';
  const searchTerm = normalizeText(rawSearchTerm);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;

    return products.filter((p) => {
      const searchableFields = [
        p.nameAr,
        p.name,
        p.nameEn,
        p.sku,
        p.description,
        p.descriptionAr,
        p.descriptionEn,
        p.shortDescAr,
        p.shortDescEn,
        p.categoryNameAr,
        p.categoryNameEn
      ];

      return searchableFields.some((field) =>
        normalizeText(field).includes(searchTerm)
      );
    });
  }, [products, searchTerm]);

  const displayedProducts = searchTerm
    ? filteredProducts
    : filteredProducts.slice(0, 8);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      try {
        const res = await api.get('/products', {
          params: { pageSize: 100 }
        });

        if (!cancelled) {
          const items = res.data?.data?.items || [];
          setProducts(items);
        }
      } catch (err) {
        console.error('Products Error:', err);
        if (!cancelled) showError('تعذر تحميل المنتجات');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddToCart = async (productId) => {
    if (addingId !== null) return;

    setAddingId(productId);

    try {
      const res = await api.post('/cart/items', {
        productId,
        quantity: 1
      });

      if (res.data.success) {
        showSuccess('تمت الإضافة للسلة بنجاح 🛒');
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        showError(res.data.message || 'فشل الإضافة للسلة');
      }
    } catch (err) {
      showError(
        err.response?.data?.message ||
        'فشل الإضافة للسلة، تأكد من تسجيل الدخول'
      );
    } finally {
      setAddingId(null);
    }
  };

  const features = [
    {
      icon: '🌱',
      title: 'نباتات طبيعية 100%',
      description: 'نباتات مختارة بعناية من أفضل المشاتل.'
    },
    {
      icon: '🚚',
      title: 'توصيل آمن وسريع',
      description: 'نوصل نباتاتك بأمان حتى باب المنزل.'
    },
    {
      icon: '💎',
      title: 'جودة مضمونة',
      description: 'نهتم بجودة كل منتج نقدمه لك.'
    },
    {
      icon: '🎨',
      title: 'تصميم المساحات',
      description: 'نساعدك في تصميم مساحتك الخضراء.'
    }
  ];

  const categories = [
    { icon: '🪴', name: 'نباتات منزلية' },
    { icon: '🌳', name: 'نباتات خارجية' },
    { icon: '🌵', name: 'نباتات صبار' },
    { icon: '🧺', name: 'أدوات الزراعة' }
  ];

  const spaces = [
    {
      title: 'البلكونة',
      img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'المكتب',
      img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'الروف',
      img: 'https://images.unsplash.com/photo-1598902108854-10e335adac99?auto=format&fit=crop&w=500&q=80'
    },
    {
      title: 'الحدائق',
      img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=500&q=80'
    }
  ];

  return (
    <div dir="rtl" className="bg-[#f7faf7] overflow-hidden">

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-3 sm:px-5 pt-5">
        <div className="relative min-h-[340px] sm:min-h-[430px] rounded-3xl overflow-hidden bg-[#0a3824] shadow-xl">

          <img
            src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=2000&q=85"
            alt="Verda Plants"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-l from-[#052c1c]/95 via-[#073b25]/75 to-transparent" />

          <div className="relative z-10 flex items-center min-h-[340px] sm:min-h-[430px] px-6 sm:px-12 lg:px-20">
            <div className="max-w-xl text-white">

              <span className="inline-block bg-green-400 text-green-950 px-4 py-2 rounded-full text-xs sm:text-sm font-black mb-5">
                🌿 أهلاً بك في عالم Verda
              </span>

              <h1 className="text-5xl sm:text-7xl font-black mb-4">
                Verda
              </h1>

              <h2 className="text-xl sm:text-3xl font-bold mb-3">
                حوّل منزلك إلى واحة خضراء
              </h2>

              <p className="text-sm sm:text-lg text-green-50 leading-8 mb-7">
                اكتشف أجمل النباتات والمنتجات الطبيعية
                واجعل الطبيعة جزءاً من حياتك اليومية.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => scrollToSection('products')}
                  className="bg-yellow-400 hover:bg-yellow-300 text-green-950 px-7 py-3.5 rounded-xl font-black shadow-lg transition"
                >
                  🛒 تسوق الآن
                </button>

                <button
                  onClick={() => scrollToSection('design')}
                  className="border border-white/60 hover:bg-white/10 text-white px-7 py-3.5 rounded-xl font-bold transition"
                >
                  🎨 صمم الآن
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-3 sm:px-5 py-7">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate('/products')}
              className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-center gap-3 hover:shadow-lg hover:border-green-400 transition"
            >
              <span className="text-4xl">{item.icon}</span>
              <span className="font-black text-sm sm:text-base text-[#0a3824]">
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-3 sm:px-5 py-8">
        <div className="text-center mb-7">
          <span className="text-green-700 font-bold text-sm">
            WHY VERDA?
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-[#0a3824] mt-2">
            لماذا تختار Verda؟
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            تجربة تسوق مميزة تبدأ من هنا
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {features.map((item, index) => (
            <div
              key={index}
              className="bg-white p-4 sm:p-6 rounded-2xl border border-green-100 text-center hover:shadow-lg transition"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-green-50 rounded-2xl flex items-center justify-center text-3xl mb-4">
                {item.icon}
              </div>

              <h3 className="font-black text-[#0a3824] text-sm sm:text-base mb-2">
                {item.title}
              </h3>

              <p className="text-gray-500 text-xs sm:text-sm leading-6">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Products and Best Sellers */}
      <section
        id="products"
        className="max-w-7xl mx-auto px-3 sm:px-5 py-8 scroll-mt-36"
      >
        <div
          id="best-sellers"
          className="flex items-center justify-between gap-3 mb-5 scroll-mt-36"
        >
          <div>
            <span className="text-green-700 text-xs font-bold">
              {searchTerm ? 'SEARCH RESULTS' : 'OUR PRODUCTS'}
            </span>

            <h2 className="text-xl sm:text-3xl font-black text-[#0a3824]">
              {searchTerm
                ? `نتائج البحث عن: ${rawSearchTerm}`
                : '⭐ الأكثر مبيعاً'}
            </h2>

            <p className="text-gray-500 text-xs mt-2">
              {loading ? 'جاري تحميل المنتجات...' : `${filteredProducts.length} منتج`}
            </p>
          </div>

          {searchTerm ? (
            <Link
              to="/#products"
              className="bg-red-50 text-red-600 px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
            >
              مسح البحث ✕
            </Link>
          ) : (
            <Link
              to="/products"
              className="bg-green-100 text-green-800 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap"
            >
              عرض كل المنتجات ←
            </Link>
          )}
        </div>

        <div className="bg-white rounded-3xl p-3 sm:p-5 border border-green-100 shadow-sm">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-40 sm:h-56 bg-gray-100 rounded-2xl" />
                  <div className="h-4 bg-gray-100 rounded mt-4" />
                  <div className="h-4 w-1/2 bg-gray-100 rounded mt-3" />
                </div>
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>

              <h3 className="text-xl font-black text-gray-700">
                {searchTerm
                  ? 'لم يتم العثور على منتجات'
                  : 'لا توجد منتجات متاحة حالياً'}
              </h3>

              <p className="text-gray-500 mt-2">
                {searchTerm
                  ? 'جرّب البحث باسم منتج آخر أو كود المنتج'
                  : 'سيتم إضافة المنتجات قريباً'}
              </p>

              {searchTerm && (
                <Link
                  to="/#products"
                  className="inline-block mt-5 bg-green-700 text-white px-6 py-3 rounded-xl font-bold"
                >
                  عرض جميع المنتجات
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {displayedProducts.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition group"
                >
                  <Link
                    to={`/product/${p.id}`}
                    className="block h-36 sm:h-52 lg:h-60 bg-green-50 overflow-hidden"
                  >
                    <img
                      src={p.mainImageUrl || 'https://via.placeholder.com/400'}
                      alt={p.nameAr || p.name || 'منتج Verda'}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/400';
                      }}
                    />
                  </Link>

                  <div className="p-3 sm:p-4">
                    <Link to={`/product/${p.id}`}>
                      <h3 className="font-black text-[#0a3824] text-xs sm:text-base truncate mb-2">
                        {p.nameAr || p.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between gap-1 mb-3">
                      <span className="text-green-700 font-black text-sm sm:text-lg">
                        {Number(p.effectivePrice || 0).toLocaleString('ar-EG')} ج.م
                      </span>
                      <span className="text-yellow-500 text-xs">🌿</span>
                    </div>

                    <button
                      disabled={addingId !== null}
                      onClick={() => handleAddToCart(p.id)}
                      className="w-full bg-[#116b3b] hover:bg-[#0a3824] disabled:opacity-50 text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm transition"
                    >
                      {addingId === p.id ? 'جاري الإضافة...' : '🛒 أضف للسلة'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Design Spaces */}
      <section
        id="design"
        className="max-w-7xl mx-auto px-3 sm:px-5 py-8 scroll-mt-36"
      >
        <div className="bg-[#0a3824] rounded-3xl p-5 sm:p-10 overflow-hidden">
          <div className="text-center mb-8">
            <span className="text-green-300 text-xs font-bold">
              MAKE IT GREEN
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              صمم مساحتك الخضراء 🌿
            </h2>

            <p className="text-green-100 text-sm mt-3">
              اختر مساحتك ودعنا نساعدك في تحويلها إلى مكان مميز
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {spaces.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate('/design')}
                className="relative h-36 sm:h-52 rounded-2xl overflow-hidden group"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                  <span className="text-white font-black text-lg sm:text-2xl">
                    {item.title}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/design')}
              className="bg-yellow-400 hover:bg-yellow-300 text-green-950 px-8 py-3.5 rounded-xl font-black transition shadow-lg"
            >
              اطلب تصميم مساحتك الآن ←
            </button>
          </div>
        </div>
      </section>

      {/* Bottom Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-5 pb-12">
        <div className="bg-green-100 rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h2 className="text-xl sm:text-3xl font-black text-[#0a3824]">
              ابدأ رحلتك مع الطبيعة 🌱
            </h2>

            <p className="text-gray-600 mt-2 text-sm">
              اكتشف مجموعتنا المميزة من النباتات والمنتجات.
            </p>
          </div>

          <button
            onClick={() => scrollToSection('products')}
            className="bg-[#116b3b] hover:bg-[#0a3824] text-white px-8 py-3 rounded-xl font-bold transition whitespace-nowrap"
          >
            تسوق الآن
          </button>
        </div>
      </section>
    </div>
  );
}