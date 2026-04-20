// PixelForge AI Backend (KoboLLM)

exports.handler = async (event) => {
  try {
    const { image } = JSON.parse(event.body);

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
            { type: "text", text: `Analyze this product and return JSON:
{
"name": "",
"tagline": "",
"benefits": ["","",""]
}`},
            { type: "image_url", image_url: { url: image } }
          ]
        }]
      })
    });

    const aJson = await analysis.json();

    let data;
    try {
      data = JSON.parse(aJson.choices[0].message.content);
    } catch {
      data = {
        name: "Produk Premium",
        tagline: "Kualitas terbaik",
        benefits: ["Desain menarik","Nyaman","Tahan lama"]
      };
    }

    // =====================
    // STEP 2: IMAGE GENERATE
    // =====================
    const prompt = `
Edit this product image.

STRICT:
- Keep product EXACTLY same
- Do NOT change shape or color

IMPROVE:
- lighting
- sharpness
- background clean

ADD TEXT:
${data.name}
${data.tagline}

Benefits:
- ${data.benefits[0]}
- ${data.benefits[1]}
- ${data.benefits[2]}

Style:
- marketplace ads
- clean modern
`;

    const img = await fetch("https://api.koboillm.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.KOBO_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt,
        image: image.split(",")[1],
        size: "1024x1024"
      })
    });

    const imgJson = await img.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        image: imgJson.data?.[0]?.url ||
               `data:image/png;base64,${imgJson.data?.[0]?.b64_json}`
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
