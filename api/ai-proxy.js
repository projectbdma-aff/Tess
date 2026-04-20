// Vercel Serverless Function
export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { image } = req.body;
    if (!image) throw new Error("No image data provided");

    // STEP 1: ANALISA GPT-4o
    const analysis = await fetch("https://api.koboillm.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.KOBO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Analyze this product and return JSON: {\"name\": \"\", \"tagline\": \"\", \"benefits\": [\"\",\"\",\"\"]}" },
            { type: "image_url", image_url: { url: image } }
          ]
        }]
      })
    });

    const aJson = await analysis.json();
    let content = aJson.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let data;
    try {
      data = JSON.parse(content);
    } catch {
      data = { name: "Produk Premium", tagline: "Kualitas Terbaik", benefits: ["Eksklusif", "Awet", "Modern"] };
    }

    // STEP 2: IMAGE GENERATE
    const imgResponse = await fetch("https://api.koboillm.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.KOBO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-image-1",
        prompt: `Professional marketplace ads for ${data.name}. ${data.tagline}.`,
        image: image.split(",")[1],
        size: "1024x1024"
      })
    });

    const imgJson = await imgResponse.json();
    const finalImageUrl = imgJson.data?.[0]?.url || (imgJson.data?.[0]?.b64_json ? `data:image/png;base64,${imgJson.data[0].b64_json}` : null);

    if (!finalImageUrl) throw new Error("Gagal generate gambar");

    return res.status(200).json({ image: finalImageUrl });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
