// Gantikan dengan Web App URL anda (berakhir /exec)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwuILmKqqeVaagrSu3SM3WRZdpNgMS_ZBTDVEHZulh8hPYWgpk7vjLOuodF701UUpI7BA/exec";

document.addEventListener('DOMContentLoaded', () => {

  const bookingForm = document.getElementById('booking-form');
  const messageEl = document.getElementById('booking-message');
  const submitBtn = bookingForm.querySelector('.submit-btn');

  function setMessage(msg, isError = false) {
    messageEl.textContent = msg;
    messageEl.className =
      `mt-3 text-center text-sm font-bold ${isError ? 'text-red-400' : 'text-green-400'}`;
  }

  // Submit pinjaman baru
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.textContent = 'Menghantar...';
    submitBtn.disabled = true;
    setMessage('Sila tunggu, menghantar data...');

    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      if (result.status === 'success') {
        setMessage('✅ ' + result.message);
        bookingForm.reset();
        // refresh status so new loan appears
        loadStatus();
      } else {
        throw new Error(result.message || 'Response error');
      }
    } catch (err) {
      setMessage('❌ ' + err.message, true);
    } finally {
      submitBtn.textContent = 'HANTAR REKOD PINJAMAN';
      submitBtn.disabled = false;
    }
  });

  // TAB SWITCH (pastikan class active toggle)
  const tabBooking = document.getElementById('tab-booking');
  const tabStatus = document.getElementById('tab-status');
  const contentBooking = document.getElementById('tab-booking-content');
  const contentStatus = document.getElementById('tab-status-content');

  function activateTab(tab) {
    if (tab === 'booking') {
      contentBooking.classList.add('active');
      contentStatus.classList.remove('active');
      tabBooking.classList.add('active');
      tabStatus.classList.remove('active');
    } else {
      contentBooking.classList.remove('active');
      contentStatus.classList.add('active');
      tabBooking.classList.remove('active');
      tabStatus.classList.add('active');
      loadStatus();
    }
  }

  tabBooking.addEventListener('click', () => activateTab('booking'));
  tabStatus.addEventListener('click', () => activateTab('status'));

  // Load status records
  async function loadStatus() {
    const container = document.getElementById('status-container');
    container.innerHTML = `<p class="text-gray-300">Memuatkan...</p>`;

    try {
      const res = await fetch(APPS_SCRIPT_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (!result.data || result.data.length === 0) {
        container.innerHTML = `<p class="text-gray-300 text-center">Tiada rekod pinjaman.</p>`;
        return;
      }

      // Hanya paparkan yang Status === "Sedang Digunakan"
      const active = result.data.filter(d => (d.Status || "").toLowerCase() === "sedang digunakan");
      // Tunjuk terbaru di atas
      const list = [...active].reverse();

      container.innerHTML = "";
      list.forEach(item => {
        const card = document.createElement('div');
        card.className = "drone-card";

        card.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-bold mb-2">${escapeHtml(item.NamaPeminjam || "-")}</h3>
              <p class="text-gray-300 text-sm">
                <span class="label-badge">Site Peminjam:</span> ${escapeHtml(item.SitePeminjam || "-")} • 
                <span class="label-badge">Model Drone:</span> ${escapeHtml(item.DroneModel || "-")} •
                <span class="label-badge">Tarikh & Masa Ambil:</span> ${escapeHtml(item.TarikhAmbil || "-")},${escapeHtml(item.MasaAmbil || "-")}
              </p>
              <p class="text-gray-300 text-sm">
                <span class="label-badge">Lokasi Penerbangan:</span> ${escapeHtml(item.LokasiPenerbangan || "-")}
              </p>
              <p class="text-gray-300 text-sm">
                <span class="label-badge">Tujuan Penerbangan:</span> ${escapeHtml(item.TujuanPenerbangan || "-")}
              </p>
            </div>

            <div class="text-right">
              <div class="mb-2">
                <span class="status-badge status-pending">Sedang Digunakan</span>
              </div>

              <div>
                <button class="action-btn return-btn" data-row="${item.row}">PULANGKAN</button>
              </div>
            </div>
          </div>
        `;

        container.appendChild(card);
      });

      if (list.length === 0) {
        container.innerHTML = `<p class="text-gray-300 text-center">Tiada Pinjaman Aktif.</p>`;
      }

    } catch (err) {
      container.innerHTML = `<p class="text-red-400 text-center">Ralat: ${err.message}</p>`;
    }
  }

  // Global click listener for dynamic return buttons
  document.addEventListener('click', async (ev) => {
    const btn = ev.target.closest('.return-btn');
    if (!btn) return;

    const row = btn.getAttribute('data-row');
    if (!row) return alert('Row ID tidak ditemui.');

    // Confirm
    const ok = confirm('Sahkan: anda ingin menanda drone ini sebagai DIPULANGKAN?');
    if (!ok) return;

    // Disable button semasa request
    btn.disabled = true;
    btn.textContent = 'Memproses...';

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'return', row: row })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const resJson = await response.json();
      if (resJson.status === 'success') {
        alert('Berjaya: ' + (resJson.message || 'Drone dipulangkan.'));
        // reload status
        loadStatus();
      } else {
        throw new Error(resJson.message || 'Gagal mengemaskini');
      }
    } catch (err) {
      alert('Ralat: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = 'PULANGKAN';
    }
  });

  // small helper to escape HTML
  function escapeHtml(unsafe) {
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Load initial status if status tab active
  if (contentStatus.classList.contains('active')) {
    loadStatus();
  }

});
