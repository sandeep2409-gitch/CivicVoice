"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { getUserEmoji } from "@/lib/utils";
import {
  Home,
  PlusSquare,
  Search,
  LayoutDashboard,
  Shield,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, loading, logout } = useAuth();

  // Don't show navbar on login pages
  if (pathname === "/login" || pathname === "/admin/login") {
    return null;
  }

  const navItems = [
    { href: "/", label: "Home", icon: Home, show: true },
    { href: "/feed", label: "Search", icon: Search, show: true },
    { href: "/report", label: "Create", icon: PlusSquare, show: !!user },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: role === "admin",
    },
    {
      href: "/admin",
      label: "Admin",
      icon: Shield,
      show: role === "admin",
    },
  ];

  const profileHref = user ? "/profile" : "/login";

  return (
    <>
      {/* Desktop Top Nav */}
      <nav className="hidden md:flex fixed top-0 left-0 w-full h-[72px] border-b border-card-border bg-background z-50">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Citizen Voice Logo" className="h-10 w-auto" />
          </Link>

          {/* Links */}
          <div className="flex items-center gap-1">
            {navItems
              .filter((item) => item.show)
              .map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                      isActive ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

            <div className="w-px h-6 bg-gray-200 mx-2"></div>

            {/* Profile link */}
            <Link
              href={profileHref}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-all"
            >
              {user ? (
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-lg shadow-sm border border-blue-100">
                  {getUserEmoji(user.uid || user.email || "")}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                  <UserIcon size={18} />
                </div>
              )}
              <span>Profile</span>
            </Link>

            {/* Login / Logout */}
            {!loading && (
              user ? (
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all ml-1"
                >
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-accent-blue hover:bg-blue-600 transition-all ml-2"
                >
                  <LogIn size={18} />
                  <span>Log in</span>
                </Link>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[60px] border-t border-card-border bg-background flex justify-around items-center z-50 px-2 pb-safe">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center p-3"
              >
                <Icon
                  size={26}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? "text-gray-900" : "text-gray-500"}
                />
              </Link>
            );
          })}
          
        <Link href={profileHref} className="flex items-center justify-center p-3 relative">
          {user ? (
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-sm shadow-sm border border-blue-100">
              {getUserEmoji(user.uid || user.email || "")}
            </div>
          ) : (
            <UserIcon size={26} strokeWidth={1.5} className={pathname === profileHref ? "text-gray-900" : "text-gray-500"} />
          )}
        </Link>

        {/* Login/Logout next to profile on mobile */}
        {!loading && (
          user ? (
            <button onClick={() => logout()} className="flex items-center justify-center p-3">
              <LogOut size={26} strokeWidth={1.5} className="text-gray-500" />
            </button>
          ) : (
            <Link href="/login" className="flex items-center justify-center p-3">
              <LogIn size={26} strokeWidth={1.5} className="text-gray-500" />
            </Link>
          )
        )}
      </nav>
    </>
  );
}
