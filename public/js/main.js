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

  // Load Razorpay Script dynamically if not already loaded
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

  // Form Submit Handler
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
    submitBtn.innerHTML = '<span>Checking Gateway... ⏳</span>';

    try {
      // 1. Create order on server
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Order create nahi ho paya');
      }

      // Check if real Razorpay or simulation mode
      if (data.isTestSimulation || !window.Razorpay || data.keyId === 'rzp_test_simulation') {
        // Run test simulator modal
        handleTestPaymentSimulation(data);
      } else {
        // Open Real Razorpay Checkout
        openRazorpayCheckout(data);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.message || 'Payment start karne mein problem aayi. Kripya dobara try karein.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  // Real Razorpay Checkout Handler
  function openRazorpayCheckout(orderData) {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      name: 'Think Unlimited',
      description: 'Class 10 Maths Made Easy (PDF E-Book)',
      order_id: orderData.razorpayOrderId,
      prefill: orderData.prefill,
      theme: {
        color: '#0B1B3A'
      },
      modal: {
        ondismiss: function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Buy Now – ₹39 <span>→</span>';
          trackAnalyticsEvent('PaymentDismissed');
        }
      },
      handler: async function (response) {
        submitBtn.innerHTML = '<span>Verifying Payment... 🔒</span>';
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            trackAnalyticsEvent('Purchase', { orderId: verifyData.orderId, value: 39, currency: 'INR' });
            window.location.href = `/success?token=${verifyData.downloadToken}&orderId=${verifyData.orderId}`;
          } else {
            throw new Error(verifyData.error || 'Payment verify nahi ho paya.');
          }
        } catch (vErr) {
          console.error('Verification error:', vErr);
          alert(`Payment ho gaya par verification mein problem aayi: ${vErr.message}\nChinta mat kijiye, hamare WhatsApp (9243791529) par turant message karein.`);
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Buy Now – ₹39 <span>→</span>';
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (response) {
      console.warn('Payment failed:', response.error);
      fetch('/api/payment-failed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderData.razorpayOrderId,
          reason: response.error.description
        })
      });
      alert(`Payment fail ho gaya: ${response.error.description}\nKripya UPI ya doosra card try karein.`);
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Buy Now – ₹39 <span>→</span>';
    });

    rzp.open();
  }

  // Interactive Test Simulator (Ready when Razorpay keys are not yet configured in .env)
  function handleTestPaymentSimulation(orderData) {
    const modalContent = document.querySelector('.modal-card');
    modalContent.innerHTML = `
      <div style="text-align: center;">
        <span class="rubber-stamp stamp-yellow" style="margin-bottom: 12px;">TEST MODE ACTIVE</span>
        <h2 style="font-size: 1.4rem; color: var(--navy); margin-bottom: 8px;">Simulated Razorpay Gateway</h2>
        <p style="font-size: 0.88rem; color: #475569; margin-bottom: 16px;">
          (Server is in test mode. Complete the simulated purchase flow below or add live keys in .env)
        </p>
        
        <div style="background: #FFF9D2; border: 2px dashed var(--navy); border-radius: 8px; padding: 12px; margin-bottom: 20px; text-align: left; font-size: 0.85rem;">
          <div><strong>Buyer:</strong> ${orderData.prefill.name}</div>
          <div><strong>Email:</strong> ${orderData.prefill.email}</div>
          <div><strong>WhatsApp:</strong> +91 ${orderData.prefill.contact}</div>
          <div><strong>Amount:</strong> ₹39 (3900 paise)</div>
        </div>

        <button id="simSuccessBtn" class="btn-primary" style="width: 100%; margin-bottom: 10px; background: #22C55E; color: white;">
          ✔ Simulate Successful Payment (₹39)
        </button>

        <button id="simFailBtn" class="btn-secondary" style="width: 100%; color: var(--red); border-color: var(--red);">
          ✖ Simulate Cancelled / Failed Payment
        </button>
      </div>
    `;

    document.getElementById('simSuccessBtn').addEventListener('click', async () => {
      const btn = document.getElementById('simSuccessBtn');
      btn.textContent = 'Processing & Verifying Signature...';
      btn.disabled = true;

      try {
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.razorpayOrderId,
            razorpay_payment_id: `pay_test_${Date.now()}`,
            razorpay_signature: 'test_simulation_signature',
            isTestSimulation: true
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          window.location.href = `/success?token=${verifyData.downloadToken}&orderId=${verifyData.orderId}`;
        } else {
          alert('Verification failed in test mode: ' + verifyData.error);
        }
      } catch (err) {
        alert('Server error: ' + err.message);
      }
    });

    document.getElementById('simFailBtn').addEventListener('click', () => {
      alert('Payment cancelled / failed as simulated.');
      closeModal();
      window.location.reload();
    });
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
