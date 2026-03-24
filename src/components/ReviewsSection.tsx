const reviews = [
  {
    stars: 5,
    text: "Замечательный магазин! Купила розы и лаванду — все прижились отлично. Очень довольна качеством рассады и вежливостью продавцов.",
    name: "Елена М.",
    date: "Март 2026",
    initials: "Е",
  },
  {
    stars: 5,
    text: "Большой выбор садовых инструментов по адекватным ценам. Секаторы — просто огонь! Рекомендую всем дачникам Череповца.",
    name: "Андрей К.",
    date: "Февраль 2026",
    initials: "А",
  },
  {
    stars: 5,
    text: "Заказывала семена и рассаду помидоров. Всё взошло, урожай отличный! Спасибо за консультацию по уходу — очень помогло.",
    name: "Ольга С.",
    date: "Январь 2026",
    initials: "О",
  },
  {
    stars: 4,
    text: "Красивый декор для сада — купила фонарики и кашпо. Соседи завидуют! Забрала в магазине, всё аккуратно упаковано.",
    name: "Марина Д.",
    date: "Декабрь 2025",
    initials: "М",
  },
];

export default function ReviewsSection() {
  return (
    <section className="section reviews" id="reviews">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Отзывы</div>
          <h2 className="section-title">Что говорят наши покупатели</h2>
          <p className="section-subtitle">
            Мы гордимся доверием наших клиентов
          </p>
        </div>
        <div className="reviews-grid">
          {reviews.map((review, i) => (
            <div key={i} className="review-card fade-up">
              <div className="review-stars">
                {"★".repeat(review.stars)}
                {"☆".repeat(5 - review.stars)}
              </div>
              <div className="review-text">{review.text}</div>
              <div className="review-author">
                <div className="review-avatar">{review.initials}</div>
                <div>
                  <div className="review-name">{review.name}</div>
                  <div className="review-date">{review.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
