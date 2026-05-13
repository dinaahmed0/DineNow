import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, redirectTo = '/signup' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Allow access to home page, login, signup, forgot password, reset password, and change password
  const publicRoutes = [
    '/',
    '/login',
    '/signup', 
    '/forgotPassword',
    '/resetPassword',
    '/change-password',
    '/confirm-email'
  ];

  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // If user is not authenticated and trying to access a protected route, redirect to signup
  if (!isAuthenticated && !isPublicRoute) {
    // Store the attempted path for redirect after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is authenticated or accessing public route, allow access
  return <>{children}</>;
}
