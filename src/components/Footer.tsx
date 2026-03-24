export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-logo">
              <img src="/images/logo.jpg" alt="Все в сад" />
              Все в сад
            </div>
            <div className="footer-desc">
              Садовый магазин в Череповце. Всё для вашего сада — от семян до
              декора. Качественные растения и товары по доступным ценам.
            </div>
          </div>
          <div className="footer-col">
            <h4>Каталог</h4>
            <a href="#catalog">Цветы</a>
            <a href="#catalog">Рассада</a>
            <a href="#catalog">Инструменты</a>
            <a href="#catalog">Декор</a>
            <a href="#catalog">Семена</a>
          </div>
          <div className="footer-col">
            <h4>Информация</h4>
            <a href="#about">О нас</a>
            <a href="#advantages">Преимущества</a>
            <a href="#how-order">Как заказать</a>
            <a href="#reviews">Отзывы</a>
          </div>
          <div className="footer-col">
            <h4>Контакты</h4>
            <a href="#contacts">+7 (8202) 55-12-34</a>
            <a href="#contacts">г. Череповец</a>
            <a href="#contacts">info@vsevSad.ru</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 Все в сад. Все права защищены.</span>
          <span>Сделано с любовью к садоводству</span>
        </div>
      </div>
    </footer>
  );
}
