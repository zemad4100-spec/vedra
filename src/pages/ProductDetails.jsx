import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { cartService } from '../services/cartService';
import { showSuccess, showError } from '../utils/toast';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      let sessionId = localStorage.getItem('sessionId');
      if (!sessionId) {
        sessionId = 'guest-' + Math.random().toString(36).substring(7);
        localStorage.setItem('sessionId', sessionId);
      }

      await cartService.addItem({ productId: product.id, quantity }, sessionId);
      showSuccess('تمت الإضافة للسلة بنجاح');
    } catch (err) {
      showError('فشل الإضافة: ' + (err.response?.data?.message || err.message));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl">جاري التحميل...</div>;
  if (!product) return null;

  const mainImage = product.imageUrls && product.imageUrls.length > 0
    ? product.imageUrls[0]
    : 'https://via.placeholder.com/600';

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-white rounded-3xl overflow-hidden h-[500px]">
          <img
            src={mainImage}
            alt={product.nameAr}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/600'; }}
          />
        </div>

        <div>
          <span className="text-brand-main font-bold text-sm">{product.categoryNameAr}</span>
          <h1 className="text-4xl font-serif font-bold text-brand-dark mt-2 mb-4">{product.nameAr}</h1>
          <p className="text-gray-500 text-sm mb-4">{product.nameEn}</p>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-500 text-xl">★</span>
            <span className="font-bold">{product.averageRating?.toFixed(1) || 0}</span>
            <span className="text-gray-500">({product.reviewCount} تقييم)</span>
          </div>

          <p className="text-gray-600 leading-loose mb-6">
            {product.descriptionAr || product.shortDescAr || 'نبات مميز من Verda'}
          </p>

          <div className="bg-brand-cream rounded-2xl p-6 mb-6">
            <span className="text-4xl font-bold text-brand-main">
              {product.effectivePrice?.toLocaleString()} ج.م
            </span>
            {product.hasActiveDiscount && (
              <span className="text-lg text-gray-400 line-through mr-3">
                {product.basePrice?.toLocaleString()} ج.م
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
            {product.isNatural && <div className="bg-green-50 p-3 rounded-xl">🌿 نبات طبيعي</div>}
            {product.isIndoor && <div className="bg-green-50 p-3 rounded-xl">🏠 مناسب للداخل</div>}
            {product.isFragrant && <div className="bg-green-50 p-3 rounded-xl">🌸 عطري</div>}
            {product.isBestSeller && <div className="bg-yellow-50 p-3 rounded-xl">⭐ الأكثر مبيعاً</div>}
          </div>

          <div className="flex gap-4">
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-xl font-bold">-</button>
              <span className="px-4 py-3 font-bold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-xl font-bold">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 btn-primary py-3 text-lg"
            >
              {adding ? 'جاري الإضافة...' : '🛒 أضف إلى السلة'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}