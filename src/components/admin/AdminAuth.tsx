import { useState } from "react";
import { useAdminLogin } from "@/hooks/useAdmin";
import { setAdminToken } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface AdminAuthProps {
  onSuccess: () => void;
}

export default function AdminAuth({ onSuccess }: AdminAuthProps) {
  const [password, setPassword] = useState("");
  const login = useAdminLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    login.mutate(password, {
      onSuccess: (data) => {
        setAdminToken(data.token);
        onSuccess();
      },
    });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-cream)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "var(--white)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "var(--olive)" }}
          >
            <Lock className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-center text-2xl font-semibold mb-2"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "var(--text-dark)",
          }}
        >
          Панель администратора
        </h1>
        <p
          className="text-center text-sm mb-8"
          style={{ color: "var(--text-light)" }}
        >
          Введите пароль для доступа
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label
              htmlFor="password"
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--text-body)" }}
            >
              Пароль
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full h-12 text-base"
              style={{
                background: "var(--bg-cream)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--text-dark)",
              }}
            />
          </div>

          {login.isError && (
            <div
              className="mb-4 px-4 py-3 rounded-lg text-sm"
              style={{
                background: "rgba(196, 145, 122, 0.1)",
                color: "var(--accent-rose)",
                border: "1px solid rgba(196, 145, 122, 0.3)",
              }}
            >
              {login.error instanceof Error
                ? login.error.message
                : "Неверный пароль"}
            </div>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="btn btn-primary w-full justify-center"
            style={{
              opacity: login.isPending ? 0.7 : 1,
              cursor: login.isPending ? "not-allowed" : "pointer",
            }}
          >
            {login.isPending ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
}
