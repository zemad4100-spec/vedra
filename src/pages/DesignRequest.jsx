import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

export default function DesignRequest() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    location: '',
    requestType: 'Balcony',
    spaceSqm: '',
    budget: '',
    designStyle: '',
    notes: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/design', {
        ...form,
        spaceSqm: form.spaceSqm ? Number(form.spaceSqm) : null,
        budget: form.budget ? Number(form.budget) : null,
      });
      showSuccess('تم استلام طلبك بنجاح! سنتواصل معك قريباً 🌿');
      setForm({
        fullName: '',
        phone: '',
        location: '',
        requestType: 'Balcony',
        spaceSqm: '',
        budget: '',
        designStyle: '',
        notes: '',
      });
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      showError('فشل: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <span className="text-brand-main font-bold text-sm tracking-widest">صمّم مساحتك</span>
        <h1 className="text-4xl font-serif font-bold text-brand-dark mt-2">
          مساحتك تستاهل تبقى أجمل
        </h1>
        <p className="text-gray-500 mt-4">
          املأ البيانات وهيتواصل معاك فريقنا في أقرب وقت
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-sm space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold block mb-1">الاسم الكامل *</label>
            <input
              type="text"
              className="input-field"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">رقم الهاتف *</label>
            <input
              type="tel"
              className="input-field"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">العنوان</label>
            <input
              type="text"
              className="input-field"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">نوع المساحة *</label>
            <select
              className="input-field"
              value={form.requestType}
              onChange={(e) => setForm({ ...form, requestType: e.target.value })}
            >
              <option value="Balcony">بلكونة</option>
              <option value="Roof">روف</option>
              <option value="Garden">حديقة منزلية</option>
              <option value="Office">مكتب</option>
              <option value="Commercial">مساحة تجارية</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">المساحة (متر مربع)</label>
            <input
              type="number"
              className="input-field"
              value={form.spaceSqm}
              onChange={(e) => setForm({ ...form, spaceSqm: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-bold block mb-1">الميزانية التقريبية (جنيه)</label>
            <input
              type="number"
              className="input-field"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold block mb-1">نمط التصميم المفضل</label>
          <input
            type="text"
            className="input-field"
            placeholder="مثلاً: عصري، كلاسيكي، ريفي..."
            value={form.designStyle}
            onChange={(e) => setForm({ ...form, designStyle: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-bold block mb-1">تفاصيل إضافية</label>
          <textarea
            className="input-field"
            rows="4"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="اكتب أي تفاصيل عن المساحة أو الفكرة اللي في بالك..."
          />
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-lg">
          {loading ? 'جاري الإرسال...' : 'اطلب التصميم الآن 🚀'}
        </button>
      </form>

      <div className="text-center mt-6">
        <Link to="/" className="text-sm text-brand-main hover:underline">
          ← رجوع للمتجر
        </Link>
      </div>
    </div>
  );
}