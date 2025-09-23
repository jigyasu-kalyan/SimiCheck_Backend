const express = require('express');
const cors = require('cors');
const PrismaClient = require('./generated/prisma')
const prisma = new PrismaClient.PrismaClient();

const app = express();
const PORT = 8085;

app.use(cors());
app.use(express.json());

app.get('/',(req, res) => {
    res.json({message: "Hello from the SimiCheck backend!" });
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})