import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Appointments from './pages/admin/Appointments';
import Clients from './pages/admin/Clients';
import AdminServices from './pages/admin/Services';
import Staff from './pages/admin/Staff';
import StaffProfile from './pages/admin/StaffProfile';
import MessagesManagement from './pages/admin/MessagesManagement';
import SystemStatus from './pages/admin/SystemStatus';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route
          path="booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="clients" element={<Clients />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="staff" element={<Staff />} />
        <Route path="staff/:id" element={<StaffProfile />} />
        <Route path="messages-management" element={<MessagesManagement />} />
        <Route path="system-status" element={<SystemStatus />} />
      </Route>
    </Routes>
  );
}

export default App;
