const advantages = [
  {
    icon: "🌱",
    title: "Качественные растения",
    desc: "Все растения проходят тщательный отбор и поставляются от проверенных питомников",
  },
  {
    icon: "💰",
    title: "Доступные цены",
    desc: "Мы работаем напрямую с поставщиками, что позволяет предлагать лучшие цены в регионе",
  },
  {
    icon: "🏪",
    title: "Удобный самовывоз",
    desc: "Заберите заказ в нашем магазине в удобное время. Оплата на сайте или при получении",
  },
  {
    icon: "👩‍🌾",
    title: "Консультации экспертов",
    desc: "Наши специалисты помогут подобрать растения и расскажут об особенностях ухода",
  },
];

export default function AdvantagesSection() {
  return (
    <section className="section advantages" id="advantages">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Почему мы</div>
          <h2 className="section-title">Наши преимущества</h2>
          <p className="section-subtitle">
            Мы делаем всё, чтобы ваш сад был красивым и здоровым
          </p>
        </div>
        <div className="advantages-grid">
          {advantages.map((adv, i) => (
            <div key={i} className="advantage-card fade-up">
              <div className="advantage-icon">{adv.icon}</div>
              <div className="advantage-title">{adv.title}</div>
              <div className="advantage-desc">{adv.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
