const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const db = require("./config/mongoose-connection");
const expressSession = require("express-session");
const flash = require("connect-flash");

const ownersRouter = require("./routes/ownersRouter");
const usersRouter = require("./routes/usersRouter");
const productsRouter = require("./routes/productsRouter");
const indexRouter = require("./routes/index");


require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Expose `loggedin` to all views based on the JWT authToken cookie
app.use((req, res, next) => {
    res.locals.loggedin = false;
    try {
        const token = req.cookies && req.cookies.authToken;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            if (decoded && decoded.email) {
                res.locals.loggedin = true;
                res.locals.currentUser = decoded;
            }
        }
    } catch (err) {
        res.locals.loggedin = false;
    }
    next();
});


if (!process.env.EXPRESS_SESSION_SECRET) {
    console.error("EXPRESS_SESSION_SECRET is not set in the environment variables");
    process.exit(1);
}

app.use(expressSession({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(flash());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/owners",  ownersRouter);
app.use("/products", productsRouter);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));