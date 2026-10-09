// Admin Panel Logic
document.addEventListener('DOMContentLoaded', () => {
  const loginBox = document.getElementById('loginBox');
  const dashboardBox = document.getElementById('dashboardBox');
  const loginForm = document.getElementById('adminLoginForm');
  const passwordInput = document.getElementById('adminPasswordInput');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const refreshBtn = document.getElementById('refreshBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const searchInput = document.getElementById('orderSearchInput');

  let currentOrders = [];

  // Check saved password in sessionStorage
  const savedPass = sessionStorage.getItem('tu_admin_pass');
  if (savedPass) {
    verifyAndLoad(savedPass);
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = passwordInput.value.trim();
    if (!pass) return;
    await verifyAndLoad(pass);
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('tu_admin_pass');
    loginBox.style.display = 'block';
    dashboardBox.style.display = 'none';
    passwordInput.value = '';
  });

  refreshBtn.addEventListener('click', () => {
    const pass = sessionStorage.getItem('tu_admin_pass');
    if (pass) fetchOrders(pass);
  });

  exportCsvBtn.addEventListener('click', () => {
    const pass = sessionStorage.getItem('tu_admin_pass');
    if (pass) {
      window.location.href = `/api/admin/export-csv?password=${encodeURIComponent(pass)}`;
    }
  });

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    if (!term) {
      renderOrders(currentOrders);
      return;
    }
    const filtered = currentOrders.filter(o => {
      return (o.name || '').toLowerCase().includes(term) ||
             (o.email || '').toLowerCase().includes(term) ||
             (o.phone || '').includes(term) ||
             (o.id || '').toLowerCase().includes(term) ||
             (o.razorpayPaymentId || '').toLowerCase().includes(term);
    });
    renderOrders(filtered);
  });

  async function verifyAndLoad(password) {
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('tu_admin_pass', password);
        loginBox.style.display = 'none';
        dashboardBox.style.display = 'block';
        fetchOrders(password);
      } else {
        loginError.textContent = data.error || 'Incorrect admin password.';
        loginError.style.display = 'block';
      }
    } catch (err) {
      loginError.textContent = 'Connection error: ' + err.message;
      loginError.style.display = 'block';
    }
  }

  async function fetchOrders(password) {
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'x-admin-password': password }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        currentOrders = data.orders || [];
        updateMetrics(data.summary);
        renderOrders(currentOrders);
      } else {
        alert(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error(err);
    }
  }

  function updateMetrics(summary) {
    if (!summary) return;
    document.getElementById('metricTotalOrders').textContent = summary.totalOrders || 0;
    document.getElementById('metricPaidOrders').textContent = summary.paidOrders || 0;
    document.getElementById('metricRevenue').textContent = `₹${summary.totalRevenue || 0}`;
    document.getElementById('metricDownloads').textContent = summary.totalDownloads || 0;
  }

  function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    if (!orders || orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94A3B8; padding: 24px;">Abhi tak koi order record nahi hai.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : '-';
      const statusClass = o.status === 'paid' ? 'status-paid' : (o.status === 'failed' ? 'status-failed' : 'status-created');
      return `
        <tr>
          <td style="font-size: 0.82rem; color: #64748B;">${dateStr}</td>
          <td><strong>${escapeHtml(o.name || '-')}</strong></td>
          <td>
            <div>${escapeHtml(o.email || '-')}</div>
            <div style="font-size: 0.8rem; color: #64748B;">+91 ${escapeHtml(o.phone || '-')}</div>
          </td>
          <td><strong>₹${o.amount || 39}</strong></td>
          <td><span class="status-badge ${statusClass}">${o.status}</span></td>
          <td>${o.downloadCount || 0}</td>
          <td style="font-family: monospace; font-size: 0.8rem;">${o.razorpayPaymentId || '-'}</td>
        </tr>
      `;
    }).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
