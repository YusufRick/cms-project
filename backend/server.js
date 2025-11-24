const express = require("express");
const app = express();

app.use(express.json());

// Routes
app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/complaints", require("./routes/complaintRoutes"));

module.exports = app;
