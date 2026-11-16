import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import StoreLayout from './layouts/StoreLayout';
import AdminLayout from './layouts/AdminLayout';
import StoreHome from './pages/StoreHome';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import DesignRequest from './pages/DesignRequest';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetails from './pages/AdminOrderDetails';
import AdminProducts from './pages/AdminProducts';
import AdminInventory from './pages/AdminInventory';
import AdminSuppliers from './pages/AdminSuppliers';
import AdminPurchaseInvoices from './pages/AdminPurchaseInvoices';
import AdminPurchaseInvoiceNew from './pages/AdminPurchaseInvoiceNew';
import AdminPurchaseInvoiceDetails from './pages/AdminPurchaseInvoiceDetails';
import AdminExpenses from './pages/AdminExpenses';
import AdminReports from './pages/AdminReports';
import AdminUsers from './pages/AdminUsers';
import AdminCustomers from './pages/AdminCustomers';
import POSPage from './pages/POSPage';
import Login from './pages/Login';

function RequireAuth({ children, roles }) {
  const token = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#153826',
            color: '#fff',
            fontFamily: 'Cairo, sans-serif',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
          },
          success: {
            iconTheme: {
              primary: '#e6dccb',
              secondary: '#153826',
            },
          },
          error: {
            style: {
              background: '#c0392b',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#c0392b',
            },
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />

        {/* المتجر */}
        <Route path="/" element={<StoreLayout />}>
          <Route index element={<StoreHome />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="orders" element={<MyOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="design" element={<DesignRequest />} />
        </Route>

        {/* لوحة التحكم + POS */}
        <Route
          path="/admin"
          element={
            <RequireAuth roles={['Admin', 'StoreManager', 'Sales']}>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="suppliers" element={<AdminSuppliers />} />
          <Route path="purchase-invoices" element={<AdminPurchaseInvoices />} />
          <Route path="purchase-invoices/new" element={<AdminPurchaseInvoiceNew />} />
          <Route path="purchase-invoices/:id" element={<AdminPurchaseInvoiceDetails />} />
          <Route path="expenses" element={<AdminExpenses />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="pos" element={<POSPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;