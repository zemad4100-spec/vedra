import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

export default function StoreHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products', { params: { pageSize: 20 } }),
          api.get('/categories'),
        ]);
        setProducts(prodRes.data.data.items || []);
        setCategories(catRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ دالة إضافة المنتج للسلة مع سطر التشخيص
  const handleAddToCart = async (productId) => {
    try {
      const res = await api.post('/cart/items', { 
        productId: productId, 
        quantity: 1 
      });
      
      // ✅ سطر التشخيص المهم
      console.log('Response from AddToCart:', res.data);

      if (res.data.success) {
        showSuccess('تمت الإضافة للسلة بنجاح 🛒');
      } else {
        showError(res.data.message || 'فشل الإضافة للسلة');
      }
    } catch (err) {
      console.error('Error adding to cart:', err.response?.data);
      const msg = err.response?.data?.message || 'فشل الإضافة للسلة، تأكد من تسجيل الدخول';
      showError(msg);
    }
  };

  const filteredProducts = filter === 'all' ? products : products.filter(p => {
    if (filter === 'natural') return p.isNatural;
    if (filter === 'indoor') return p.isIndoor;
    if (filter === 'fragrant') return p.isFragrant;
    return true;
  });

  return (
    <>
      {/* Hero */}
      <section id="home" className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative rounded-[2.5rem] overflow-hidden min-h-[600px] flex items-center" style={{
          background: 'linear-gradient(90deg, rgba(10,28,19,0.95) 0%, rgba(10,28,19,0.7) 40%, rgba(10,28,19,0.1) 100%), url("https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=2000&q=85") center/cover'
        }}>
          <div className="text-white px-10 md:px-16 max-w-2xl">
            <span className="inline-block bg-white/10 border border-white/30 px-5 py-2 rounded-full text-sm font-bold mb-6">
              ✦ الطبيعة أقرب مما تتخيل
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6">
              خلّي للحياة <br /> <span className="text-brand-sand italic">مساحة خضراء</span>
            </h1>
            <p className="text-lg text-gray-200 mb-10 leading-loose">
              اكتشف تشكيلتنا من النباتات الطبيعية والصناعية، واختر القطعة اللي تناسب ذوقك ومساحتك.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#products" className="bg-brand-sand text-brand-dark px-8 py-4 rounded-xl font-bold hover:bg-white transition">
                اكتشف النباتات ←
              </a>
              <button 
                onClick={() => navigate('/design')}
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white hover:text-brand-dark transition"
              >
                صمّم مساحتك 🏡
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <span className="text-brand-main font-bold text-sm tracking-widest">تسوّق حسب القسم</span>
          <h2 className="text-4xl font-serif font-bold text-brand-dark mt-2">اختار عالمك الأخضر</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map(cat => (
            <button key={cat.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all text-right flex items-center gap-4">
              <div className="w-16 h-16 bg-brand-cream rounded-xl flex items-center justify-center text-3xl">🌱</div>
              <div>
                <h3 className="font-bold text-brand-dark">{cat.nameAr}</h3>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section id="products" className="bg-brand-cream/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 text-center">
            <span className="text-brand-main font-bold text-sm tracking-widest">اختياراتنا ليك</span>
            <h2 className="text-4xl font-serif font-bold text-brand-dark mt-2">منتجات مميزة</h2>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['all', 'natural', 'indoor', 'fragrant'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm border-2 transition ${
                  filter === f ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-main'
                }`}
              >
                {f === 'all' ? 'الكل' : f === 'natural' ? 'نباتات طبيعية' : f === 'indoor' ? 'نباتات داخلية' : 'نباتات عطرية'}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <p className="text-center text-gray-500 py-16">جاري التحميل...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-16">لا توجد منتجات</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(p => (
                <Link 
                  key={p.id} 
                  to={`/product/${p.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all block"
                >
                  <div className="h-64 bg-gray-100 overflow-hidden relative">
                    <img
                      src={p.mainImageUrl || 'https://via.placeholder.com/400'}
                      alt={p.nameAr}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif font-bold text-lg text-brand-dark mb-2">{p.nameAr}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{p.shortDescAr || 'نبات مميز من Vedra'}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-xl font-bold text-brand-main">
                        {p.effectivePrice?.toLocaleString()} ج.م
                      </span>
                      <button 
                        className="w-11 h-11 bg-brand-cream text-brand-dark rounded-xl font-bold text-xl hover:bg-brand-dark hover:text-white transition"
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          handleAddToCart(p.id); // ✅ استدعاء دالة الإضافة
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Design Section */}
      <section id="design" className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="text-brand-main font-bold text-sm tracking-widest">صمّم مساحتك</span>
          <h2 className="text-4xl font-serif font-bold text-brand-dark mt-2">مساحتك تستاهل تبقى أجمل</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            من بلكونة صغيرة لحديقة كاملة أو رووف مميز، شاركنا فكرتك وإحنا نساعدك في التصميم والتنفيذ.
          </p>
          <button 
            onClick={() => navigate('/design')}
            className="mt-6 btn-primary inline-block"
          >
            اطلب تصميم مساحتك الآن 🏡
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=85', title: 'حدائق منزلية' },
            { img: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=800&q=85', title: 'بلكونات خضراء' },
            { img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=85', title: 'رووف جاردن' },
          ].map((g, i) => (
            <div key={i} className="relative h-72 rounded-2xl overflow-hidden group cursor-pointer">
              <img src={g.img} alt={g.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 to-transparent flex items-end p-6">
                <span className="text-white font-serif font-bold text-lg">{g.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}