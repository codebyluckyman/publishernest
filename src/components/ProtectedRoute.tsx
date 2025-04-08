
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import React from "react";

interface ProtectedRouteProps {
  element: React.ReactNode;
  children?: React.ReactNode;
}

const ProtectedRoute = ({ element, children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If element is provided, return it, otherwise return children
  return <>{element || children}</>;
};

export default ProtectedRoute;
