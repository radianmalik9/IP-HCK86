import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../stores/authSlice';
import { cn } from '../utils/helpers';
import { logoutSuccess, showConfirm, showInfo } from '../utils/notifications';

const navItemClass = ({ isActive }) =>
  cn(
    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
    isActive ? 'bg-primary-600 text-white' : 'text-secondary-700 hover:bg-secondary-100'
  );

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  
  const requireLogin = async (nextPath) => {
    const res = await showConfirm('Butuh Login', 'Silakan login untuk mengakses fitur ini.', 'Login', 'Batal');
    if (res.isConfirmed) navigate(`/login`, { state: { from: nextPath } });
  };

  const handleLogout = async () => {
    const result = await showConfirm(
      'Logout Confirmation',
      'Are you sure you want to logout?',
      'Yes, Logout',
      'Cancel'
    );
    
    if (result.isConfirmed) {
      dispatch(logout());
      logoutSuccess();
      navigate('/');
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur border-b border-secondary-200">
      <div className="container-wide flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="logo" className="h-8 w-8" />
            <span className="font-semibold text-secondary-900">Smart Learning</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 ml-6">
            <NavLink to="/" className={navItemClass} end>
              Home
            </NavLink>
            <NavLink to="/courses" className={navItemClass}>
              Courses
            </NavLink>
            {isAuthenticated ? (
              <NavLink to="/my-learning" className={navItemClass}>My Learning</NavLink>
            ) : (
              <button className={navItemClass({ isActive: false })} onClick={() => requireLogin('/my-learning')}>My Learning</button>
            )}
            {isAuthenticated ? (
              <NavLink to="/ai" className={navItemClass}>AI Assistant</NavLink>
            ) : (
              <button className={navItemClass({ isActive: false })} onClick={() => requireLogin('/ai')}>AI Assistant</button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink to="/profile" className={navItemClass}>Profile</NavLink>
              <button onClick={handleLogout} className="btn-secondary">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
