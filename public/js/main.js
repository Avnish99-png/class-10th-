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

  // Interactive Payment Gateway (UPI, Cards, NetBanking)
  function handleTestPaymentSimulation(orderData) {
    const modalContent = document.querySelector('.modal-card');
    modalContent.innerHTML = `
      <div style="position: relative;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--navy); padding-bottom: 12px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 0.72rem; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">
              ✔ Secure Payment Gateway (256-bit SSL)
            </div>
            <div style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 900; color: var(--navy);">
              Pay Think Unlimited
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.75rem; color: #64748B;">Amount Payable</div>
            <div style="font-size: 1.4rem; font-weight: 900; color: var(--navy); line-height: 1;">₹39</div>
          </div>
        </div>

        <!-- Buyer Info Chip -->
        <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; padding: 8px 12px; margin-bottom: 16px; font-size: 0.82rem; display: flex; justify-content: space-between; flex-wrap: wrap;">
          <span><strong>Buyer:</strong> ${orderData.prefill.name}</span>
          <span><strong>WhatsApp:</strong> +91 ${orderData.prefill.contact}</span>
        </div>

        <!-- Payment Method Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
          <button type="button" id="tabUpi" class="gateway-tab-btn active" style="flex: 1; padding: 8px; border: 2px solid var(--navy); background: #FFF9D2; font-weight: 800; font-size: 0.85rem; border-radius: 6px; cursor: pointer;">
            ⚡ UPI (GPay/PhonePe/Paytm)
          </button>
          <button type="button" id="tabCard" class="gateway-tab-btn" style="flex: 1; padding: 8px; border: 2px solid #CBD5E1; background: #FFFFFF; font-weight: 700; font-size: 0.85rem; border-radius: 6px; cursor: pointer; color: #64748B;">
            💳 Cards / NetBanking
          </button>
        </div>

        <!-- UPI Tab Content -->
        <div id="upiTabContent">
          <div style="background: #F0FDF4; border: 1.5px solid #166534; border-radius: 8px; padding: 14px; margin-bottom: 16px; text-align: center;">
            <div style="font-weight: 800; color: #166534; font-size: 0.95rem; margin-bottom: 4px;">
              Pay via Any UPI App (₹39)
            </div>
            <div style="font-size: 0.8rem; color: #475569; margin-bottom: 12px;">
              Google Pay • PhonePe • Paytm • BHIM • Cred
            </div>
            
            <div style="background: white; border: 2px dashed var(--navy); border-radius: 8px; padding: 12px; display: inline-block; margin-bottom: 10px;">
              <svg width="120" height="120" viewBox="0 0 100 100" style="display: block; margin: 0 auto;">
                <rect width="100" height="100" fill="#FFFFFF"/>
                <!-- QR Code corner patterns -->
                <rect x="10" y="10" width="24" height="24" fill="#0B1B3A"/>
                <rect x="14" y="14" width="16" height="16" fill="#FFFFFF"/>
                <rect x="18" y="18" width="8" height="8" fill="#0B1B3A"/>

                <rect x="66" y="10" width="24" height="24" fill="#0B1B3A"/>
                <rect x="70" y="14" width="16" height="16" fill="#FFFFFF"/>
                <rect x="74" y="18" width="8" height="8" fill="#0B1B3A"/>

                <rect x="10" y="66" width="24" height="24" fill="#0B1B3A"/>
                <rect x="14" y="70" width="16" height="16" fill="#FFFFFF"/>
                <rect x="18" y="74" width="8" height="8" fill="#0B1B3A"/>

                <!-- QR dots -->
                <rect x="42" y="15" width="6" height="6" fill="#0B1B3A"/>
                <rect x="52" y="25" width="6" height="6" fill="#0B1B3A"/>
                <rect x="42" y="35" width="6" height="6" fill="#0B1B3A"/>
                <rect x="40" y="55" width="6" height="6" fill="#0B1B3A"/>
                <rect x="52" y="65" width="6" height="6" fill="#0B1B3A"/>
                <rect x="65" y="45" width="6" height="6" fill="#0B1B3A"/>
                <rect x="75" y="55" width="6" height="6" fill="#0B1B3A"/>
                <rect x="85" y="75" width="6" height="6" fill="#0B1B3A"/>
              </svg>
              <div style="font-size: 0.72rem; font-weight: 800; color: var(--navy); margin-top: 4px;">UPI ID: 9243791529@upi</div>
            </div>

            <p style="font-size: 0.75rem; color: #15803D; font-weight: bold; margin: 0;">
              Scan QR or Click button below to complete payment
            </p>
          </div>

          <button id="simSuccessBtn" class="btn-primary" style="width: 100%; font-size: 1.15rem; background: #22C55E; color: white; margin-bottom: 10px;">
            ✔ Complete UPI Payment (₹39) <span>→</span>
          </button>
        </div>

        <!-- Cards Tab Content -->
        <div id="cardTabContent" style="display: none;">
          <div style="margin-bottom: 14px;">
            <label style="font-size: 0.8rem; font-weight: bold; color: var(--navy); display: block; margin-bottom: 4px;">Card Number</label>
            <input type="text" class="form-input" placeholder="4532 •••• •••• 8892" value="4532 8891 0293 8892" style="font-family: monospace;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
            <div>
              <label style="font-size: 0.8rem; font-weight: bold; color: var(--navy); display: block; margin-bottom: 4px;">Expiry</label>
              <input type="text" class="form-input" placeholder="MM/YY" value="08/28" style="font-family: monospace;">
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: bold; color: var(--navy); display: block; margin-bottom: 4px;">CVV</label>
              <input type="password" class="form-input" placeholder="•••" value="892" style="font-family: monospace;">
            </div>
          </div>
          <button id="simCardPayBtn" class="btn-primary" style="width: 100%; font-size: 1.15rem; background: #2563EB; color: white; margin-bottom: 10px;">
            🔒 Pay ₹39 with Card <span>→</span>
          </button>
        </div>

        <button id="simCancelBtn" style="width: 100%; background: none; border: none; color: #64748B; font-size: 0.82rem; cursor: pointer; text-decoration: underline;">
          Cancel and return
        </button>

        <div style="margin-top: 14px; border-top: 1px dashed #CBD5E1; padding-top: 10px; font-size: 0.72rem; color: #64748B; text-align: center;">
          <span>💡 Live Gateway Mode: Set <code>RAZORPAY_KEY_ID</code> & <code>RAZORPAY_KEY_SECRET</code> in .env</span>
        </div>
      </div>
    `;

    // Tab switcher
    const tabUpi = document.getElementById('tabUpi');
    const tabCard = document.getElementById('tabCard');
    const upiContent = document.getElementById('upiTabContent');
    const cardContent = document.getElementById('cardTabContent');

    tabUpi.addEventListener('click', () => {
      tabUpi.style.borderColor = 'var(--navy)';
      tabUpi.style.background = '#FFF9D2';
      tabUpi.style.color = 'var(--navy)';
      tabCard.style.borderColor = '#CBD5E1';
      tabCard.style.background = '#FFFFFF';
      tabCard.style.color = '#64748B';
      upiContent.style.display = 'block';
      cardContent.style.display = 'none';
    });

    tabCard.addEventListener('click', () => {
      tabCard.style.borderColor = 'var(--navy)';
      tabCard.style.background = '#FFF9D2';
      tabCard.style.color = 'var(--navy)';
      tabUpi.style.borderColor = '#CBD5E1';
      tabUpi.style.background = '#FFFFFF';
      tabUpi.style.color = '#64748B';
      cardContent.style.display = 'block';
      upiContent.style.display = 'none';
    });

    async function executeVerification(payId) {
      const btn = document.getElementById('simSuccessBtn') || document.getElementById('simCardPayBtn');
      if (btn) {
        btn.textContent = 'Verifying Transaction... 🔒';
        btn.disabled = true;
      }

      try {
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: orderData.razorpayOrderId,
            razorpay_payment_id: payId,
            razorpay_signature: 'test_simulation_signature',
            isTestSimulation: true
          })
        });

        const verifyData = await verifyRes.json();
        if (verifyRes.ok && verifyData.success) {
          trackAnalyticsEvent('Purchase', { orderId: verifyData.orderId, value: 39, currency: 'INR' });
          window.location.href = `/success?token=${verifyData.downloadToken}&orderId=${verifyData.orderId}`;
        } else {
          alert('Verification failed: ' + verifyData.error);
        }
      } catch (err) {
        alert('Server error: ' + err.message);
      }
    }

    document.getElementById('simSuccessBtn').addEventListener('click', () => {
      executeVerification(`pay_upi_${Date.now()}`);
    });

    document.getElementById('simCardPayBtn').addEventListener('click', () => {
      executeVerification(`pay_card_${Date.now()}`);
    });

    document.getElementById('simCancelBtn').addEventListener('click', () => {
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
