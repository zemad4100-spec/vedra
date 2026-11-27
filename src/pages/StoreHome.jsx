import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

export default function StoreHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleAddToCart = async (productId) => {
    try {
      const res = await api.post('/cart/items', { 
        productId: productId, 
        quantity: 1 
      });
      if (res.data.success) {
        showSuccess('تمت الإضافة للسلة بنجاح 🛒');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showError(res.data.message || 'فشل الإضافة للسلة');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل الإضافة للسلة، تأكد من تسجيل الدخول';
      showError(msg);
    }
  };

  return (
    <div className="bg-[#f8faf9]">
      
      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="relative rounded-3xl overflow-hidden bg-[#0f3d29] flex items-center min-h-[400px]">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-40">
            <img 
              src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=2000&q=80" 
              alt="Plants" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="relative z-10 px-8 md:px-16 max-w-2xl text-white">
            <span className="inline-block bg-[#4ade80] text-[#0a2e1f] px-4 py-1.5 rounded-full text-sm font-bold mb-4">
              مرحباً بكم في متجر
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4">
              Verda
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              منتجات عالية الجودة .. لحياة أفضل
            </p>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 bg-[#ffc107] text-[#0a2e1f] px-8 py-3.5 rounded-xl font-bold hover:bg-[#ffca2c] transition shadow-lg"
            >
              🛒 تسوق الآن
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.slice(0, 6).map(cat => (
            <Link 
              key={cat.id} 
              to={`/category/${cat.id}`}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition group"
            >
              <div className="w-14 h-14 bg-[#f0fdf4] text-[#15803d] rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🌱
              </div>
              <h3 className="font-bold text-sm text-[#0a2e1f] text-center">{cat.nameAr}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-[#15803d] rounded-t-2xl p-4 flex items-center gap-2">
          <span className="text-2xl text-[#ffc107]">⭐</span>
          <h2 className="text-xl font-bold text-white">الأكثر مبيعاً</h2>
        </div>
        
        <div className="bg-white p-6 rounded-b-2xl shadow-sm border border-gray-100">
          {loading ? (
            <p className="text-center text-gray-500 py-10">جاري التحميل...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition group relative">
                  {/* Discount Badge (Example) */}
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                    -20%
                  </div>
                  
                  <Link to={`/product/${p.id}`} className="block h-56 bg-gray-50 overflow-hidden relative">
                    <img
                      src={p.mainImageUrl || 'https://via.placeholder.com/400'}
                      alt={p.nameAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }}
                    />
                  </Link>
                  
                  <div className="p-4 text-center">
                    <Link to={`/product/${p.id}`}>
                      <h3 className="font-bold text-[#0a2e1f] mb-1 truncate">{p.nameAr}</h3>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-lg font-bold text-[#15803d]">{p.effectivePrice?.toLocaleString()} جنيه</span>
                      <span className="text-sm text-gray-400 line-through">{(p.effectivePrice * 1.2).toLocaleString()} جنيه</span>
                    </div>
                    <button 
                      onClick={() => handleAddToCart(p.id)}
                      className="w-full bg-[#15803d] text-white py-2 rounded-xl font-bold text-sm hover:bg-[#0a2e1f] transition flex items-center justify-center gap-2"
                    >
                      <span>🛒</span> أضف إلى السلة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}