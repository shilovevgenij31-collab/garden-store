export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg"></div>
      <div className="hero-overlay"></div>
      <div className="container">
        <div className="hero-content">
          <div className="hero-label">Садовый магазин в Череповце</div>
          <h1>
            Всё для <em>вашего сада</em> в одном месте
          </h1>
          <p className="hero-desc">
            Растения, цветы, инструменты и декор для создания сада вашей мечты.
            Оформите предзаказ онлайн и заберите в нашем магазине.
          </p>
          <div className="hero-buttons">
            <a href="#catalog" className="btn btn-primary">
              Смотреть каталог
            </a>
            <a
              href="#about"
              className="btn btn-outline"
              style={{ borderColor: "rgba(255,255,255,.5)", color: "#fff" }}
            >
              О магазине
            </a>
          </div>
        </div>
      </div>
      <div className="hero-scroll">
        <span>Листайте вниз</span>
        <div className="hero-scroll-icon"></div>
      </div>
    </section>
  );
}
