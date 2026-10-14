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

      // Check if real Cashfree or simulation mode
      if (data.isSimulation || !data.paymentSessionId) {
        // Run test / UPI QR simulator modal
        handleTestPaymentSimulation(data);
      } else {
        // Open Real Cashfree Checkout Modal
        openCashfreeCheckout(data);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert(err.message || 'Payment start karne mein problem aayi. Kripya dobara try karein.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  // Real Cashfree Checkout Handler
  async function openCashfreeCheckout(orderData) {
    if (!window.Cashfree) {
      await loadCashfreeSdk();
    }

    if (!window.Cashfree) {
      console.warn('Cashfree SDK unavailable, falling back to UPI QR simulation.');
      handleTestPaymentSimulation(orderData);
      return;
    }

    try {
      const mode = (orderData.environment && orderData.environment.toLowerCase() === 'prod') 
        ? 'production' 
        : 'sandbox';
      
      const cashfree = window.Cashfree({ mode });
      
      cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_modal'
      }).then(async (result) => {
        if (result.error) {
          console.warn('Cashfree modal error or closed:', result.error);
          if (result.error.message && !result.error.message.includes('closed') && !result.error.message.includes('dismissed')) {
            alert('Payment notification: ' + result.error.message);
          }
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Proceed to Pay – ₹39 <span>→</span>';
          return;
        }

        if (result.redirect) {
          // Cashfree handles page redirect
          return;
        }

        submitBtn.innerHTML = '<span>Verifying Payment... 🔒</span>';
        await verifyCashfreeOrder(orderData.cashfreeOrderId);
      });
    } catch (err) {
      console.error('Cashfree checkout modal error:', err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Proceed to Pay – ₹39 <span>→</span>';
      alert('Cashfree window open nahi ho payi: ' + err.message);
    }
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

  // PhonePe UPI QR & Instant Payment Flow
  function handleTestPaymentSimulation(orderData) {
    const modalContent = document.querySelector('.modal-card');
    const upiId = '9243791529@axl';
    const upiLink = `upi://pay?pa=${upiId}&pn=Think%20Unlimited&am=39&cu=INR&tn=Class%2010%20Maths%20Ebook`;

    modalContent.innerHTML = `
      <div style="position: relative;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid var(--navy); padding-bottom: 12px; margin-bottom: 14px;">
          <div>
            <div style="font-size: 0.72rem; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.05em;">
              ✔ Verified UPI Gateway
            </div>
            <div style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 900; color: var(--navy);">
              Scan & Pay ₹39
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; color: #64748B;">Payable Amount</div>
            <div style="font-size: 1.45rem; font-weight: 900; color: var(--navy); line-height: 1;">₹39</div>
          </div>
        </div>

        <!-- Buyer Info Chip -->
        <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; padding: 6px 10px; margin-bottom: 14px; font-size: 0.8rem; display: flex; justify-content: space-between; flex-wrap: wrap;">
          <span><strong>Student:</strong> ${escapeHtml(orderData.prefill?.name || orderData.customer?.name || 'Student')}</span>
          <span><strong>WhatsApp:</strong> +91 ${escapeHtml(orderData.prefill?.contact || orderData.customer?.phone || '')}</span>
        </div>

        <!-- PhonePe QR Code Container -->
        <div style="background: #FFFDF5; border: 2.5px solid var(--navy); box-shadow: 4px 4px 0 var(--navy); border-radius: 12px; padding: 16px; margin-bottom: 16px; text-align: center;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 10px;">
            <span style="font-size: 0.82rem; font-weight: 800; color: #5f259f; background: #F3E8FF; padding: 3px 10px; border-radius: 20px; border: 1px solid #5f259f;">
              PhonePe / GPay / Paytm QR
            </span>
          </div>

          <div style="background: white; border: 2px solid var(--navy); border-radius: 10px; padding: 10px; display: inline-block; box-shadow: 2px 2px 0 var(--navy); margin-bottom: 10px;">
            <img src="/images/upi-qr.png" alt="PhonePe UPI QR Code" style="width: 200px; height: 200px; display: block; object-fit: contain; border-radius: 6px;">
          </div>

          <!-- UPI ID Copy Box -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; background: #FFF9D2; border: 1.5px dashed var(--navy); border-radius: 8px; padding: 8px 12px; max-width: 320px; margin: 0 auto 12px;">
            <div style="font-size: 0.85rem; font-weight: 800; font-family: monospace; color: var(--navy);">
              ${upiId}
            </div>
            <button type="button" id="copyUpiBtn" style="background: var(--navy); color: white; border: none; padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; cursor: pointer;">
              Copy ID
            </button>
          </div>

          <!-- Direct Mobile Pay Button -->
          <a href="${upiLink}" class="btn-primary" style="display: block; width: 100%; text-decoration: none; padding: 10px; font-size: 1rem; background: #5f259f; color: white; border-color: var(--navy); margin-bottom: 10px; box-shadow: 3px 3px 0 var(--navy);">
            📱 Open in PhonePe / GPay / Paytm (₹39)
          </a>

          <div style="font-size: 0.75rem; color: #475569;">
            Kisi bhi UPI app se QR scan karke <strong>₹39</strong> pay karein
          </div>
        </div>

        <!-- UTR / Reference Entry -->
        <div style="background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 8px; padding: 12px; margin-bottom: 14px;">
          <label for="utrInput" style="display: block; font-size: 0.8rem; font-weight: 800; color: var(--navy); margin-bottom: 4px;">
            Payment UTR / Ref No. (Optional):
          </label>
          <input type="text" id="utrInput" class="form-input" placeholder="e.g. 429188291028 ya screenshot reference" style="font-size: 0.85rem; padding: 8px 10px; margin-bottom: 10px;">
          
          <button type="button" id="confirmPaymentBtn" class="btn-primary" style="width: 100%; font-size: 1.15rem; background: #22C55E; color: white; box-shadow: 4px 4px 0 var(--navy);">
            ✔ Payment Done – Download PDF Now 📥
          </button>
        </div>

        <button type="button" id="cancelUpiModalBtn" style="width: 100%; background: none; border: none; color: #64748B; font-size: 0.8rem; cursor: pointer; text-decoration: underline;">
          ← Wapas jaayein
        </button>
      </div>
    `;

    // Copy UPI ID button handler
    const copyBtn = document.getElementById('copyUpiBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(upiId).then(() => {
          copyBtn.textContent = 'Copied! ✔';
          copyBtn.style.background = '#15803D';
          setTimeout(() => {
            copyBtn.textContent = 'Copy ID';
            copyBtn.style.background = 'var(--navy)';
          }, 2500);
        }).catch(() => {
          prompt('UPI ID copy karein:', upiId);
        });
      });
    }

    // Cancel / Back button
    const cancelBtn = document.getElementById('cancelUpiModalBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        closeModal();
        window.location.reload();
      });
    }

    // Confirm Payment & Get PDF Handler
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', async () => {
        const utrVal = document.getElementById('utrInput').value.trim();
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span>Verifying & Generating Link... 🔒</span>';

        try {
          const verifyOrderId = orderData.cashfreeOrderId || orderData.orderId || orderData.razorpayOrderId;
          const verifyRes = await fetch('/api/cashfree/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: verifyOrderId,
              utr_number: utrVal || `UPI_${Date.now()}`,
              isSimulation: true
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            trackAnalyticsEvent('Purchase', { 
              orderId: verifyData.orderId, 
              value: 39, 
              currency: 'INR',
              method: 'UPI' 
            });
            window.location.href = `/success?token=${verifyData.downloadToken}&orderId=${verifyData.orderId}`;
          } else {
            alert('Verification issue: ' + (verifyData.error || 'Please try again.'));
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '✔ Payment Done – Download PDF Now 📥';
          }
        } catch (err) {
          alert('Network issue: ' + err.message);
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = '✔ Payment Done – Download PDF Now 📥';
        }
      });
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
