const steps = [
  {
    number: 1,
    title: "Выберите товары",
    desc: "Просмотрите каталог и добавьте понравившиеся товары в корзину",
  },
  {
    number: 2,
    title: "Оформите заказ",
    desc: "Заполните форму с контактными данными и подтвердите заказ",
  },
  {
    number: 3,
    title: "Заберите заказ",
    desc: "После оформления мы свяжемся с вами для подтверждения. Заберите заказ в магазине",
  },
];

export default function HowToOrderSection() {
  return (
    <section className="section how-order" id="how-order">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Просто и удобно</div>
          <h2 className="section-title">Как заказать</h2>
          <p className="section-subtitle">
            Три простых шага для оформления заказа
          </p>
        </div>
        <div className="steps">
          {steps.map((step) => (
            <div key={step.number} className="step fade-up">
              <div className="step-number">{step.number}</div>
              <div className="step-title">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
