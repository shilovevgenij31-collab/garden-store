import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/context/CartContext";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { toast } from "sonner";

const checkoutSchema = z.object({
  customer_name: z.string().min(1, "Введите имя"),
  customer_phone: z
    .string()
    .min(1, "Введите телефон")
    .regex(/^(\+7|8)\d{10}$/, "Формат: +7XXXXXXXXXX или 8XXXXXXXXXX"),
  customer_email: z
    .string()
    .email("Некорректный email")
    .or(z.literal(""))
    .optional(),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function CheckoutForm({ onBack, onSuccess }: CheckoutFormProps) {
  const { items, totalCount, totalPrice, clearCart } = useCart();
  const { mutate, isPending } = useCreateOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name: "",
      customer_phone: "",
      customer_email: "",
      notes: "",
    },
  });

  const onSubmit = (data: CheckoutFormData) => {
    const orderData = {
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email || undefined,
      notes: data.notes || undefined,
      items: items.map((item) => ({
        product_id: item.product.id,
        quantity: item.qty,
      })),
    };

    mutate(orderData, {
      onSuccess: () => {
        clearCart();
        toast.success("Заказ успешно оформлен!", {
          description: "Мы свяжемся с вами в ближайшее время",
        });
        onSuccess();
      },
      onError: (error) => {
        toast.error("Ошибка при оформлении заказа", {
          description: error.message || "Попробуйте ещё раз",
        });
      },
    });
  };

  return (
    <div className="checkout-form">
      <div className="checkout-back" onClick={onBack}>
        ← Назад к корзине
      </div>
      <h3 className="checkout-title">Оформление заказа</h3>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Имя *</label>
          <input
            type="text"
            placeholder="Ваше имя"
            {...register("customer_name")}
            className={errors.customer_name ? "input-error" : ""}
          />
          {errors.customer_name && (
            <span className="form-error">{errors.customer_name.message}</span>
          )}
        </div>

        <div className="form-group">
          <label>Телефон *</label>
          <input
            type="tel"
            placeholder="+7XXXXXXXXXX"
            {...register("customer_phone")}
            className={errors.customer_phone ? "input-error" : ""}
          />
          {errors.customer_phone && (
            <span className="form-error">{errors.customer_phone.message}</span>
          )}
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="example@mail.ru"
            {...register("customer_email")}
            className={errors.customer_email ? "input-error" : ""}
          />
          {errors.customer_email && (
            <span className="form-error">{errors.customer_email.message}</span>
          )}
        </div>

        <div className="form-group">
          <label>Комментарий к заказу</label>
          <textarea
            placeholder="Пожелания к заказу..."
            rows={3}
            {...register("notes")}
          />
        </div>

        <div className="checkout-summary">
          <div className="checkout-summary-row">
            <span>Товаров:</span>
            <span>{totalCount} шт.</span>
          </div>
          <div className="checkout-summary-row checkout-summary-total">
            <span>Итого:</span>
            <span>{totalPrice.toLocaleString("ru-RU")} ₽</span>
          </div>
        </div>

        <button
          type="submit"
          className="btn-checkout"
          disabled={isPending}
        >
          {isPending ? "Оформляем..." : "Подтвердить заказ"}
        </button>
      </form>
    </div>
  );
}
