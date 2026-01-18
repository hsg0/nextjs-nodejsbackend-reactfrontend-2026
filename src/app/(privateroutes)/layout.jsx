// src/app/(privateroutes)/layout.jsx

import AuthCheck from "../../components/authCheck/AuthCheck.jsx";
import PrivateNavbar from "../../components/PrivateNavbar.jsx";

export default function PrivateLayout({ children }) {
  return (
    <AuthCheck>
      <div className="min-h-screen bg-[#0B0B10] text-white">
        <PrivateNavbar />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </AuthCheck>
  );
}