const express = require('express');
const app = express();

// WICHTIG: Loggen, dass wir leben
console.log("--- STARTUP TEST ---");

app.get('/', (req, res) => {
    res.send('Der Server lebt! 🚀');
});

const PORT = process.env.PORT || 8080;
// Hört auf 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
