import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const discountPercent = product.hasActiveDiscount
    ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100)
    : 0;

  return (
    <div className="card overflow-hidden group">
      <Link to={`/product/${product.id}`}>
        <div className="relative overflow-hidden bg-gray-100 h-64">
          <img
            src={product.mainImageUrl || '/placeholder-plant.jpg'}
            alt={product.nameAr}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x400?text=Plant'; }}
          />
          {discountPercent > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
              ⭐ الأكثر مبيعاً
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.categoryNameAr}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-800 mb-2 line-clamp-1 hover:text-primary-600">
            {product.nameAr}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-500">★</span>
          <span className="text-sm text-gray-600">
            {product.averageRating?.toFixed(1) || 0} ({product.reviewCount || 0})
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {product.hasActiveDiscount ? (
              <>
                <span className="text-lg font-bold text-primary-600">{product.discountPrice} ج.م</span>
                <span className="text-sm text-gray-400 line-through mr-2">{product.basePrice} ج.م</span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary-600">{product.basePrice} ج.م</span>
            )}
          </div>
          <button className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700" title="أضف للسلة">
            🛒
          </button>
        </div>
      </div>
    </div>
  );
}