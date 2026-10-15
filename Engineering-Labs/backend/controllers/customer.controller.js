import Customer from "../models/customer.model.js";
import bcrypt from 'bcrypt';
import generateToken from "../utils/generateToken.js";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const registerCustomer = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;

        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ error: "Missing a required field" });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        const existing = await Customer.findOne({ email });
        if (existing) {
            return res.status(409).json({ error: "Email already in use" });
        }

        const hashPass = await bcrypt.hash(password, 10);

        const customer = await Customer.create({
            name: fullName,
            email,
            password: hashPass,
            phone
        });

        return res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            customer: {
                id: customer._id,
                fullName: customer.name,
                email: customer.email,
                phone: customer.phone
            }
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({
            error: err.message || "Registration failed. Please check server logs."
        });
    }
};

const loginCustomer = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables!");
            return res.status(500).json({
                error: "JWT_SECRET is missing from environment variables on Vercel."
            });
        }

        const user = await Customer.findOne({ email });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const validUser = await bcrypt.compare(password, user.password);

        if (!validUser) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const token = generateToken(user._id);

        const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({
            success: true,
            message: "Login successful",
            customer: {
                _id: user._id,
                fullName: user.name || user.fullName,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            error: err.message || "Internal server error"
        });
    }
};

const showCustomer = (req, res) => {
    return res.status(200).json({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
    });
};

const logoutCustomer = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    });
    return res.status(200).json({
        success: true,
        message: 'Logout Successful'
    });
};
export {registerCustomer, loginCustomer,showCustomer,logoutCustomer};
