"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error('Failed to logout');
      
      // Redirect to login page
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      {/* Header with hamburger and menu text */}
      <div className={`fixed top-0 left-0 w-64 h-16 bg-white dark:bg-gray-800 shadow-sm z-50 flex items-center px-4 transition-all duration-300 ${
        !isOpen ? 'bg-transparent dark:bg-transparent shadow-none border-none outline-none' : ''
      }`}>
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
            !isOpen ? 'border-none outline-none' : ''
          }`}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h2 className="text-xl font-bold ml-4">Menu</h2>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 pt-16">
          <nav className="space-y-2">
            <Link
              href="/chat"
              className={`block px-4 py-2 rounded-md ${
                isActive('/chat')
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={toggleSidebar}
            >
              Chat
            </Link>
            <Link
              href="/conversations"
              className={`block px-4 py-2 rounded-md ${
                isActive('/conversations')
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={toggleSidebar}
            >
              Conversations
            </Link>
            <Link
              href="/profile"
              className={`block px-4 py-2 rounded-md ${
                isActive('/profile')
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={toggleSidebar}
            >
              Profile
            </Link>
            <div className="pt-4 mt-4 border-t dark:border-gray-700">
              <button
                onClick={() => {
                  handleLogout();
                  toggleSidebar();
                }}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
} 