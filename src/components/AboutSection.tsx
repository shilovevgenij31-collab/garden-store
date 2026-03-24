export default function AboutSection() {
  return (
    <section className="section about" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-image fade-left">
            <img src="/images/about.jpg" alt="О нашем магазине" />
          </div>
          <div className="about-text fade-right">
            <div className="section-label">О нас</div>
            <h2 className="section-title">
              Любовь к садоводству в каждом растении
            </h2>
            <p>
              Магазин «Все в сад» — это уютное пространство для всех, кто любит
              свой сад. Мы работаем в Череповце и помогаем нашим покупателям
              создавать красивые и ухоженные участки.
            </p>
            <p>
              У нас вы найдёте широкий выбор цветов, рассады, семян, садового
              инвентаря и декора. Мы тщательно отбираем каждое растение и следим
              за его качеством, чтобы оно радовало вас долгие годы.
            </p>
            <p>
              Наши сотрудники — опытные садоводы, которые с удовольствием
              подскажут, какие растения подойдут именно для вашего участка, и
              поделятся секретами ухода.
            </p>
            <p className="script-font">Ваш сад начинается здесь</p>
          </div>
        </div>
      </div>
    </section>
  );
}
