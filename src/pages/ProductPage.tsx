import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchProductBySlug, type ProductRead } from "@/api/products";
import { useCart } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout>>();

  /* Scroll to top on navigation */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  /* Cleanup feedback timer on unmount */
  useEffect(() => {
    return () => clearTimeout(addedTimerRef.current);
  }, []);

  const { data: product, isLoading, error } = useQuery<ProductRead>({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
  });

  function handleAdd() {
    if (!product) return;
    addToCart(product, qty);
    clearTimeout(addedTimerRef.current);
    setAdded(true);
    addedTimerRef.current = setTimeout(() => setAdded(false), 1500);
  }

  return (
    <>
      <Header />
      <main className="product-page">
        <div className="container">
          <nav className="product-breadcrumbs">
            <Link to="/">Главная</Link>
            <span>/</span>
            <a href="/#catalog">Каталог</a>
            {product && (
              <>
                <span>/</span>
                <span>{product.name}</span>
              </>
            )}
          </nav>

          {isLoading && (
            <p className="product-page-status">Загрузка...</p>
          )}

          {error && (
            <div className="product-page-status">
              <p>Товар не найден</p>
              <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
                Вернуться на главную
              </Link>
            </div>
          )}

          {product && (
            <div className="product-detail">
              <div className="product-detail-image">
                <img src={product.image_url} alt={product.name} />
                {product.badge && (
                  <span className="product-badge">{product.badge}</span>
                )}
              </div>
              <div className="product-detail-info">
                <div className="product-category">{product.category.name}</div>
                <h1 className="product-detail-name">{product.name}</h1>

                <div className="product-detail-price-row">
                  <span className="product-detail-price">
                    {Number(product.price).toLocaleString("ru-RU")} ₽
                  </span>
                  {product.old_price != null && (
                    <span className="product-price-old">
                      {Number(product.old_price).toLocaleString("ru-RU")} ₽
                    </span>
                  )}
                </div>

                <div className="product-detail-stock">
                  {product.in_stock ? "В наличии" : "Нет в наличии"}
                </div>

                {product.description && (
                  <div className="product-detail-desc">
                    <h3>Описание</h3>
                    <p>{product.description}</p>
                  </div>
                )}

                {product.care_instructions && (
                  <div className="product-detail-desc">
                    <h3>Уход</h3>
                    <p>{product.care_instructions}</p>
                  </div>
                )}

                {product.season && (
                  <div className="product-detail-meta">
                    <span>Сезон:</span> {product.season}
                  </div>
                )}

                <div className="product-detail-actions">
                  <div className="product-detail-qty">
                    <button
                      className="qty-btn"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                    >
                      −
                    </button>
                    <span>{qty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => setQty((q) => Math.min(99, q + 1))}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className={`btn btn-primary product-detail-add${added ? " added" : ""}`}
                    onClick={handleAdd}
                    disabled={!product.in_stock}
                  >
                    {added ? "Добавлено!" : "В корзину"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
