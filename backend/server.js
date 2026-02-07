const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT=process.env.PORT || 3000;


app.use(express.json());

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})