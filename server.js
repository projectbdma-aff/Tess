const express = require('express');
const path = require('path');
const aiProxy = require('./api/ai-proxy');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

app.post('/api/ai-proxy', aiProxy);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
