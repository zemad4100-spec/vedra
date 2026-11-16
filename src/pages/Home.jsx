import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../services/productService';
import ProductCard from '../components/Home/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feat, best, newArr, cats] = await Promise.all([
          productService.getFeatured(),
          productService.getBestSellers(),
          productService.getNewArrivals(),
          categoryService.getAll(),
        ]);
        setFeatured(feat.data.data || []);
        setBestSellers(best.data.data || []);
        setNewArrivals(newArr.data.data || []);
        setCategories(cats.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-l from-primary-50 to-primary-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-primary-800 mb-4">
            اجعل منزلك أخضر 🌿
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            اكتشف تشكيلتنا الرائعة من النباتات الطبيعية والصناعية
          </p>
          <Link to="/products" className="btn-primary text-lg inline-block">
            تسوق الآن
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">تسوق حسب القسم</h2>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4">
          {categories.slice(0, 7).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="card p-4 text-center hover:bg-primary-50 transition-colors"
            >
              <div className="text-4xl mb-2">🌱</div>
              <p className="text-sm font-semibold text-gray-700">{cat.nameAr}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">⭐ منتجات مميزة</h2>
          <Link to="/products?sortBy=featured" className="text-primary-600 hover:underline">عرض الكل</Link>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">جاري التحميل...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Best Sellers */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🔥 الأكثر مبيعاً</h2>
            <Link to="/products?sortBy=bestSeller" className="text-primary-600 hover:underline">عرض الكل</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">✨ أحدث المنتجات</h2>
          <Link to="/products?sortBy=newest" className="text-primary-600 hover:underline">عرض الكل</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}