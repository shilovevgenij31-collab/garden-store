import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, ShoppingCart, Leaf } from "lucide-react";
import { useScrollEffect } from "@/hooks/useScrollEffect";
import { useCart } from "@/context/CartContext";
import { fetchOrdersByContact, type OrderRead } from "@/api/orders";
import CheckoutForm from "@/components/CheckoutForm";

const navLinks = [
  { href: "/#about", label: "О нас" },
  { href: "/#catalog", label: "Каталог" },
  { href: "/#advantages", label: "Преимущества" },
  { href: "/#reviews", label: "Отзывы" },
  { href: "/#contacts", label: "Контакты" },
  { href: "/#how-order", label: "Как заказать" },
];

export default function Header() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  /* Account / orders lookup state */
  const [contactInput, setContactInput] = useState("");
  const [orders, setOrders] = useState<OrderRead[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const { items, totalCount, totalPrice, changeQty, removeFromCart } = useCart();

  useScrollEffect("header", "scrolled", 60);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const openCart = useCallback(() => {
    setCartOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeCart = useCallback(() => {
    setCartOpen(false);
    setShowCheckout(false);
    document.body.style.overflow = "";
  }, []);

  const openAccount = useCallback(() => {
    setAccountOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  const closeAccount = useCallback(() => {
    setAccountOpen(false);
    document.body.style.overflow = "";
    setOrders(null);
    setOrdersError("");
  }, []);

  const handleFindOrders = useCallback(async () => {
    const value = contactInput.trim();
    if (!value) return;
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const isEmail = value.includes("@");
      const result = await fetchOrdersByContact(
        isEmail ? value : undefined,
        isEmail ? undefined : value
      );
      setOrders(result);
    } catch {
      setOrdersError("Не удалось загрузить заказы");
    } finally {
      setOrdersLoading(false);
    }
  }, [contactInput]);

  const toggleMobileNav = useCallback(() => {
    setMobileNavOpen((prev) => !prev);
  }, []);

  const hasItems = items.length > 0;

  return (
    <>
      {/* HEADER */}
      <header className="header" id="header">
        <div className="container">
          <Link to="/" className="logo">
            <img src="/images/logo2.png" alt="Все в сад" />
            Все в <span>сад</span>
          </Link>
          <nav className="nav-links">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className="header-icon"
              onClick={openAccount}
              title="Личный кабинет"
            >
              <User size={20} />
            </button>
            <button
              className="header-icon"
              onClick={openCart}
              title="Корзина"
            >
              <ShoppingCart size={20} />
              <span className={`cart-count${totalCount === 0 ? " hidden" : ""}`}>
                {totalCount}
              </span>
            </button>
            <button
              className={`burger${mobileNavOpen ? " active" : ""}`}
              onClick={toggleMobileNav}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV */}
      <nav className={`mobile-nav${mobileNavOpen ? " active" : ""}`}>
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMobileNav}>
            {link.label}
          </a>
        ))}
      </nav>

      {/* OVERLAY */}
      <div
        className={`modal-overlay${cartOpen || mobileNavOpen || accountOpen ? " active" : ""}`}
        onClick={() => {
          if (cartOpen) closeCart();
          if (mobileNavOpen) closeMobileNav();
          if (accountOpen) closeAccount();
        }}
      ></div>

      {/* CART PANEL */}
      <div className={`cart-panel${cartOpen ? " active" : ""}`}>
        <div className="cart-header">
          <h3>{showCheckout ? "Оформление" : "Корзина предзаказа"}</h3>
          <button className="cart-close" onClick={closeCart}>
            ✕
          </button>
        </div>

        {showCheckout ? (
          <div className="cart-items">
            <CheckoutForm
              onBack={() => setShowCheckout(false)}
              onSuccess={closeCart}
            />
          </div>
        ) : (
          <>
            <div className="cart-items">
              {!hasItems && (
                <div className="cart-empty">
                  <div className="cart-empty-icon"><Leaf size={40} /></div>
                  <p>Корзина пуста</p>
                  <p style={{ fontSize: ".85rem", marginTop: "8px" }}>
                    Добавьте товары из каталога
                  </p>
                </div>
              )}
              {items.map((item) => (
                <div key={item.product.id} className="cart-item">
                  <div className="cart-item-img">
                    <img src={item.product.image_url} alt={item.product.name} />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.product.name}</div>
                    <div className="cart-item-price">
                      {Number(item.product.price).toLocaleString("ru-RU")} ₽
                    </div>
                    <div className="cart-item-qty">
                      <button
                        className="qty-btn"
                        onClick={() => changeQty(item.product.id, -1)}
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        className="qty-btn"
                        onClick={() => changeQty(item.product.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.product.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {hasItems && (
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Итого:</span>
                  <span>{totalPrice.toLocaleString("ru-RU")} ₽</span>
                </div>
                <button
                  className="btn-checkout"
                  onClick={() => setShowCheckout(true)}
                >
                  Оформить предзаказ
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ACCOUNT MODAL */}
      <div
        className={`modal-overlay${accountOpen ? " active" : ""}`}
        onClick={closeAccount}
      ></div>
      <div className={`account-modal${accountOpen ? " active" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Мои заказы</h3>
          <button className="cart-close" onClick={closeAccount}>✕</button>
        </div>

        {/* Search form */}
        {!orders && !ordersLoading && (
          <>
            <div className="form-group">
              <label>Email или телефон</label>
              <input
                type="text"
                placeholder="+79991234567 или email@mail.ru"
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFindOrders()}
              />
            </div>
            {ordersError && (
              <p style={{ color: "var(--accent-rose)", fontSize: ".85rem", marginBottom: "12px" }}>
                {ordersError}
              </p>
            )}
            <button
              className="btn btn-primary form-submit"
              onClick={handleFindOrders}
              disabled={!contactInput.trim()}
              style={{ opacity: contactInput.trim() ? 1 : 0.5 }}
            >
              Найти заказы
            </button>
          </>
        )}

        {/* Loading */}
        {ordersLoading && (
          <p style={{ textAlign: "center", color: "var(--text-light)", padding: "24px 0" }}>
            Поиск заказов...
          </p>
        )}

        {/* Results */}
        {orders && !ordersLoading && (
          <>
            {orders.length === 0 ? (
              <p style={{ textAlign: "center", color: "var(--text-light)", padding: "24px 0" }}>
                Заказы не найдены
              </p>
            ) : (
              <div style={{ maxHeight: "50vh", overflowY: "auto", margin: "0 -8px", padding: "0 8px" }}>
                {orders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      background: "var(--bg-cream)",
                      borderRadius: "var(--radius)",
                      padding: "16px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: ".8rem", color: "var(--text-light)" }}>
                        #{order.public_id.slice(0, 8)}
                      </span>
                      <span
                        style={{
                          fontSize: ".75rem",
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          background:
                            order.status === "completed"
                              ? "rgba(92,107,60,.1)"
                              : order.status === "cancelled" || order.status === "failed"
                              ? "rgba(196,145,122,.1)"
                              : "rgba(196,169,106,.15)",
                          color:
                            order.status === "completed"
                              ? "var(--olive)"
                              : order.status === "cancelled" || order.status === "failed"
                              ? "var(--accent-rose)"
                              : "var(--accent-gold)",
                        }}
                      >
                        {order.status === "pending" && "Ожидает"}
                        {order.status === "confirmed" && "Подтверждён"}
                        {order.status === "paid" && "Оплачен"}
                        {order.status === "ready" && "Готов"}
                        {order.status === "completed" && "Выполнен"}
                        {order.status === "cancelled" && "Отменён"}
                        {order.status === "failed" && "Ошибка"}
                      </span>
                    </div>
                    <div style={{ fontSize: ".85rem", color: "var(--text-body)", marginBottom: "8px" }}>
                      {order.items.map((item) => (
                        <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                          <span>{item.product_name}</span>
                          <span style={{ color: "var(--text-light)", flexShrink: 0, marginLeft: "8px" }}>
                            x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                      <span style={{ fontSize: ".8rem", color: "var(--text-light)" }}>
                        {new Date(order.created_at).toLocaleDateString("ru-RU")}
                      </span>
                      <span style={{ fontWeight: 600, color: "var(--olive)" }}>
                        {Number(order.total_amount).toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              className="btn btn-outline form-submit"
              onClick={() => { setOrders(null); setOrdersError(""); }}
              style={{ marginTop: "8px" }}
            >
              Назад
            </button>
          </>
        )}
      </div>
    </>
  );
}
