// Konfigurasi Elemen
const imageInput = document.getElementById("imageInput");
const previewBox = document.getElementById("previewBox");
const previewImg = document.getElementById("preview");
const loadingOverlay = document.getElementById("loadingOverlay");

/**
 * Fungsi Utama Generate
 */
async function generate() {
    const file = imageInput.files[0];
    if (!file) return alert("Silakan pilih foto terlebih dahulu!");

    // Tampilkan UI Loading
    previewBox.style.display = "block";
    loadingOverlay.style.display = "flex";
    previewImg.style.opacity = "0.3";

    try {
        // 1. Konversi ke Base64 & Resize agar ringan
        const base64 = await toBase64(file);
        const optimizedImage = await resizeImage(base64);

        // 2. Kirim ke Backend (Netlify Function)
        const response = await fetch("/.netlify/functions/ai-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: optimizedImage })
        });

        const data = await response.json();

        // 3. Tangani Hasil
        if (data.image) {
            previewImg.src = data.image; // Isi gambar dengan hasil AI
            previewImg.style.opacity = "1";
        } else {
            throw new Error(data.error || "Gagal memproses gambar.");
        }
    } catch (error) {
        alert("Error: " + error.message);
        previewBox.style.display = "none";
    } finally {
        loadingOverlay.style.display = "none";
    }
}

/**
 * Fungsi Download
 */
function downloadImage() {
    if (!previewImg.src || previewImg.src === "" || previewImg.src.includes(window.location.hostname)) {
        return alert("Belum ada hasil generate untuk diunduh.");
    }

    const link = document.createElement("a");
    link.href = previewImg.src;
    link.download = `PixelForge_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Helper: Convert File ke Base64
 */
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Helper: Resize Gambar (Mencegah Error Payload Too Large)
 */
function resizeImage(base64Str, maxWidth = 1024) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
    });
}
