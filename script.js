// ✅ Gantikan URL ini dengan URL Web App Apps Script anda
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxWTz3fY2LkAR8mzFvn2d25GhaExBFjhLQ2nXLMwv2c-lC6ULt70vwtgS1Zqz4xN-Gl/exec";
                          
document.addEventListener('DOMContentLoaded', () => {

  const bookingForm = document.getElementById('booking-form');
  const messageEl = document.getElementById('booking-message');
  const submitBtn = bookingForm.querySelector('.submit-btn');

  function setMessage(msg, isError = false) {
    messageEl.textContent = msg;
    messageEl.className =
      `mt-3 text-center text-sm font-bold ${isError ? 'text-red-400' : 'text-green-400'}`;
  }

  // ✅ Hantar Borang
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
      } else {
        throw new Error(result.message);
      }

    } catch (err) {
      setMessage('❌ ' + err.message, true);

    } finally {
      submitBtn.textContent = 'HANTAR REKOD PINJAMAN';
      submitBtn.disabled = false;
    }
  });


  // ✅ SWITCH TAB
  const tabBooking = document.getElementById('tab-booking');
  const tabStatus = document.getElementById('tab-status');
  const contentBooking = document.getElementById('tab-booking-content');
  const contentStatus = document.getElementById('tab-status-content');

  function switchTab(page) {
    if (page === 'booking') {
      contentBooking.classList.add('active');
      contentStatus.classList.remove('active');
    } else {
      contentStatus.classList.add('active');
      contentBooking.classList.remove('active');
      loadStatus();
    }
  }

  tabBooking.addEventListener('click', () => switchTab('booking'));
  tabStatus.addEventListener('click', () => switchTab('status'));

  // ✅ LOAD STATUS FROM GOOGLE SHEET
  async function loadStatus() {
    const container = document.getElementById('status-container');
    container.innerHTML = `<p class="text-gray-300">Memuatkan...</p>`;

    try {
      const response = await fetch(APPS_SCRIPT_URL);
      const result = await response.json();

      if (!result.data || result.data.length === 0) {
        container.innerHTML = `<p class="text-gray-300 text-center">Tiada rekod pinjaman.</p>`;
        return;
      }

      container.innerHTML = "";

      result.data.forEach(item => {
        const card = document.createElement('div');
        card.className = "drone-card";

        card.innerHTML = `
          <p class="text-xl font-bold">
              <span class="label-badge">Nama Peminjam :</span>${item.NamaPeminjam}
          </p>
          <p class="text-gray-300 text-sm">
              <span class="label-badge">Drone Model :</span> ${item.DroneModel} •
              <span class="label-badge">Site (Peminjam) :</span> ${item.SitePeminjam} •
              <span class="label-badge">Lokasi Penerbangan :</span> ${item.LokasiPenerbangan}
          </p>
          <p class="text-gray-300 text-sm">
              <span class="label-badge">Tarikh Ambil :</span> ${item.TarikhAmbil} •
              <span class="label-badge">Masa Ambil :</span> ${item.MasaAmbil}
          </p>
          <p class="text-gray-300 text-sm">
              <span class="label-badge">Tujuan Penerbangan :</span> ${item.TujuanPenerbangan}
          </p>
          <span class="status-badge status-pending mt-2 inline-block">Pinjam</span>
        `;

        container.appendChild(card);
      });

    } catch (err) {
      container.innerHTML =
        `<p class="text-red-400 text-center">Ralat memuat data: ${err.message}</p>`;
    }
  }

});
