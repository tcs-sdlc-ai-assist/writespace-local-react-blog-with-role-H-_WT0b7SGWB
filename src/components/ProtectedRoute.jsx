import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import { getSession } from '../utils/auth.js';

/**
 * Route guard component.
 * Checks session in localStorage via getSession().
 * Redirects unauthenticated users to /login.
 * If role prop is 'admin' and user is not admin, redirects to /blogs.
 * Wraps children or renders Outlet.
 * @param {{ role?: 'admin'|'user', children?: React.ReactNode }} props
 * @returns {JSX.Element}
 */
function ProtectedRoute({ role, children }) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'admin' && session.role !== 'admin') {
    return <Navigate to="/blogs" replace />;
  }

  return children ? children : <Outlet />;
}

ProtectedRoute.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']),
  children: PropTypes.node,
};

ProtectedRoute.defaultProps = {
  role: undefined,
  children: undefined,
};

export default ProtectedRoute;