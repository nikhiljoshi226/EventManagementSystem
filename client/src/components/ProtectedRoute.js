import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();

  if (!userRole) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Convert both to lowercase for case-insensitive comparison
  if (allowedRoles.length > 0 && 
      !allowedRoles.some(allowedRole => 
        allowedRole.toLowerCase() === userRole.toLowerCase()
      )) {
    // Redirect to the user's dashboard if they try to access an unauthorized route
    return <Navigate to={`/${userRole.toLowerCase()}`} replace />;
  }

  return children;
};

export default ProtectedRoute;