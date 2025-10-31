import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-blue-100 via-blue-50 to-gray-50 border-t border-blue-200 shadow-inner px-4 py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <h2 className="text-xl font-extrabold text-blue-700">CharuVerse</h2>
          <p className="text-sm text-blue-500">Connecting alumni worldwide</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebook className="text-2xl text-blue-600 hover:text-blue-800 transition" />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter className="text-2xl text-blue-600 hover:text-blue-800 transition" />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram className="text-2xl text-blue-600 hover:text-blue-800 transition" />
          </a>
        </div>
      </div>
      <hr className="my-6 border-blue-200" />
      <div className="text-center text-sm text-blue-700">
        <p>&copy; {new Date().getFullYear()} CharuVerse. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;