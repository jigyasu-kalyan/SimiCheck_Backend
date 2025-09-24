const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const PORT = 8085;

app.use(cors());
app.use(express.json());

app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
            },
        });

        res.status(201).json({ message: "User created successfully!", user: { id: newUser.id, email: newUser.email } });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Something went wrong creating the user." })
    }
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email }});
        if (!user) {
            return res.status(404).json({ error: "User not found."});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password."});
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email},
            process.env.JWT_SECRET,
            { expiresIn: '1h'}
        )

        res.status(200).json({ message: "Login successful!", token: token});
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Something went wrong during login."});
    }
})

app.get('/',(req, res) => {
    res.json({message: "Hello from the SimiCheck backend!" });
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})