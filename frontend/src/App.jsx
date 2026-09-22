import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import AuthPage from './AuthPage';
import DesktopFeed from './DesktopFeed';
import ProfilePage from './ProfilePage';
import AdminDashboard from './AdminDashboard';
import BulletinBoard from './BulletinBoard';

// Role-Based Protection Guard
const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) return <Navigate to="/" replace />;
    
    // If Admin attempts to view student feed, redirect to admin dashboard, or if user lacks permissions
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'college_admin') return <Navigate to="/admin" replace />;
        return <Navigate to="/feed" replace />;
    }

    return children;
};

export default function App() {
    return (
        <Router>
            <Routes>
                {/* Landing page (public) */}
                <Route path="/" element={<LandingPage />} />

                {/* Auth page */}
                <Route path="/login" element={<AuthPage />} />

                {/* Universal Feed - Accessible to Student, Faculty, Alumni */}
                <Route path="/feed" element={
                    <PrivateRoute allowedRoles={['student', 'faculty', 'alumni']}>
                        <DesktopFeed />
                    </PrivateRoute>
                } />

                {/* Dedicated College Admin Dashboard */}
                <Route path="/admin" element={
                    <PrivateRoute allowedRoles={['college_admin']}>
                        <AdminDashboard />
                    </PrivateRoute>
                } />

                {/* Universal Profile & Digital Portfolio */}
                <Route path="/profile/:id" element={
                    <PrivateRoute>
                        <ProfilePage />
                    </PrivateRoute>
                } />

                {/* Bulletin Board — all authenticated roles */}
                <Route path="/bulletin" element={
                    <PrivateRoute>
                        <BulletinBoard />
                    </PrivateRoute>
                } />

                {/* Catch all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}
