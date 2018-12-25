"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("./index");
// @ts-ignore
const peer_1 = require("peer");
let router = express_1.Router();
let peerserver = peer_1.ExpressPeerServer(index_1.server, {
    debug: true
});
router.use("/", peerserver);
exports.default = router;
