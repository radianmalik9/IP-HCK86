import React, { useEffect } from 'react';

export default function OAuthCallbackPage() {
  // This page intentionally does not redirect.
  // The opener window polls window.location for the ?code and will close this popup.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Menyambungkan ke Google…</h1>
        <p className="text-sm text-gray-600">Jendela ini akan menutup otomatis setelah autentikasi selesai.</p>
      </div>
    </div>
  );
}
