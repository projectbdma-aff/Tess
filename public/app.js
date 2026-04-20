const previewBox = document.getElementById("previewBox");
const preview = document.getElementById("preview");
const loading = document.getElementById("loading");

async function generate() {
    const file = document.getElementById("imageInput").files[0];
    if (!file) return alert("Upload gambar dulu");

    const base64 = await toBase64(file);
    const optimized = await resizeImage(base64);

    previewBox.style.display = "block";
    loading.style.display = "flex";

    try {
        const res = await fetch("/api/ai-proxy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: optimized })
        });
        const data = await res.json();
        if (data.image) {
            preview.src = data.image;
        } else {
            alert("Error: " + (data.error || "Gagal memproses"));
        }
    } catch (e) {
        alert("Server Error: " + e.message);
    } finally {
        loading.style.display = "none";
    }
}

function toBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
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
            let max = 512; // Ukuran diperkecil agar lebih cepat
            let w = img.width, h = img.height;
            if (w > h && w > max) { h *= max / w; w = max; }
            else if (h > max) { w *= max / h; h = max; }
            canvas.width = w; canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
    });
}

function downloadImage() {
    const a = document.createElement("a");
    a.href = preview.src;
    a.download = "hasil-ai.png";
    a.click();
}
