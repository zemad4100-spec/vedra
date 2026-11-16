import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/users')
      .then(res => setUsers(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-brand-dark mb-6">👥 المستخدمين</h1>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-right text-xs font-bold text-gray-500">#</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الاسم</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">البريد الإلكتروني</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الهاتف</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الدور</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الحالة</th>
              <th className="p-4 text-right text-xs font-bold text-gray-500">الطلبات</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-4 text-sm">{u.id}</td>
                <td className="p-4 text-sm font-bold">{u.fullName}</td>
                <td className="p-4 text-sm text-gray-600">{u.email}</td>
                <td className="p-4 text-sm text-gray-600">{u.phone}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    u.role === 'Admin' ? 'bg-red-100 text-red-700' : 
                    u.role === 'Customer' ? 'bg-green-100 text-green-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {u.isActive ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                <td className="p-4 text-sm font-bold">{u.orderCount}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">لا يوجد مستخدمين</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}