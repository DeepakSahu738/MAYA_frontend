import { FaFacebook, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import React from 'react';
export default function Footer() {
  return (
    <footer className="bottom-0 w-full left-0 bg-gray-50 text-gray-600 py-10 px-4">
      <div className="text-center space-y-6">
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Features</a>
          <a href="#" className="hover:underline">Pricing</a>
          <a href="#" className="hover:underline">Support</a>
          <a href="#" className="hover:underline">Contact</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
        </div>

        <div className="flex justify-center gap-6">
          <a href="#" className="hover:text-blue-500">
            <FaFacebook className="h-5 w-5" />
          </a>
          <a href="#" className="hover:text-pink-500">
            <FaInstagram className="h-5 w-5" />
          </a>
          <a href="#" className="hover:text-blue-400">
            <FaXTwitter className="h-5 w-5" />
          </a>
        </div>

        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} MAYA, Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
