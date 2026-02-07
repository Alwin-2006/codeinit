const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// Gives sstatic files from root
app.use(express.static(__dirname));
app.use(express.json());

app.use('/api', require('./routes/apiRoutes'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})