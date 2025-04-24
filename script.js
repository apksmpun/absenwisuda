const scriptURL = 'https://script.google.com/macros/s/AKfycbzkZn2gGJ_p_DvPW2Pm2midinuMvN97iaWpj0_uyyBX5B0Co6mW57yFiH2TzbbPGP1kWQ/exec';
const form = document.getElementById('dataForm');
const statusText = document.getElementById('status');
const namaInput = document.getElementById('nama');
const suggestionBox = document.getElementById('suggestions');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnSpinner = document.getElementById('btnSpinner');

let namaSiswa = [];
let riwayatAbsen = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch(scriptURL)
    .then(res => res.json())
    .then(data => {
      namaSiswa = data.siswa;
      riwayatAbsen = data.absensi;
    })
    .catch(err => console.error("Gagal ambil data:", err));
});

namaInput.addEventListener("input", () => {
  const input = namaInput.value.toLowerCase();
  suggestionBox.innerHTML = "";
  if (!input) return suggestionBox.classList.add("hidden");

  const matches = namaSiswa.filter(n => n.toLowerCase().includes(input)).slice(0, 5);
  matches.forEach(match => {
    const div = document.createElement("div");
    div.textContent = match;
    div.className = "px-4 py-2 cursor-pointer hover:bg-blue-100";
    div.onclick = () => {
      namaInput.value = match;
      suggestionBox.classList.add("hidden");
    };
    suggestionBox.appendChild(div);
  });

  suggestionBox.classList.toggle("hidden", matches.length === 0);
});

document.addEventListener("click", e => {
  if (!suggestionBox.contains(e.target) && e.target !== namaInput) {
    suggestionBox.classList.add("hidden");
  }
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const formData = new FormData(form);
  const nama = formData.get("nama").toLowerCase();
  const orangTua = formData.get("orangTua").toLowerCase();

  // Cek duplikat: hanya dilarang jika nama + orangTua sama
  const sudahAbsen = riwayatAbsen.some(item =>
    item.nama.toLowerCase() === nama && item.orangTua.toLowerCase() === orangTua
  );

  if (sudahAbsen) {
    Swal.fire({
      icon: 'warning',
      title: 'Sudah Absen!',
      text: `${formData.get("orangTua")} ${formData.get("nama")} sudah absen sebelumnya.`,
      confirmButtonColor: '#f59e0b'
    });
    return;
  }

  // Tampilkan spinner
  submitBtn.disabled = true;
  btnText.textContent = "Mengirim...";
  btnSpinner.classList.remove("hidden");

  fetch(scriptURL, {
    method: 'POST',
    body: formData
  })
  .then(() => {
    Swal.fire({
      icon: 'success',
      title: 'Alhamdulillah',
      text: `${formData.get("orangTua")} ${formData.get("nama")} sudah absen.`,
      confirmButtonColor: '#3085d6'
    });
    form.reset();
    riwayatAbsen.push({ nama, orangTua }); // Tambahkan ke data lokal agar tidak bisa dobel
  })
  .catch(() => {
    Swal.fire({
      icon: 'error',
      title: 'Oops!',
      text: 'Gagal mengirim data. Coba lagi ya!',
      confirmButtonColor: '#e3342f'
    });
  })
  .finally(() => {
    submitBtn.disabled = false;
    btnText.textContent = "Kirim";
    btnSpinner.classList.add("hidden");
  });
});
