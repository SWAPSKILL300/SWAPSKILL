/* ============================
   SWAPSKILL – Landing Page JS
   ============================ */

// Smooth scrolling for navbar links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 60,
        behavior: 'smooth'
      });
    }
  });
});

// Navbar shadow effect on scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar.classList.add('nav-scroll');
  } else {
    navbar.classList.remove('nav-scroll');
  }
});

// Fade-in reveal on scroll
const revealElements = document.querySelectorAll('.section, .card, .feature');

function reveal() {
  const trigger = window.innerHeight * 0.85;

  revealElements.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < trigger) el.classList.add('show');
  });
}

window.addEventListener('scroll', reveal);
window.addEventListener('load', reveal);

// Button ripple effect (premium touch)
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - btn.offsetLeft - radius}px`;
    circle.style.top = `${e.clientY - btn.offsetTop - radius}px`;
    circle.classList.add("ripple");

    const ripple = btn.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    btn.appendChild(circle);
  });
});
