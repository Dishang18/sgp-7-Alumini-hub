import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import noDataIllustration from '../../assets/img/no_data.svg';
import { useEffect } from 'react';

function NotLoggedIn(props) {
  const location = useLocation();
  const next = props.redirectTo || location.pathname || '/';

  useEffect(() => {
    // If not logged in, show a toast with context
    const targetText = props.text ? ` to access ${props.text}` : '';
    toast.error(`Please log in${targetText}`);
  }, [props.text]);

  const loginLink = `/login${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  return (
    <>
      <img src={noDataIllustration} alt="No Data Illustration" className="flex items-center h-20 w-20" />
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">You're Not Logged In</h1>
        <p className="text-gray-600 mb-4">Please log in to access our {props.text || 'this'} page.</p>
        <Link to={loginLink} className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium">
          Login
        </Link>
      </div>
    </>
  );
}

export default NotLoggedIn
