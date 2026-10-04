"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutGrid, 
  User, 
  Dumbbell, 
  LineChart, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { logout } from "@/api/auth";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setTimeout(() => setIsMobileMenuOpen(false), 0);
  }, [pathname]);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutGrid size={20} /> },
    { label: "Exercises", href: "/dashboard/exercises", icon: <Dumbbell size={20} /> },
    { label: "Progress", href: "/dashboard/progress", icon: <LineChart size={20} /> },
    { label: "Profile", href: "/dashboard/profile", icon: <User size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#f6fbf5] text-[#1F2421] font-sans selection:bg-[#FFDADA] selection:text-[#a7354b]">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-black/5 bg-[#f6fbf5]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF788D] flex items-center justify-center text-white">
            <span className="text-lg font-black">F</span>
          </div>
          <span className="font-bold text-lg tracking-tight text-[#FF788D]">PulseFit</span>
        </div>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-[#FFDADA] text-[#a7354b] shadow-sm"
                    : "text-[#606863] hover:text-[#1F2421] hover:bg-black/5"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#606863] hover:text-[#a7354b] transition"
          >
            <LogOut size={18} />
            Logout
          </button>
          
          {/* Mobile menu toggle */}
          <button 
            className="md:hidden text-[#1F2421]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] bg-[#f6fbf5] z-30 p-4 border-b border-black/5 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-4 rounded-2xl text-base font-semibold transition ${
                  isActive 
                    ? "bg-[#FFDADA] text-[#a7354b]" 
                    : "bg-white border border-black/5 text-[#1F2421]"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-4 rounded-2xl text-base font-semibold bg-white border border-black/5 text-[#a7354b] mt-auto"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="pb-24 md:pb-0">
        {children}
      </div>

      {/* Mobile Bottom Navigation (Optional, keeping top menu but bottom tab bar is good) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 p-2 flex justify-around items-center z-40 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors ${
                isActive ? "text-[#FF788D]" : "text-[#606863]"
              }`}
            >
              {item.icon}
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
