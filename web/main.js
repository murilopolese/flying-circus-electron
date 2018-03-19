const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../src')));

const listener = app.listen(process.env.PORT || 8080, (e) => {
    console.log(`Server started at http://localhost:${listener.address().port}`);
});
