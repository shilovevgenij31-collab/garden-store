import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCategories } from "@/hooks/useCategories";
import { useCreateProduct, useUpdateProduct } from "@/hooks/useAdmin";
import type { ProductRead } from "@/api/products";
import ImageUpload from "./ImageUpload";
import { toast } from "sonner";
import { X } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Введите название"),
  price: z.coerce.number().positive("Цена должна быть больше 0"),
  category_id: z.coerce.number().min(1, "Выберите категорию"),
  image_url: z.string().optional(),
  in_stock: z.boolean(),
});

type FormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: ProductRead | null;
}

export default function ProductForm({
  open,
  onClose,
  product,
}: ProductFormProps) {
  const isEditing = !!product;
  const { data: categories } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          price: product.price,
          category_id: product.category_id,
          image_url: product.image_url,
          in_stock: product.in_stock,
        }
      : {
          name: "",
          price: 0,
          category_id: 0,
          image_url: "",
          in_stock: true,
        },
  });

  const imageUrl = watch("image_url") || "";
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: FormValues) => {
    const data = {
      name: values.name,
      price: values.price,
      category_id: values.category_id,
      image_url: values.image_url || "/images/placeholder.jpg",
      in_stock: values.in_stock,
    };

    if (isEditing && product) {
      updateMutation.mutate(
        { id: product.id, data },
        {
          onSuccess: () => {
            toast.success("Товар обновлён");
            handleClose();
          },
          onError: (err) => {
            toast.error(err.message || "Ошибка обновления");
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Товар создан");
          handleClose();
        },
        onError: (err) => {
          toast.error(err.message || "Ошибка создания");
        },
      });
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="modal-overlay active" onClick={handleClose} />

      {/* Modal */}
      <div
        className="fixed top-1/2 left-1/2 z-[2001] w-full max-w-md max-h-[90vh] overflow-y-auto"
        style={{
          transform: "translate(-50%, -50%)",
          background: "var(--white)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: "32px",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-xl font-semibold"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "var(--text-dark)",
            }}
          >
            {isEditing ? "Редактировать товар" : "Новый товар"}
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ color: "var(--text-light)", background: "transparent" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-beige)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Name */}
          <div className="form-group">
            <label
              htmlFor="pf-name"
              style={{ color: "var(--text-body)", fontSize: "0.85rem", fontWeight: 500 }}
            >
              Название
            </label>
            <input
              id="pf-name"
              {...register("name")}
              placeholder="Название товара"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `1px solid ${errors.name ? "var(--accent-rose)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                fontSize: "0.95rem",
                background: "var(--bg-cream)",
                color: "var(--text-dark)",
                transition: "border-color 0.3s",
              }}
            />
            {errors.name && (
              <span className="form-error">{errors.name.message}</span>
            )}
          </div>

          {/* Price */}
          <div className="form-group">
            <label
              htmlFor="pf-price"
              style={{ color: "var(--text-body)", fontSize: "0.85rem", fontWeight: 500 }}
            >
              Цена (₽)
            </label>
            <input
              id="pf-price"
              type="number"
              step="0.01"
              {...register("price")}
              placeholder="0"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `1px solid ${errors.price ? "var(--accent-rose)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                fontSize: "0.95rem",
                background: "var(--bg-cream)",
                color: "var(--text-dark)",
                transition: "border-color 0.3s",
              }}
            />
            {errors.price && (
              <span className="form-error">{errors.price.message}</span>
            )}
          </div>

          {/* Category */}
          <div className="form-group">
            <label
              style={{ color: "var(--text-body)", fontSize: "0.85rem", fontWeight: 500 }}
            >
              Категория
            </label>
            <select
              value={watch("category_id") || ""}
              onChange={(e) =>
                setValue("category_id", Number(e.target.value), {
                  shouldValidate: true,
                })
              }
              style={{
                width: "100%",
                padding: "12px 16px",
                border: `1px solid ${errors.category_id ? "var(--accent-rose)" : "var(--border)"}`,
                borderRadius: "var(--radius)",
                fontSize: "0.95rem",
                background: "var(--bg-cream)",
                color: "var(--text-dark)",
                cursor: "pointer",
                appearance: "auto",
              }}
            >
              <option value="">Выберите категорию</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category_id && (
              <span className="form-error">{errors.category_id.message}</span>
            )}
          </div>

          {/* Image */}
          <div className="form-group">
            <label
              style={{
                color: "var(--text-body)",
                fontSize: "0.85rem",
                fontWeight: 500,
                display: "block",
                marginBottom: "6px",
              }}
            >
              Изображение
            </label>
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setValue("image_url", url)}
            />
          </div>

          {/* In stock */}
          <div className="form-group">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "var(--text-body)",
                fontSize: "0.95rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                {...register("in_stock")}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "var(--olive)",
                  cursor: "pointer",
                }}
              />
              В наличии
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline flex-1 justify-center"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary flex-1 justify-center"
              style={{
                opacity: isPending ? 0.7 : 1,
                cursor: isPending ? "not-allowed" : "pointer",
              }}
            >
              {isPending
                ? "Сохранение..."
                : isEditing
                ? "Сохранить"
                : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
