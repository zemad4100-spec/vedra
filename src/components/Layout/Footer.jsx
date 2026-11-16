import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🌿</span>
              <h3 className="text-xl font-bold">مشتل أونلاين</h3>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              متجرك الأول للنباتات الطبيعية والصناعية، الأصص، والتربة. نوفر لك أفضل النباتات بأفضل الأسعار مع توصيل سريع.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="hover:text-primary-500 text-xl">📘</a>
              <a href="#" className="hover:text-primary-500 text-xl">📷</a>
              <a href="#" className="hover:text-primary-500 text-xl">🐦</a>
              <a href="#" className="hover:text-primary-500 text-xl">💬</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/about" className="hover:text-primary-500">من نحن</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500">اتصل بنا</Link></li>
              <li><Link to="/blog" className="hover:text-primary-500">المدونة</Link></li>
              <li><Link to="/faqs" className="hover:text-primary-500">الأسئلة الشائعة</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/pages/shipping-policy" className="hover:text-primary-500">سياسة الشحن</Link></li>
              <li><Link to="/pages/return-policy" className="hover:text-primary-500">سياسة الاسترجاع</Link></li>
              <li><Link to="/pages/privacy" className="hover:text-primary-500">سياسة الخصوصية</Link></li>
              <li><Link to="/pages/terms" className="hover:text-primary-500">الشروط والأحكام</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📍 القاهرة، مصر</li>
              <li>📞 01000000000</li>
              <li>✉️ info@plantstore.com</li>
              <li>🕒 السبت - الخميس: 9 ص - 9 م</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} مشتل أونلاين. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>طرق الدفع:</span>
            <span>💳</span>
            <span>💵</span>
            <span>📱</span>
          </div>
        </div>
      </div>
    </footer>
  );
}