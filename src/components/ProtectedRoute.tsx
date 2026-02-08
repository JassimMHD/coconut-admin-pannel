import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/api.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

// Role hierarchy for permission checking
const roleHierarchy: Record<UserRole, number> = {
  VIEWER: 1,
  OPERATOR: 2,
  ACCOUNTANT: 3,
  MANAGER: 4,
  ADMIN: 5,
  SUPER_ADMIN: 6,
};

export const hasRequiredRole = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  if (requiredRoles.length === 0) return true;
  
  const userLevel = roleHierarchy[userRole];
  return requiredRoles.some((role) => userLevel >= roleHierarchy[role]);
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show nothing while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  if (user && requiredRoles.length > 0 && !hasRequiredRole(user.role, requiredRoles)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
