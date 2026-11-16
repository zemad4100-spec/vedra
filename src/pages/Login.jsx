import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { showSuccess, showError } from '../utils/toast';

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ emailOrPhone: '', password: '' });
  
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    preferredLanguage: 'ar',
    preferredCurrency: 'EGP',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', loginForm);
      const data = res.data.data;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data));
      
      showSuccess(`أهلاً بك ${data.fullName}! 🎉`);
      
      setTimeout(() => {
        if (data.role === 'Admin' || data.role === 'StoreManager') {
          navigate('/admin');
        } else if (data.role === 'Sales') {
          navigate('/pos');
        } else {
          navigate('/');
        }
      }, 800);
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل تسجيل الدخول';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', registerForm);
      const data = res.data.data;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data));
      
      showSuccess('تم إنشاء الحساب بنجاح! 🎉');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'فشل إنشاء الحساب';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4 py-8">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-brand-main text-brand-sand rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            ❧
          </div>
          <h1 className="text-2xl font-bold text-brand-dark">Vedra</h1>
          <p className="text-xs text-gray-500 tracking-widest font-bold">LANDSCAPE & GREEN SPACES</p>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition ${
              tab === 'login' ? 'bg-white text-brand-dark shadow' : 'text-gray-500'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition ${
              tab === 'register' ? 'bg-white text-brand-dark shadow' : 'text-gray-500'
            }`}
          >
            حساب جديد
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">البريد / الهاتف</label>
              <input
                type="text"
                className="input-field"
                value={loginForm.emailOrPhone}
                onChange={(e) => setLoginForm({ ...loginForm, emailOrPhone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">كلمة المرور</label>
              <input
                type="password"
                className="input-field"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-4 py-3">
              {loading ? 'جاري الدخول...' : 'دخول'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">الاسم الكامل</label>
              <input
                type="text"
                className="input-field"
                value={registerForm.fullName}
                onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                className="input-field"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">رقم الهاتف</label>
              <input
                type="tel"
                className="input-field"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">كلمة المرور</label>
              <input
                type="password"
                className="input-field"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-4 py-3">
              {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب 🌱'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-brand-main hover:underline">
            ← رجوع للمتجر
          </Link>
        </div>
      </div>
    </div>
  );
}