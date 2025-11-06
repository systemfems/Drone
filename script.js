// ----------------------------
// KONFIGURASI
// ----------------------------
// GANTIKAN DENGAN URL APPS SCRIPT BARU ANDA DARI LANGKAH 2
// Pastikan anda menggunakan URL deployment (berakhir dengan /exec)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyOGPiCYenVtbDL0LX6BMUd3pmRKid4PveJbe5vaj1fzGsMYNtgr9WkgZLhPkHHXXspjA/exec";

// ----------------------------
// FUNGSI UTAMA
// ----------------------------
document.addEventListener('DOMContentLoaded', ( ) => {
  const bookingForm = document.getElementById('booking-form');
  const messageEl = document.getElementById('booking-message');
  const submitBtn = bookingForm.querySelector('.submit-btn');

  // Fungsi untuk memaparkan mesej
  function setMessage(msg, isError = false) {
    messageEl.textContent = msg;
    messageEl.className = `mt-3 text-center text-sm font-bold ${isError ? 'text-red-400' : 'text-green-400'}`;
  }

  // Apabila borang dihantar...
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Halang borang dari refresh halaman

    // Tukar teks butang dan paparkan mesej menunggu
    submitBtn.textContent = 'Menghantar...';
    submitBtn.disabled = true;
    setMessage('Sila tunggu, menghantar data ke Google Sheet...');

    // Dapatkan semua data dari borang
    const formData = new FormData(bookingForm);
    const data = Object.fromEntries(formData.entries());

    try {
      // Hantar data ke Apps Script
      const response = await fetch(APPS_SCRIPT_URL, {
        // Mesti guna 'POST' (bukan 'doPOST')
        method: 'POST', 
        // 🔑 PENYELESAIAN CORS: Guna text/plain untuk mengelakkan preflight request
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
        body: JSON.stringify(data),
        redirect: 'follow' 
      });

      // Semak sama ada respons itu berjaya (cth: status 200)
      if (!response.ok) {
          throw new Error(`Ralat HTTP: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Semak hasil yang diterima dari Apps Script
      if (result.status === 'success') {
        setMessage('✅ ' + result.message); // Papar mesej kejayaan
        bookingForm.reset(); // Kosongkan borang
      } else {
        // Jika Apps Script mengembalikan status 'error'
        throw new Error(result.message); 
      }
    } catch (err) {
      // Tangkap sebarang ralat (cth: 'Failed to fetch' atau ralat dari Apps Script)
      setMessage(`❌ Ralat: ${err.message}`, true);
    } finally {
      // Kembalikan butang kepada keadaan asal
      submitBtn.textContent = 'HANTAR REKOD PINJAMAN KE GOOGLE SHEET';
      submitBtn.disabled = false;
    }
  });
});