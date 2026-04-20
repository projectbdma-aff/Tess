// PixelForge AI Frontend
const previewBox = document.getElementById("previewBox");
const preview = document.getElementById("preview");
const loading = document.getElementById("loading");

async function generate() {
  const file = document.getElementById("imageInput").files[0];
  if (!file) return alert("Pilih file gambar terlebih dahulu");

  // 1. Persiapan: Reset tampilan lama
  preview.style.opacity = "0.3"; // Beri efek redup saat proses
  previewBox.style.display = "block";
  loading.style.display = "flex";

  try {
    const base64 = await toBase64(file);
    const optimized = await resizeImage(base64);

    // 2. Kirim ke API Proxy Netlify
    const res = await fetch("/.netlify/functions/ai-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: optimized })
    });

    const data = await res.json();
    loading.style.display = "none";

    // 3. Validasi hasil
    if (data.image) {
      preview.src = data.image; // Mengisi src dengan hasil AI
      preview.style.opacity = "1"; // Kembalikan ke terang
      console.log("Gambar berhasil dimuat");
    } else {
      throw new Error(data.error || "Gagal mendapatkan gambar dari AI");
    }
  } catch (err) {
    loading.style.display = "none";
    previewBox.style.display = "none";
    alert("Terjadi kesalahan: " + err.message);
  }
}

// ===== FUNGSI PENDUKUNG =====

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

function resizeImage(base64) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Batasi ukuran maksimal agar tidak berat saat upload dari HP
      let max = 1024;
      let w = img.width;
      let h = img.height;

      if (w > h && w > max) {
        h *= max / w; w = max;
      } else if (h > max) {
        w *= max / h; h = max;
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
  });
}

function downloadImage() {
  if (!preview.src || preview.src.includes(window.location.hostname)) {
    return alert("Belum ada gambar untuk didownload");
  }
  const a = document.createElement("a");
  a.href = preview.src;
  a.download = `PixelForge_${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
