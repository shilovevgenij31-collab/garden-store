import { useState, useCallback, useEffect } from "react";
import AdminAuth from "./AdminAuth";
import { getAdminToken, clearAdminToken } from "@/api/admin";
import { Package, ShoppingCart, LogOut, Leaf } from "lucide-react";

export type AdminTab = "products" | "orders";

interface AdminLayoutProps {
  children: (tab: AdminTab) => React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [authenticated, setAuthenticated] = useState(
    () => !!getAdminToken()
  );
  const [tab, setTab] = useState<AdminTab>("products");

  const handleLogout = useCallback(() => {
    clearAdminToken();
    setAuthenticated(false);
  }, []);

  useEffect(() => {
    const handleExpired = () => {
      clearAdminToken();
      setAuthenticated(false);
    };
    window.addEventListener('admin-session-expired', handleExpired);
    return () => window.removeEventListener('admin-session-expired', handleExpired);
  }, []);

  if (!authenticated) {
    return <AdminAuth onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-cream)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(251, 248, 243, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 20px rgba(61, 50, 37, 0.08)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "var(--olive)" }}
              >
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-lg font-bold"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "var(--olive-dark)",
                  }}
                >
                  Всё в сад
                </span>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "var(--bg-beige)",
                    color: "var(--text-light)",
                  }}
                >
                  Админ
                </span>
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex items-center gap-1">
              <button
                onClick={() => setTab("products")}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background:
                    tab === "products" ? "var(--olive)" : "transparent",
                  color: tab === "products" ? "var(--white)" : "var(--text-body)",
                }}
              >
                <Package className="w-4 h-4" />
                Товары
              </button>
              <button
                onClick={() => setTab("orders")}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background:
                    tab === "orders" ? "var(--olive)" : "transparent",
                  color: tab === "orders" ? "var(--white)" : "var(--text-body)",
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                Заказы
              </button>
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{ color: "var(--text-light)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--accent-rose)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-light)")
              }
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children(tab)}
      </main>
    </div>
  );
}
