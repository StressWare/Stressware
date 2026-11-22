/* ========================================
   Stressware — Interactive JavaScript
   ======================================== */

// --- Smooth scroll for anchor links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const headerOffset = 72;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      // Focus for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
});

// --- Package selection from pricing cards ---
document.querySelectorAll('[data-package]').forEach(btn => {
  btn.addEventListener('click', function() {
    const packageName = this.dataset.package;
    const packageInput = document.getElementById('package-input');
    if (packageInput) {
      packageInput.value = packageName;
    }

    // Scroll to contact form
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      const headerOffset = 72;
      const elementPosition = contactSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

      // Focus first input after scroll
      setTimeout(() => {
        const nameInput = document.getElementById('name');
        if (nameInput) nameInput.focus();
      }, 500);
    }
  });
});

// --- Contact Form Handling ---
const form = document.querySelector('.contact-form');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('contact-success');
const errorMsg = document.getElementById('contact-error');

if (form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#c0392b';
        isValid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (!isValid) {
      showError('Please fill in all required fields.');
      return;
    }

    // Email validation
    const email = form.querySelector('input[type="email"]');
    if (email && !isValidEmail(email.value)) {
      email.style.borderColor = '#c0392b';
      showError('Please enter a valid email address.');
      return;
    }

    // Submit
    setLoading(true);

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        showSuccess();
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (err) {
      console.error('Form error:', err);
      showError();
    } finally {
      setLoading(false);
    }
  });

  // Clear error styling on input
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', function() {
      this.style.borderColor = '';
      hideMessages();
    });
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setLoading(loading) {
  if (submitBtn) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Sending...' : 'Send Inquiry';
    submitBtn.style.opacity = loading ? '0.7' : '1';
  }
}

function showSuccess() {
  hideMessages();
  if (successMsg) successMsg.hidden = false;
  if (errorMsg) errorMsg.hidden = true;
  if (form) form.hidden = true;
}

function showError(message) {
  hideMessages();
  if (errorMsg) {
    const errorText = errorMsg.querySelector('p');
    if (errorText && message) errorText.textContent = message;
    errorMsg.hidden = false;
  }
  if (successMsg) successMsg.hidden = true;
}

function hideMessages() {
  if (successMsg) successMsg.hidden = true;
  if (errorMsg) errorMsg.hidden = true;
}

// --- iframe fallback handling ---
const iframe = document.querySelector('.demo-frame');
const fallback = document.querySelector('.demo-fallback');

if (iframe && fallback) {
  iframe.addEventListener('load', function() {
    try {
      // Check if iframe loaded successfully (same-origin check will fail for cross-origin)
      // We'll use a timeout approach instead
    } catch (e) {
      showFallback();
    }
  });

  iframe.addEventListener('error', showFallback);

  // Fallback timeout - if iframe doesn't load in 10s, show fallback
  const fallbackTimer = setTimeout(() => {
    if (!iframe.contentDocument || iframe.contentDocument.readyState !== 'complete') {
      showFallback();
    }
  }, 10000);

  function showFallback() {
    clearTimeout(fallbackTimer);
    iframe.style.display = 'none';
    fallback.hidden = false;
  }
}

// --- Intersection Observer for scroll animations ---
const observerOptions = {
  root: null,
  rootMargin: '0px 0px -10% 0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe elements that should animate in
document.querySelectorAll('.pricing-card, .why-card, .work-details, .contact-form, .contact-info').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Add in-view styles dynamically
const style = document.createElement('style');
style.textContent = `
  .in-view {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// --- Active nav link on scroll ---
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link:not(.cta-nav)');

function setActiveNav() {
  const scrollPos = window.scrollY + 100;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}

window.addEventListener('scroll', setActiveNav, { passive: true });

// Add active style
const navStyle = document.createElement('style');
navStyle.textContent = `
  .nav-link.active {
    color: var(--color-main);
  }
  .nav-link.active::after {
    width: 100%;
  }
`;
document.head.appendChild(navStyle);

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  // Trigger initial nav check
  setActiveNav();

  // Remove loading states if any
  document.body.classList.add('loaded');
});

console.log('Stressware site initialized 🎯');