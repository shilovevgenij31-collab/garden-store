import { useState } from "react";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useAdmin";
import type { ProductRead } from "@/api/products";
import ProductForm from "./ProductForm";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ProductsTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useAdminProducts(page);
  const deleteMutation = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRead | null>(null);

  const handleEdit = (product: ProductRead) => {
    setEditProduct(product);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditProduct(null);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Товар деактивирован");
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast.error(err.message || "Ошибка удаления");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="w-10 h-10 rounded-full border-3 animate-spin"
          style={{
            borderColor: "var(--bg-beige)",
            borderTopColor: "var(--olive)",
            borderWidth: "3px",
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
          {error instanceof Error ? error.message : "Не удалось загрузить товары"}
        </p>
      </div>
    );
  }

  const products = data?.items || [];
  const totalPages = data?.pages || 1;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-2xl font-semibold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--text-dark)",
            }}
          >
            Товары
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-light)" }}>
            {data?.total || 0} товаров в базе
          </p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Добавить товар
        </button>
      </div>

      {products.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl"
          style={{
            background: "var(--white)",
            boxShadow: "var(--shadow)",
            color: "var(--text-light)",
          }}
        >
          <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium mb-1">Нет товаров</p>
          <p className="text-sm">Добавьте первый товар</p>
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
                  <th
                    className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-light)" }}
                  >
                    Товар
                  </th>
                  <th
                    className="text-left px-5 py-4 text-xs font-semibold uppercase tracking-wider hidden md:table-cell"
                    style={{ color: "var(--text-light)" }}
                  >
                    Категория
                  </th>
                  <th
                    className="text-right px-5 py-4 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-light)" }}
                  >
                    Цена
                  </th>
                  <th
                    className="text-center px-5 py-4 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell"
                    style={{ color: "var(--text-light)" }}
                  >
                    Наличие
                  </th>
                  <th
                    className="text-center px-5 py-4 text-xs font-semibold uppercase tracking-wider hidden sm:table-cell"
                    style={{ color: "var(--text-light)" }}
                  >
                    Статус
                  </th>
                  <th className="px-5 py-4 w-24" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg-cream)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Product info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                          style={{ border: "1px solid var(--border)" }}
                        />
                        <span
                          className="font-medium text-sm"
                          style={{ color: "var(--text-dark)" }}
                        >
                          {product.name}
                        </span>
                      </div>
                    </td>
                    {/* Category */}
                    <td
                      className="px-5 py-4 text-sm hidden md:table-cell"
                      style={{ color: "var(--text-light)" }}
                    >
                      {product.category?.name || "—"}
                    </td>
                    {/* Price */}
                    <td
                      className="px-5 py-4 text-right text-sm font-semibold"
                      style={{ color: "var(--olive)" }}
                    >
                      {Number(product.price).toLocaleString("ru-RU")} ₽
                    </td>
                    {/* In stock */}
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                        style={
                          product.in_stock
                            ? {
                                background: "rgba(92, 107, 60, 0.1)",
                                color: "var(--olive)",
                              }
                            : {
                                background: "rgba(196, 145, 122, 0.1)",
                                color: "var(--accent-rose)",
                              }
                        }
                      >
                        {product.in_stock ? "В наличии" : "Нет в наличии"}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                        style={
                          product.is_active
                            ? {
                                background: "rgba(92, 107, 60, 0.1)",
                                color: "var(--olive)",
                              }
                            : {
                                background: "var(--bg-beige)",
                                color: "var(--text-light)",
                              }
                        }
                      >
                        {product.is_active ? "Активен" : "Неактивен"}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(product)}
                          title="Редактировать"
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                          style={{
                            color: "var(--text-light)",
                            background: "transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--bg-beige)";
                            e.currentTarget.style.color = "var(--olive)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--text-light)";
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          title="Деактивировать"
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                          style={{
                            color: "var(--text-light)",
                            background: "transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(196, 145, 122, 0.1)";
                            e.currentTarget.style.color = "var(--accent-rose)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--text-light)";
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

      {/* Product Form Dialog */}
      <ProductForm
        key={editProduct ? `edit-${editProduct.id}` : "create"}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditProduct(null);
        }}
        product={editProduct}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <>
          <div
            className="modal-overlay active"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="account-modal active" style={{ zIndex: 2001 }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.3rem",
                color: "var(--text-dark)",
                textAlign: "center",
                marginBottom: "12px",
              }}
            >
              Деактивировать товар?
            </h3>
            <p
              className="text-center text-sm mb-6"
              style={{ color: "var(--text-body)", lineHeight: 1.6 }}
            >
              Товар &laquo;{deleteTarget.name}&raquo; будет скрыт из каталога.
              Это действие можно отменить.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn btn-outline flex-1 justify-center"
              >
                Отмена
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn flex-1 justify-center"
                style={{
                  background: "var(--accent-rose)",
                  color: "var(--white)",
                  opacity: deleteMutation.isPending ? 0.7 : 1,
                }}
              >
                {deleteMutation.isPending ? "Удаление..." : "Деактивировать"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Package(props: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
