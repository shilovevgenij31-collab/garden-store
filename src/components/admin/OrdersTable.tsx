import { useState } from "react";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useAdmin";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  pending: "Новый",
  confirmed: "Подтверждён",
  paid: "Оплачен",
  ready: "Готов",
  completed: "Завершён",
  cancelled: "Отменён",
  failed: "Ошибка",
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  pending: { bg: "rgba(196, 169, 106, 0.15)", color: "#9A7B2B" },
  confirmed: { bg: "rgba(92, 107, 60, 0.12)", color: "var(--olive)" },
  paid: { bg: "rgba(92, 107, 60, 0.2)", color: "var(--olive-dark)" },
  ready: { bg: "rgba(92, 107, 60, 0.3)", color: "var(--olive-dark)" },
  completed: { bg: "var(--bg-beige)", color: "var(--text-light)" },
  cancelled: { bg: "rgba(196, 145, 122, 0.15)", color: "var(--accent-rose)" },
  failed: { bg: "rgba(196, 145, 122, 0.2)", color: "var(--accent-rose)" },
};

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled", "failed"],
  confirmed: ["paid", "cancelled"],
  paid: ["ready", "cancelled"],
  ready: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  failed: [],
};

export default function OrdersTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const { data, isLoading, isError, error } = useAdminOrders(
    page,
    20,
    statusFilter || undefined
  );
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatus.mutate(
      { id: orderId, status: newStatus },
      {
        onSuccess: () => toast.success("Статус обновлён"),
        onError: (err) =>
          toast.error(err.message || "Ошибка обновления статуса"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-10 h-10 rounded-full animate-spin"
          style={{
            borderWidth: "3px",
            borderStyle: "solid",
            borderColor: "var(--bg-beige)",
            borderTopColor: "var(--olive)",
          }}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="text-center py-20 px-4 rounded-2xl"
        style={{
          background: "rgba(196, 145, 122, 0.08)",
          color: "var(--accent-rose)",
        }}
      >
        <p className="text-lg font-medium mb-1">Ошибка загрузки</p>
        <p className="text-sm opacity-80">
          {error instanceof Error
            ? error.message
            : "Не удалось загрузить заказы"}
        </p>
      </div>
    );
  }

  const orders = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2
            className="text-2xl font-semibold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--text-dark)",
            }}
          >
            Заказы
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-light)" }}>
            {data?.total || 0} заказов
          </p>
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={{
            padding: "10px 16px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontSize: "0.9rem",
            background: "var(--white)",
            color: "var(--text-body)",
            cursor: "pointer",
            minWidth: "180px",
          }}
        >
          <option value="">Все статусы</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {orders.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{
            background: "var(--white)",
            boxShadow: "var(--shadow)",
            color: "var(--text-light)",
          }}
        >
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">Нет заказов</p>
          <p className="text-sm">Заказы появятся здесь</p>
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "var(--white)",
            boxShadow: "var(--shadow)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["ID", "Клиент", "Телефон", "Сумма", "Статус", "Дата", "Действие"].map(
                    (header, i) => (
                      <th
                        key={header}
                        className={`px-5 py-4 text-xs font-semibold uppercase tracking-wider ${
                          i === 3 ? "text-right" : "text-left"
                        } ${
                          i === 2 || i === 5 ? "hidden md:table-cell" : ""
                        } ${
                          i === 6 ? "text-right" : ""
                        }`}
                        style={{ color: "var(--text-light)" }}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const transitions = STATUS_TRANSITIONS[order.status] || [];
                  const statusStyle =
                    STATUS_STYLES[order.status] || STATUS_STYLES.pending;

                  return (
                    <tr
                      key={order.id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid var(--border)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--bg-cream)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* ID */}
                      <td
                        className="px-5 py-4 text-sm"
                        style={{
                          fontFamily: "monospace",
                          color: "var(--text-light)",
                        }}
                      >
                        #{order.id}
                      </td>
                      {/* Customer */}
                      <td
                        className="px-5 py-4 text-sm font-medium"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {order.customer_name}
                      </td>
                      {/* Phone */}
                      <td
                        className="px-5 py-4 text-sm hidden md:table-cell"
                        style={{ color: "var(--text-light)" }}
                      >
                        {order.customer_phone}
                      </td>
                      {/* Total */}
                      <td
                        className="px-5 py-4 text-sm font-semibold text-right"
                        style={{ color: "var(--olive)" }}
                      >
                        {Number(order.total_amount).toLocaleString("ru-RU")} ₽
                      </td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                          style={{
                            background: statusStyle.bg,
                            color: statusStyle.color,
                          }}
                        >
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      {/* Date */}
                      <td
                        className="px-5 py-4 text-sm hidden md:table-cell whitespace-nowrap"
                        style={{ color: "var(--text-light)" }}
                      >
                        {new Date(order.created_at).toLocaleDateString(
                          "ru-RU",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </td>
                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        {transitions.length > 0 ? (
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleStatusChange(order.id, e.target.value);
                                e.target.value = "";
                              }
                            }}
                            defaultValue=""
                            style={{
                              padding: "6px 12px",
                              border: "1px solid var(--border)",
                              borderRadius: "var(--radius)",
                              fontSize: "0.8rem",
                              background: "var(--bg-cream)",
                              color: "var(--text-body)",
                              cursor: "pointer",
                              minWidth: "130px",
                            }}
                          >
                            <option value="" disabled>
                              Изменить...
                            </option>
                            {transitions.map((s) => (
                              <option key={s} value={s}>
                                → {STATUS_LABELS[s] || s}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-light)" }}
                          >
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn btn-outline text-sm px-5 py-2"
            style={{ opacity: page <= 1 ? 0.5 : 1 }}
          >
            Назад
          </button>
          <span className="text-sm" style={{ color: "var(--text-light)" }}>
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn btn-outline text-sm px-5 py-2"
            style={{ opacity: page >= totalPages ? 0.5 : 1 }}
          >
            Далее
          </button>
        </div>
      )}
    </div>
  );
}
