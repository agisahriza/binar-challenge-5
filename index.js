const express = require('express');
const app = express();
const router = require('./routes/route');

require('dotenv').config();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.use('/', router);

if (!module.parent) {
  const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });

  module.exports = server; // Export instance server Express
}
