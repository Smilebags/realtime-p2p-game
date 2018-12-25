"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path = require("path");
const peer_1 = require("./peer");
let app = express();
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
exports.server = app.listen(9000);
app.use("/peer", peer_1.default);
