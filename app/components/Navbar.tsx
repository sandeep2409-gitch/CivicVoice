"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
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
    { href: "/feed", label: "Search", icon: Search, show: true }, // Using Feed as Search/Explore equivalent
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
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[244px] border-r border-card-border bg-background px-3 py-6 z-50">
        {/* Logo */}
        <Link href="/" className="mb-10 px-3 flex items-center">
          <img src="/logo.png" alt="Citizen Voice Logo" className="h-20 w-auto" />
        </Link>

        {/* Links */}
        <div className="flex-1 flex flex-col gap-2">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-3 py-3 rounded-lg text-[15px] transition-all duration-200 group ${
                    isActive ? "font-bold" : "font-normal hover:bg-black/5"
                  }`}
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    className="transition-transform group-hover:scale-105"
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}

          {/* Profile link */}
          <Link
            href={profileHref}
            className="flex items-center gap-4 px-3 py-3 rounded-lg text-[15px] font-normal hover:bg-black/5 transition-all duration-200 group"
          >
            {user ? (
              <div className="w-6 h-6 rounded-full bg-accent-blue text-white flex items-center justify-center text-[10px] font-bold overflow-hidden transition-transform group-hover:scale-105">
                {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
              </div>
            ) : (
              <UserIcon size={24} strokeWidth={1.5} className="transition-transform group-hover:scale-105" />
            )}
            <span>Profile</span>
          </Link>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto px-3">
          {loading ? (
            <div className="h-10 rounded-lg bg-gray-200 animate-pulse" />
          ) : user ? (
            <button
              onClick={() => logout()}
              className="flex items-center gap-4 w-full py-3 text-[15px] text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut size={24} strokeWidth={1.5} />
              <span>Log out</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-4 w-full py-3 text-[15px] text-foreground hover:bg-black/5 rounded-lg transition-all group"
            >
              <LogIn size={24} strokeWidth={1.5} className="transition-transform group-hover:scale-105" />
              <span>Log in</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] border-t border-card-border bg-background flex justify-around items-center z-50 px-2 pb-safe">
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center p-2"
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={isActive ? "text-foreground" : "text-gray-500"}
                />
              </Link>
            );
          })}
          
        <Link href={profileHref} className="flex items-center justify-center p-2">
          {user ? (
            <div className="w-6 h-6 rounded-full bg-accent-blue text-white flex items-center justify-center text-[10px] font-bold">
              {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
            </div>
          ) : (
            <UserIcon size={24} strokeWidth={1.5} className="text-gray-500" />
          )}
        </Link>
      </nav>
    </>
  );
}
