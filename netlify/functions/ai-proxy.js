const fetch = require('node-fetch'); // Pastikan node-fetch terinstall atau gunakan global fetch jika di Node 18+

exports.handler = async (event) => {
  // Tambahkan Header CORS agar bisa dipanggil dari frontend
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };

  try {
    const { image } = JSON.parse(event.body);
    if (!image) throw new Error("No image data provided");

    // =====================
    // STEP 1: ANALISA GPT-4o
    // =====================
    const analysis = await fetch("https://api.koboillm.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.KOBO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analyze this product and return JSON only: {\"name\": \"\", \"tagline\": \"\", \"benefits\": [\"\",\"\",\"\"]}" },
            { type: "image_url", image_url: { url: image } }
          ]
        }]
      })
    });

    const aJson = await analysis.json();
    let content = aJson.choices[0].message.content;
    
    // Bersihkan Markdown jika ada (misal ```json ... ```)
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    let data;
    try {
      data = JSON.parse(content);
    } catch (e) {
      data = {
        name: "Produk Unggulan",
        tagline: "Kualitas Premium Terbaik",
        benefits: ["Desain Modern", "Material Berkualitas", "Harga Terjangkau"]
      };
    }

    // =====================
    // STEP 2: IMAGE GENERATE
    // =====================
    const promptAd = `Professional marketplace advertisement for ${data.name}. ${data.tagline}. Clean background, studio lighting.`;

    const imgResponse = await fetch("https://api.koboillm.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.KOBO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: promptAd,
        image: image.split(",")[1], // Ambil base64-nya saja
        size: "1024x1024"
      })
    });

    const imgJson = await imgResponse.json();

    // Logika penanganan output gambar yang lebih aman
    let finalImageUrl = "";
    if (imgJson.data && imgJson.data[0]) {
      if (imgJson.data[0].url) {
        finalImageUrl = imgJson.data[0].url;
      } else if (imgJson.data[0].b64_json) {
        finalImageUrl = `data:image/png;base64,${imgJson.data[0].b64_json}`;
      }
    }

    if (!finalImageUrl) {
      throw new Error("API tidak mengembalikan gambar: " + JSON.stringify(imgJson));
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ image: finalImageUrl })
    };

  } catch (err) {
    console.error("Backend Error:", err.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
