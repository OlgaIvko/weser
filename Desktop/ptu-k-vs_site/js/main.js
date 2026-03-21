document.addEventListener("DOMContentLoaded", function () {
  // Мобильное меню
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.querySelector(".nav__menu");
  toggle.addEventListener("click", () => {
    menu.classList.toggle("active");
    toggle.classList.toggle("active");
  });
  document.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("active");
      toggle.classList.remove("active");
    });
  });

  // Слайдер "карты из колоды"
  const cards = document.querySelectorAll(".hero-card");
  const dots = document.querySelectorAll(".hero-cards__dot");
  const prevBtn = document.querySelector(".hero-cards__nav-btn--prev");
  const nextBtn = document.querySelector(".hero-cards__nav-btn--next");
  let current = 0;

  function showCard(index) {
    cards.forEach((c) => {
      c.classList.remove("hero-card--active", "hero-card--deal");
    });
    dots.forEach((d) => d.classList.remove("hero-cards__dot--active"));

    cards[index].classList.add("hero-card--active", "hero-card--deal");
    dots[index].classList.add("hero-cards__dot--active");
    current = index;

    setTimeout(() => {
      cards[index].classList.remove("hero-card--deal");
    }, 500);
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      let index = (current - 1 + cards.length) % cards.length;
      showCard(index);
    });
    nextBtn.addEventListener("click", () => {
      let index = (current + 1) % cards.length;
      showCard(index);
    });
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => showCard(i));
    });
  }

  // Автопрокрутка
  setInterval(() => {
    let index = (current + 1) % cards.length;
    showCard(index);
  }, 5000);

  // FAQ аккордеон
  document.querySelectorAll(".faq-question").forEach((btn) => {
    btn.addEventListener("click", function () {
      const expanded = this.getAttribute("aria-expanded") === "true";
      this.setAttribute("aria-expanded", !expanded);
      const answer = this.nextElementSibling;
      answer.setAttribute("aria-hidden", expanded);
    });
  });

  // Модальное окно
  const modal = document.getElementById("contactModal");
  const openBtn = document.getElementById("openModalBtn");
  const openBtn2 = document.getElementById("openModalBtn2");
  const closeBtn = document.getElementById("closeModalBtn");
  const modalConsent = document.getElementById("modalConsent");
  const modalSubmit = document.getElementById("modalSubmitBtn");

  function openModal(e) {
    e.preventDefault();
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  if (openBtn) openBtn.addEventListener("click", openModal);
  if (openBtn2) openBtn2.addEventListener("click", openModal);

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.classList.remove("show");
      document.body.style.overflow = "";
    });
  }
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("show");
      document.body.style.overflow = "";
    }
  });

  if (modalConsent) {
    modalConsent.addEventListener("change", function () {
      if (modalSubmit) modalSubmit.disabled = !this.checked;
    });
  }

  // Отправка формы через Formspree
  const form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!modalConsent || !modalConsent.checked) {
        alert("Необходимо согласие на обработку данных");
        return;
      }
      if (modalSubmit) {
        modalSubmit.disabled = true;
        modalSubmit.textContent = "Отправка...";
      }

      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        const data = await response.json();
        if (data.ok) {
          alert("Спасибо! Мы свяжемся с вами.");
          form.reset();
          if (modalConsent) modalConsent.checked = false;
          if (modalSubmit) {
            modalSubmit.disabled = true;
            modalSubmit.textContent = "Отправить";
          }
          modal.classList.remove("show");
          document.body.style.overflow = "";
        } else {
          alert("Ошибка отправки. Попробуйте позже.");
        }
      } catch (error) {
        alert("Ошибка соединения.");
      } finally {
        if (modalSubmit) {
          modalSubmit.disabled = false;
          modalSubmit.textContent = "Отправить";
        }
      }
    });
  }
  document.querySelector(".nav__close").addEventListener("click", () => {
    menu.classList.remove("active");
    toggle.classList.remove("active");
  });

  // Плавный скролл к якорям (исправленный)
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || href === "") return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
});

// Анимация появления для карточек центров и наставников
const centerCards = document.querySelectorAll(".center-card");
const mentorCards = document.querySelectorAll(".mentor-card");

const observerCards = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observerCards.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2, rootMargin: "0px 0px -50px 0px" },
);

centerCards.forEach((card) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(30px)";
  card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  observerCards.observe(card);
});
// Анимация для карточек функционала
// const featureCards = document.querySelectorAll(".feature-card");
// if (featureCards.length) {
//   const observerFeatures = new IntersectionObserver(
//     (entries) => {
//       entries.forEach((entry) => {
//         if (entry.isIntersecting) {
//           entry.target.classList.add("visible");
//           observerFeatures.unobserve(entry.target);
//         }
//       });
//     },
//     { threshold: 0.2, rootMargin: "0px 0px -50px 0px" },
//   );
//   featureCards.forEach((card) => {
//     card.style.opacity = "0";
//     card.style.transform = "translateY(30px)";
//     card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
//     observerFeatures.observe(card);
//   });
// }
// Анимация для карточек функционала
const featureCards = document.querySelectorAll(".feature-card");
if (featureCards.length) {
  const observerFeatures = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observerFeatures.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -50px 0px" },
  );
  featureCards.forEach((card) => observerFeatures.observe(card));
}
