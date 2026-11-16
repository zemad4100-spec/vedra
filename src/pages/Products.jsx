import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService, categoryService } from '../services/productService';
import ProductCard from '../components/Home/ProductCard';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // قراءة الفلاتر من الـ URL
  const [filters, setFilters] = useState({
    pageNumber: parseInt(searchParams.get('pageNumber')) || 1,
    pageSize: 12,
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    isIndoor: searchParams.get('isIndoor') || '',
    isNatural: searchParams.get('isNatural') || '',
    isFragrant: searchParams.get('isFragrant') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });

  // جلب الأقسام
  useEffect(() => {
    categoryService.getAll()
      .then(res => setCategories(res.data.data || []))
      .catch(err => console.error(err));
  }, []);

  // جلب المنتجات
  useEffect(() => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params[key] = value;
      }
    });

    productService.getAll(params)
      .then(res => {
        setProducts(res.data.data.items || []);
        setTotalCount(res.data.data.totalCount || 0);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [filters]);

  // تحديث الفلاتر
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value, pageNumber: 1 };
    setFilters(newFilters);
    
    // تحديث الـ URL
    const newParams = {};
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined && !(k === 'pageSize')) {
        newParams[k] = v;
      }
    });
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newFilters = { ...filters, pageNumber: page };
    setFilters(newFilters);
    setSearchParams({ ...Object.fromEntries(searchParams), pageNumber: page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / filters.pageSize);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">كل المنتجات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Search */}
          <div className="card p-4">
            <h3 className="font-bold mb-3">البحث</h3>
            <input
              type="text"
              placeholder="ابحث..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="input-field text-sm"
            />
          </div>

          {/* Categories */}
          <div className="card p-4">
            <h3 className="font-bold mb-3">الأقسام</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="category"
                  checked={filters.categoryId === ''}
                  onChange={() => updateFilter('categoryId', '')}
                />
                <span>كل الأقسام</span>
              </label>
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.categoryId === String(cat.id)}
                    onChange={() => updateFilter('categoryId', cat.id)}
                  />
                  <span>{cat.nameAr}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="card p-4">
            <h3 className="font-bold mb-3">السعر</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="من"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="input-field text-sm"
              />
              <input
                type="number"
                placeholder="إلى"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* Type */}
          <div className="card p-4">
            <h3 className="font-bold mb-3">النوع</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isNatural === 'true'}
                  onChange={(e) => updateFilter('isNatural', e.target.checked ? 'true' : '')}
                />
                <span>نباتات طبيعية</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isIndoor === 'true'}
                  onChange={(e) => updateFilter('isIndoor', e.target.checked ? 'true' : '')}
                />
                <span>نباتات داخلية</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.isFragrant === 'true'}
                  onChange={(e) => updateFilter('isFragrant', e.target.checked ? 'true' : '')}
                />
                <span>نباتات عطرية</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              عرض <strong>{products.length}</strong> من <strong>{totalCount}</strong> منتج
            </p>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="input-field w-auto text-sm"
            >
              <option value="newest">الأحدث</option>
              <option value="priceAsc">السعر: من الأقل للأعلى</option>
              <option value="priceDesc">السعر: من الأعلى للأقل</option>
              <option value="rating">الأعلى تقييماً</option>
              <option value="bestSeller">الأكثر مبيعاً</option>
            </select>
          </div>

          {/* Products */}
          {loading ? (
            <div className="text-center py-20">جاري التحميل...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-4xl mb-4">🔍</p>
              <p>لا توجد منتجات مطابقة</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    disabled={filters.pageNumber === 1}
                    onClick={() => handlePageChange(filters.pageNumber - 1)}
                    className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                  >
                    السابق
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && filters.pageNumber > 3) {
                      pageNum = filters.pageNumber - 2 + i;
                    }
                    if (pageNum > totalPages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg ${
                          filters.pageNumber === pageNum
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    disabled={filters.pageNumber === totalPages}
                    onClick={() => handlePageChange(filters.pageNumber + 1)}
                    className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}