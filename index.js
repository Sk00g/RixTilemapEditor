// import express (after npm install express)
const express = require("express");

// create new express app and save it as "app"
const cors = require("cors");
const app = express();

// server configuration
const PORT = 8081;

app.use(cors());
app.use(express.static("public/"));

// create a route for the app
app.get("/", (req, res) => {
    res.redirect("dist/index.html");
});

// make the server listen to requests
app.listen(PORT, () => {
    console.log(`Server running at: http://127.0.0.1:${PORT}/`);
});
