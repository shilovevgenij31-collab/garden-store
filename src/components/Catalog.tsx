import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useCart } from "@/context/CartContext";
import type { ProductRead } from "@/api/products";

export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  /* Cleanup debounce timer on unmount */
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const filters = {
    ...(activeCategory !== "all" && { category: activeCategory }),
    ...(searchQuery && { search: searchQuery }),
    page,
    limit: 12,
  };
  const { data: productsData, isLoading: productsLoading } = useProducts(filters);
  const { data: categories } = useCategories();
  const { addToCart } = useCart();

  const products = productsData?.items ?? [];
  const totalPages = productsData?.pages ?? 1;
  const allProductsCount = categories?.reduce((sum, c) => sum + c.product_count, 0) ?? 0;

  /* Debounced search */
  function handleSearchChange(value: string) {
    setSearchInput(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value.trim());
      setPage(1);
    }, 400);
  }

  /* Reset page when category changes */
  function handleCategoryClick(slug: string) {
    setActiveCategory(slug);
    setPage(1);
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  }

  /* Animate product cards when they appear */
  useEffect(() => {
    const timer = setTimeout(() => {
      document
        .querySelectorAll("#catalogGrid .scale-in")
        .forEach((el) => el.classList.add("visible"));
    }, 100);
    return () => clearTimeout(timer);
  }, [products]);

  function handleAddToCart(e: React.MouseEvent, product: ProductRead) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  }

  return (
    <section className="section catalog" id="catalog">
      <div className="container">
        <div className="section-header fade-up">
          <div className="section-label">Каталог</div>
          <h2 className="section-title">Наши товары</h2>
          <p className="section-subtitle">
            Выберите категорию в меню слева или просмотрите весь ассортимент
          </p>
        </div>
        <div className="catalog-layout">
          {/* Sidebar */}
          <div className="catalog-sidebar fade-left">
            <button
              className={`catalog-sidebar-toggle${mobileMenuOpen ? " active" : ""}`}
              onClick={() => setMobileMenuOpen((v) => !v)}
            >
              Категории
            </button>
            <div className={`catalog-menu${mobileMenuOpen ? " mobile-open" : ""}`}>
              <div className="catalog-menu-title">Категории</div>
              <button
                className={`catalog-menu-item${activeCategory === "all" ? " active" : ""}`}
                onClick={() => handleCategoryClick("all")}
              >
                Все товары{" "}
                <span className="cat-count">{allProductsCount}</span>
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  className={`catalog-menu-item${activeCategory === cat.slug ? " active" : ""}`}
                  onClick={() => handleCategoryClick(cat.slug)}
                >
                  {cat.icon ? `${cat.icon} ` : ""}
                  {cat.name}{" "}
                  <span className="cat-count">{cat.product_count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Products area */}
          <div>
            {/* Search */}
            <div className="catalog-search">
              <input
                type="text"
                className="catalog-search-input"
                placeholder="Поиск товаров..."
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Products grid */}
            <div className="products-grid" id="catalogGrid">
              {productsLoading && (
                <p style={{ color: "var(--text-light)", gridColumn: "1 / -1", textAlign: "center" }}>
                  Загрузка...
                </p>
              )}
              {!productsLoading && products.length === 0 && (
                <p style={{ color: "var(--text-light)", gridColumn: "1 / -1", textAlign: "center" }}>
                  Товары не найдены
                </p>
              )}
              {products.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.slug}`}
                  className="product-card scale-in"
                  data-cat={p.category.slug}
                >
                  <div className="product-img-wrap">
                    <img src={p.image_url} alt={p.name} loading="lazy" />
                    {p.badge && <span className="product-badge">{p.badge}</span>}
                  </div>
                  <div className="product-info">
                    <div className="product-category">{p.category.name}</div>
                    <div className="product-name">{p.name}</div>
                    {!p.in_stock && (
                      <div
                        style={{
                          color: "var(--accent-rose)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          marginBottom: "4px",
                        }}
                      >
                        Нет в наличии
                      </div>
                    )}
                    <div className="product-price-row">
                      <div>
                        <span className="product-price">
                          {Number(p.price).toLocaleString("ru-RU")} ₽
                        </span>
                        {p.old_price != null && (
                          <span className="product-price-old">
                            {Number(p.old_price).toLocaleString("ru-RU")} ₽
                          </span>
                        )}
                      </div>
                      <button
                        className="btn-add-cart"
                        onClick={(e) => handleAddToCart(e, p)}
                        title={p.in_stock ? "В корзину" : "Нет в наличии"}
                        disabled={!p.in_stock}
                        style={!p.in_stock ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="catalog-pagination">
                <button
                  className="catalog-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  &larr; Назад
                </button>
                <div className="catalog-page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      className={`catalog-page-num${n === page ? " active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  className="catalog-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Вперёд &rarr;
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
