import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-secondary-200 bg-white">
      <div className="container-wide py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="logo" className="h-6 w-6" />
          <span className="text-secondary-700">Smart Learning Platform</span>
        </div>
        <p className="text-sm text-secondary-500">© {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </footer>
  );
}
