import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function AdminPurchaseInvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/purchase-invoices/${id}`)
      .then(res => setInvoice(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>;
  if (!invoice) return <div className="text-center py-20 text-red-600">الفاتورة غير موجودة</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate('/admin/purchase-invoices')}
          className="bg-gray-200 px-4 py-2 rounded-xl font-bold hover:bg-gray-300"
        >
          ← رجوع للفواتير
        </button>
        <button
          onClick={handlePrint}
          className="bg-brand-main text-white px-6 py-2 rounded-xl font-bold hover:bg-brand-dark"
        >
          🖨️ طباعة
        </button>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm print:shadow-none">
        <div className="flex justify-between items-start border-b-2 border-brand-dark pb-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 bg-brand-dark text-brand-sand rounded-xl flex items-center justify-center text-3xl font-serif">
                ❧
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-brand-dark">Vedra</h1>
                <p className="text-xs text-gray-500 tracking-widest font-bold">PURCHASE INVOICE</p>
              </div>
            </div>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-bold text-brand-dark mb-2">فاتورة شراء</h2>
            <p className="text-sm"><strong>رقم الفاتورة:</strong> {invoice.poNumber}</p>
            <p className="text-sm"><strong>التاريخ:</strong> {new Date(invoice.orderDate).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-bold text-brand-dark mb-2">بيانات المورد</h3>
            <p className="text-sm font-bold">{invoice.supplierName}</p>
            {invoice.supplierPhone && <p className="text-sm">📞 {invoice.supplierPhone}</p>}
            {invoice.supplierAddress && <p className="text-sm">📍 {invoice.supplierAddress}</p>}
          </div>
        </div>

        <table className="w-full mb-8">
          <thead className="bg-brand-dark text-white">
            <tr>
              <th className="p-3 text-right text-sm">#</th>
              <th className="p-3 text-right text-sm">المنتج</th>
              <th className="p-3 text-right text-sm">الكود</th>
              <th className="p-3 text-right text-sm">الكمية</th>
              <th className="p-3 text-right text-sm">التكلفة</th>
              <th className="p-3 text-right text-sm">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="p-3 text-sm">{idx + 1}</td>
                <td className="p-3 text-sm">{item.productNameAr}</td>
                <td className="p-3 text-sm text-gray-500">{item.sku}</td>
                <td className="p-3 text-sm">{item.quantity}</td>
                <td className="p-3 text-sm">{item.unitCost?.toLocaleString()} ج.م</td>
                <td className="p-3 text-sm font-bold">{item.lineTotal?.toLocaleString()} ج.م</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-sm">
              <span>المجموع الفرعي:</span>
              <span className="font-bold">{invoice.subTotal?.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>الضريبة:</span>
              <span className="font-bold">{invoice.taxAmount?.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>الشحن:</span>
              <span className="font-bold">{invoice.shippingCost?.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-brand-dark border-t-2 border-brand-dark pt-2">
              <span>الإجمالي:</span>
              <span>{invoice.totalAmount?.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>المدفوع:</span>
              <span className="font-bold">{invoice.paidAmount?.toLocaleString()} ج.م</span>
            </div>
            <div className="flex justify-between text-sm text-red-600">
              <span>المتبقي:</span>
              <span className="font-bold">{invoice.remainingAmount?.toLocaleString()} ج.م</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="font-bold text-brand-dark mb-2">ملاحظات:</h4>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}

        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Vedra — نظام إدارة المشتريات</p>
        </div>
      </div>
    </div>
  );
}