// PixelForge AI Frontend

const previewBox = document.getElementById("previewBox");
const preview = document.getElementById("preview");
const loading = document.getElementById("loading");

// ===== MAIN GENERATE =====
async function generate() {
  const file = document.getElementById("imageInput").files[0];
  if (!file) return alert("Upload gambar dulu");

  const base64 = await toBase64(file);
  const optimized = await resizeImage(base64);

  previewBox.style.display = "block";
  loading.style.display = "flex";

  const res = await fetch("/.netlify/functions/ai-proxy", {
    method: "POST",
    body: JSON.stringify({ image: optimized })
  });

  const data = await res.json();

  loading.style.display = "none";

  if (data.image) {
    preview.src = data.image;
  } else {
    alert("Error: " + data.error);
  }
}

// ===== BASE64 =====
function toBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// ===== RESIZE =====
function resizeImage(base64) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let max = 1024;
      let w = img.width;
      let h = img.height;

      if (w > h && w > max) {
        h *= max / w;
        w = max;
      } else if (h > max) {
        w *= max / h;
        h = max;
      }

      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);

      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
  });
}

// ===== DOWNLOAD =====
function downloadImage() {
  const a = document.createElement("a");
  a.href = preview.src;
  a.download = "hasil-ai.png";
  a.click();
}