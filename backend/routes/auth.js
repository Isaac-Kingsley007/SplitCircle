import { Router } from 'express';
import sql from '../db/db.js';
import bcrypt from 'bcryptjs';
import * as z from "zod"; 

const router = Router();

const userNamePasswordSchema = z.object({
    user_name: z.string().trim().min(5).max(255).regex(/^[a-zA-Z0-9_]+$/),
    password: z.string().trim().min(8).max(255)
});

router.get('/is_authenticated', (req, res) => {
    res.json({
        data: !!req.session.userId
    })
});

router.post('/signup', async (req, res) => {
    
    const validation = userNamePasswordSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({success: false, error: validation.error.errors.map(e => e.message).join(', ') });
    }

    const { user_name, password } = validation.data;

    
    const existingUser = await sql`SELECT * FROM users WHERE user_name = ${user_name}`;
    if (existingUser.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await sql`INSERT INTO users (user_name, password) values (${user_name}, ${hashedPassword});`;

    res.json({
        success: true,
        message: "Created New User"
    });
});

router.post('/signin', async (req, res) => {
    const validation = userNamePasswordSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({success: false, error: validation.error.errors.map(e => e.message).join(', ') });
    }

    const { user_name, password } = validation.data;

    const users = await sql`SELECT * FROM users WHERE user_name = ${user_name}`;

    if (users.length === 0) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }

    const user = users[0];

    if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ error: 'Invalid username or password' });
    }

    req.session.userId = user.user_id;

    return res.json({
        success: true,
        message: "Signed In Successfully"
    })
});

router.post('/signout', (req, res) => {
    req.session.destroy(err => {
        if(err){
            throw err;
        }
        res.clearCookie('connect.sid');
    });

    return res.json({
        success: true,
        message: "Signed Out Successfully"
    });
});