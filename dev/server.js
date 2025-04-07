const express = require('express');
const path = require('path');

const app = express();
const port = 5000;
const folder = path.join(__dirname, 'public'); // Ordner anpassen

app.use(express.static(folder));

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
