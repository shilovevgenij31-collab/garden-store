import type { ReactNode } from "react";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

const contacts: { icon: ReactNode; label: string; value: string }[] = [
  {
    icon: <MapPin size={20} />,
    label: "Адрес",
    value: "г. Череповец, ул. Ленина, 50",
  },
  {
    icon: <Phone size={20} />,
    label: "Телефон",
    value: "+7 (8202) 55-12-34",
  },
  {
    icon: <Clock size={20} />,
    label: "Режим работы",
    value: "Пн–Сб: 9:00–19:00, Вс: 10:00–17:00",
  },
  {
    icon: <Mail size={20} />,
    label: "Email",
    value: "info@vsevSad.ru",
  },
];

export default function ContactsSection() {
  return (
    <section className="section contacts" id="contacts">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Контакты</div>
          <h2 className="section-title">Свяжитесь с нами</h2>
          <p className="section-subtitle">
            Мы всегда рады помочь вам с выбором
          </p>
        </div>
        <div className="contacts-grid">
          <div className="contact-info fade-left">
            <h3>Наши контакты</h3>
            {contacts.map((c, i) => (
              <div key={i} className="contact-item">
                <div className="contact-icon">{c.icon}</div>
                <div>
                  <div className="contact-label">{c.label}</div>
                  <div className="contact-value">{c.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="contacts-map fade-right">
            <iframe
              src="https://yandex.ru/map-widget/v1/?um=constructor%3A44.5075%2C59.1269&amp;source=constructor&amp;ll=37.9113%2C59.1269&amp;z=15"
              title="Карта"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
