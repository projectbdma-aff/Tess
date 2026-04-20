const fetch = require('node-fetch');

module.exports = async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ error: "No image provided" });

        const imgResponse = await fetch("https://api.koboillm.com/v1/images/edits", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.KOBO_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-image-1",
                prompt: "Professional marketplace product photography, clean studio background, high quality lighting",
                image: image.split(",")[1],
                size: "1024x1024"
            })
        });

        const imgJson = await imgResponse.json();
        const finalImageUrl = imgJson.data?.[0]?.url || 
                             (imgJson.data?.[0]?.b64_json ? `data:image/png;base64,${imgJson.data[0].b64_json}` : null);

        if (!finalImageUrl) throw new Error("API tidak mengirim balik gambar");
        res.json({ image: finalImageUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
