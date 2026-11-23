import { useEffect, useState } from 'react';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [form, setForm] = useState({
    categoryId: 1,
    sku: '',
    nameAr: '',
    nameEn: '',
    shortDescAr: '',
    shortDescEn: '',
    descriptionAr: '',
    descriptionEn: '',
    basePrice: 0,
    discountPrice: '',
    costPrice: 0,
    isNatural: true,
    isIndoor: true,
    isFragrant: false,
    isFeatured: false,
    isNew: false,
    isSeasonal: false,
    isBestSeller: false,
    isActive: true,
    imageUrls: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/products', { params: { pageSize: 100 } }),
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

  useEffect(() => { loadData(); }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      categoryId: categories[0]?.id || 1,
      sku: '',
      nameAr: '',
      nameEn: '',
      shortDescAr: '',
      shortDescEn: '',
      descriptionAr: '',
      descriptionEn: '',
      basePrice: 0,
      discountPrice: '',
      costPrice: 0,
      isNatural: true,
      isIndoor: true,
      isFragrant: false,
      isFeatured: false,
      isNew: false,
      isSeasonal: false,
      isBestSeller: false,
      isActive: true,
      imageUrls: [],
    });
    setImageUrlInput('');
    setError('');
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      categoryId: product.categoryId || categories[0]?.id || 1,
      sku: product.sku,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      shortDescAr: product.shortDescAr || '',
      shortDescEn: product.shortDescEn || '',
      descriptionAr: product.descriptionAr || '',
      descriptionEn: product.descriptionEn || '',
      basePrice: product.basePrice,
      discountPrice: product.discountPrice || '',
      costPrice: product.costPrice || 0,
      isNatural: product.isNatural,
      isIndoor: product.isIndoor,
      isFragrant: product.isFragrant,
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      isSeasonal: product.isSeasonal,
      isBestSeller: product.isBestSeller,
      isActive: product.isActive,
      imageUrls: product.imageUrls || [],
    });
    setImageUrlInput('');
    setError('');
    setShowModal(true);
  };

  // ✅ رفع الصور مع معالجة الرابط النهائي
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    setError('');

    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/upload/image', formData);

        if (res.data.success && res.data.data.url) {
          let imageUrl = res.data.data.url;

          // 1. نشيل أي باراميترز غريبة
          imageUrl = imageUrl.split('?')[0].split('#')[0];

          // 2. نتأكد إن الرابط آمن (https)
          imageUrl = imageUrl.replace('http://', 'https://');

          // 3. نشيل أي تكرار للدومين
          const domain = 'https://kilogram-parabola-showing.ngrok-free.dev';
          if (imageUrl.includes(domain + domain)) {
            imageUrl = imageUrl.replace(domain + domain, domain);
          }
          
          // 4. لو مش بيبدأ بـ http، نضيف الدومين
          if (!imageUrl.startsWith('http')) {
            if (!imageUrl.startsWith('/')) {
              imageUrl = '/' + imageUrl;
            }
            imageUrl = `${domain}${imageUrl}`;
          }

          uploadedUrls.push(imageUrl);
        } else {
          throw new Error(res.data.message || 'فشل رفع الصورة');
        }
      }

      setForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...uploadedUrls] }));
      showSuccess('تم رفع الصور بنجاح');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'فشل رفع الصورة';
      setError(msg);
      showError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, imageUrlInput.trim()] }));
    setImageUrlInput('');
  };

  const removeImage = (index) => {
    setForm(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        categoryId: Number(form.categoryId),
        sku: form.sku,
        nameAr: form.nameAr,
        nameEn: form.nameEn,
        shortDescAr: form.shortDescAr || null,
        shortDescEn: form.shortDescEn || null,
        descriptionAr: form.descriptionAr || null,
        descriptionEn: form.descriptionEn || null,
        basePrice: Number(form.basePrice),
        discountPrice: form.discountPrice !== '' && form.discountPrice !== null 
          ? Number(form.discountPrice) 
          : null,
        costPrice: form.costPrice ? Number(form.costPrice) : null,
        isNatural: form.isNatural,
        isIndoor: form.isIndoor,
        isFragrant: form.isFragrant,
        isFeatured: form.isFeatured,
        isNew: form.isNew,
        isSeasonal: form.isSeasonal,
        isBestSeller: form.isBestSeller,
        isActive: form.isActive,
        imageUrls: form.imageUrls || [],
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        showSuccess('تم تحديث المنتج بنجاح');
      } else {
        await api.post('/admin/products', payload);
        showSuccess('تم إضافة المنتج بنجاح');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error:', err.response?.data);
      setError(err.response?.data?.message || 'فشل الحفظ');
      showError(err.response?.data?.message || 'فشل الحفظ');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      showSuccess('تم حذف المنتج');
      loadData();
    } catch (err) {
      showError('فشل الحذف: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-brand-dark">📦 إدارة المنتجات</h1>
        <button onClick={openAddModal} className="btn-primary w-full sm:w-auto">
          + إضافة منتج جديد
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-right text-xs font-bold text-gray-500">الصورة</th>
                <th className="p-4 text-right text-xs font-bold text-gray-500">الاسم</th>
                <th className="p-4 text-right text-xs font-bold text-gray-500">الكود</th>
                <th className="p-4 text-right text-xs font-bold text-gray-500">السعر</th>
                <th className="p-4 text-right text-xs font-bold text-gray-500">القسم</th>
                <th className="p-4 text-right text-xs font-bold text-gray-500">الحالة</th>
                <th className="p-4 text-right text-xs font-bold text-gray-500">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <img 
                      src={p.mainImageUrl || 'https://via.placeholder.com/40'} 
                      alt={p.nameAr}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/40'; }}
                    />
                  </td>
                  <td className="p-4 text-sm font-bold">{p.nameAr}</td>
                  <td className="p-4 text-sm text-gray-600">{p.sku}</td>
                  <td className="p-4 text-sm font-bold text-brand-main">{p.effectivePrice?.toLocaleString()} ج.م</td>
                  <td className="p-4 text-sm">{p.categoryNameAr}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.isActive ? 'نشط' : 'موقوف'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-200 whitespace-nowrap"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 whitespace-nowrap"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">لا يوجد منتجات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 max-h-[90vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-brand-dark">
                {editingProduct ? '✏️ تعديل المنتج' : '➕ منتج جديد'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-2xl text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold block mb-1">الاسم بالعربية *</label>
                    <input
                      type="text"
                      className="input-field w-full p-3"
                      value={form.nameAr}
                      onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold block mb-1">الاسم بالإنجليزية *</label>
                    <input
                      type="text"
                      className="input-field w-full p-3"
                      value={form.nameEn}
                      onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold block mb-1">الكود (SKU) *</label>
                    <input
                      type="text"
                      className="input-field w-full p-3"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold block mb-1">القسم *</label>
                    <select
                      className="input-field w-full p-3"
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold block mb-1">السعر *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field w-full p-3"
                      value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold block mb-1">السعر بعد الخصم</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-field w-full p-3"
                      value={form.discountPrice}
                      onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold block mb-1">الوصف المختصر (عربي)</label>
                  <input
                    type="text"
                    className="input-field w-full p-3"
                    value={form.shortDescAr}
                    onChange={(e) => setForm({ ...form, shortDescAr: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold block mb-1">الوصف الكامل (عربي)</label>
                  <textarea
                    className="input-field w-full p-3"
                    rows="3"
                    value={form.descriptionAr}
                    onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  />
                </div>

                {/* قسم الصور */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="text-sm font-bold block mb-2">صور المنتج</label>
                  
                  {form.imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {form.imageUrls.map((url, idx) => (
                        <div key={idx} className="relative">
                          <img 
                            src={url} 
                            alt={`img-${idx}`} 
                            className="w-full h-20 object-cover rounded-lg" 
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Error'; }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full text-xs font-bold"
                          >✕</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* رفع من الجهاز */}
                  <label className="block border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-brand-main transition mb-2">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <span className="text-gray-600">جاري رفع الصور...</span>
                    ) : (
                      <>
                        <p className="text-2xl mb-1">📷</p>
                        <p className="text-sm font-bold text-gray-600">اضغط لاختيار صور من جهازك</p>
                      </>
                    )}
                  </label>

                  {/* إضافة لينك صورة */}
                  <div className="mt-3">
                    <label className="text-sm font-bold block mb-1">أو أضف رابط صورة من النت</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        className="input-field flex-1 p-3"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImageUrl())}
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="btn-primary px-4 py-3 sm:py-0"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'isNatural', label: '🌿 طبيعي' },
                    { key: 'isIndoor', label: '🏠 داخلي' },
                    { key: 'isFragrant', label: '🌸 عطري' },
                    { key: 'isFeatured', label: '⭐ مميز' },
                    { key: 'isNew', label: '✨ جديد' },
                    { key: 'isSeasonal', label: '🍂 موسمي' },
                    { key: 'isBestSeller', label: '🔥 الأكثر مبيعاً' },
                    { key: 'isActive', label: '✅ نشط' },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form[opt.key]}
                        onChange={(e) => setForm({ ...form, [opt.key]: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-bold">{opt.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t mt-2">
                  <button type="submit" className="btn-primary flex-1 py-3 order-1 sm:order-none">
                    {editingProduct ? '💾 حفظ التعديلات' : '✅ إضافة المنتج'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition order-2 sm:order-none w-full sm:w-auto"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}