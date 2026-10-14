// ========================================================
// THINK UNLIMITED - CLASS 10 MATHS MADE EASY CLIENT SCRIPT
// Handles Razorpay Checkout, Form Validation, UI Interactivity
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const modalOverlay = document.getElementById('paymentModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const buyBtns = document.querySelectorAll('.trigger-buy-modal');
  const paymentForm = document.getElementById('paymentForm');
  const nameInput = document.getElementById('buyerName');
  const emailInput = document.getElementById('buyerEmail');
  const phoneInput = document.getElementById('buyerPhone');
  const submitBtn = document.getElementById('paySubmitBtn');
  const stickyBar = document.getElementById('stickyMobileCta');
  const heroSection = document.getElementById('hero');

  // Load Cashfree and Razorpay Scripts dynamically if not already loaded
  function loadCashfreeSdk() {
    return new Promise((resolve) => {
      if (window.Cashfree) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('Cashfree SDK could not be loaded from CDN.');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  function loadRazorpaySdk() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        console.warn('Razorpay SDK could not be loaded from CDN.');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  loadCashfreeSdk();
  loadRazorpaySdk();

  // Modal Open/Close
  function openModal() {
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    nameInput.focus();
    trackAnalyticsEvent('InitiateCheckout', { product: 'Class 10 Maths Made Easy', price: 39 });
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    clearErrors();
  }

  buyBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  // Sticky Mobile Bar scroll listener
  if (stickyBar && heroSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          stickyBar.classList.add('visible');
        } else {
          stickyBar.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    observer.observe(heroSection);
  }

  // Animated Weightage Bar Chart on scroll
  const weightageSection = document.querySelector('.weightage-section');
  if (weightageSection) {
    const chartObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bars = document.querySelectorAll('.bar-fill');
          bars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width');
            bar.style.width = targetWidth;
          });
          chartObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    chartObserver.observe(weightageSection);
  }

  // FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  // Chapter Tile Interactive Expansion
  const chapterTiles = document.querySelectorAll('.chapter-tile');
  chapterTiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const details = tile.querySelector('.tile-details');
      const isExpanded = tile.getAttribute('data-expanded') === 'true';
      if (!isExpanded) {
        tile.setAttribute('data-expanded', 'true');
        tile.style.borderColor = '#1B873F';
        tile.style.backgroundColor = '#F0FDF4';
      } else {
        tile.setAttribute('data-expanded', 'false');
        tile.style.borderColor = 'var(--navy)';
        tile.style.backgroundColor = '#FFFFFF';
      }
    });
  });

  // 3D Book Tilt Physics on Hover
  const bookMockup = document.querySelector('.book-card-3d');
  if (bookMockup && window.innerWidth > 768) {
    bookMockup.addEventListener('mousemove', (e) => {
      const rect = bookMockup.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPct = (x / rect.width - 0.5) * 2;
      const yPct = (y / rect.height - 0.5) * 2;
      bookMockup.style.transform = `rotateY(${xPct * 20}deg) rotateX(${-yPct * 20}deg) scale(1.04)`;
    });
    bookMockup.addEventListener('mouseleave', () => {
      bookMockup.style.transform = 'rotateY(-18deg) rotateX(8deg) rotateZ(2deg)';
    });
  }

  // Validation Helpers
  function clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.style.display = 'none');
  }

  function showError(fieldId, message) {
    const errEl = document.getElementById(`${fieldId}Error`);
    if (errEl) {
      errEl.textContent = message;
      errEl.style.display = 'block';
    }
  }

  function validateInputs(name, email, phone) {
    clearErrors();
    let valid = true;

    if (!name || name.trim().length < 2) {
      showError('buyerName', 'Kripya apna poora naam enter karein');
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      showError('buyerEmail', 'Kripya valid email ID enter karein (PDF yahan bheja jayega)');
      valid = false;
    }

    const phoneClean = phone.replace(/[\s\-\+\(\)]/g, '');
    const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
    if (!phone || !phoneRegex.test(phoneClean)) {
      showError('buyerPhone', 'Kripya sahi 10-digit WhatsApp number enter karein');
      valid = false;
    }

    return valid;
  }

  // Form Submit Handler (Cashfree PG)
  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!validateInputs(name, email, phone)) {
      return;
    }

    // Set loading state
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Connecting to Cashfree... ⏳</span>';

    try {
      // 1. Create order on server via Cashfree
      const res = await fetch('/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Order create nahi ho paya');
      }

      // Open Real Cashfree Checkout
      await openCashfreeCheckout(data);
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.message || 'Payment start karne mein problem aayi. Kripya dobara try karein.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  // Ensure Cashfree SDK is loaded
  function ensureCashfreeLoaded() {
    return new Promise((resolve) => {
      if (window.Cashfree) return resolve(true);
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (window.Cashfree) {
          clearInterval(interval);
          resolve(true);
        } else if (attempts >= 25) { // 2.5 seconds timeout
          clearInterval(interval);
          resolve(false);
        }
      }, 100);
    });
  }

  // Real Cashfree Checkout Handler
  async function openCashfreeCheckout(orderData) {
    const mode = (orderData.environment && orderData.environment.toLowerCase() === 'prod') 
      ? 'production' 
      : 'sandbox';

    const sdkReady = await ensureCashfreeLoaded();

    if (sdkReady && typeof window.Cashfree === 'function') {
      try {
        console.log(`Launching Cashfree ${mode} modal popup...`);
        const cashfree = window.Cashfree({ mode });

        cashfree.checkout({
          paymentSessionId: orderData.paymentSessionId,
          mode: mode,
          redirectTarget: '_modal'
        }).then(async (result) => {
          if (result && result.error) {
            console.warn('Cashfree modal status:', result.error);
            if (result.error.message && !result.error.message.includes('closed') && !result.error.message.includes('dismissed')) {
              alert('Payment notification: ' + result.error.message);
            }
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Proceed to Pay – ₹39 <span>→</span>';
            return;
          }

          if (result && result.redirect) {
            return;
          }

          submitBtn.innerHTML = '<span>Verifying Payment... 🔒</span>';
          await verifyCashfreeOrder(orderData.cashfreeOrderId);
        });

        return;
      } catch (sdkErr) {
        console.warn('Cashfree modal error, switching to direct hosted checkout:', sdkErr);
      }
    }

    // Direct Cashfree Hosted Checkout Fallback (100% reliable across all browsers & ad-blockers)
    console.log('Redirecting to official Cashfree Checkout page...');
    redirectToCashfreeHosted(orderData.paymentSessionId, mode);
  }

  // Cashfree Hosted Page Form Redirect
  function redirectToCashfreeHosted(paymentSessionId, mode) {
    const checkoutUrl = mode === 'production' 
      ? 'https://api.cashfree.com/pg/view/sessions/checkout' 
      : 'https://sandbox.cashfree.com/pg/view/sessions/checkout';
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = checkoutUrl;
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payment_session_id';
    input.value = paymentSessionId;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
  }

  // Cashfree Verification Handler
  async function verifyCashfreeOrder(orderId) {
    try {
      const verifyRes = await fetch('/api/cashfree/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        trackAnalyticsEvent('Purchase', { 
          orderId: verifyData.orderId, 
          value: 39, 
          currency: 'INR',
          gateway: 'cashfree'
        });
        window.location.href = `/success?token=${verifyData.downloadToken}&orderId=${verifyData.orderId}`;
      } else {
        throw new Error(verifyData.error || 'Payment verify nahi ho paya.');
      }
    } catch (vErr) {
      console.error('Cashfree verification error:', vErr);
      alert(`Payment complete ho gaya par verification pending hai: ${vErr.message}\nChinta mat kijiye, WhatsApp (9243791529) par turant message karein.`);
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Proceed to Pay – ₹39 <span>→</span>';
    }
  }
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }


});

// Privacy-friendly analytics hooks placeholder
function trackAnalyticsEvent(eventName, params = {}) {
  try {
    if (window.fbq) {
      window.fbq('track', eventName, params);
    }
    if (window.gtag) {
      window.gtag('event', eventName, params);
    }
  } catch (e) {
    // Analytics optional
  }
}
