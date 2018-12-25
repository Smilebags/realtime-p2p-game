import * as express from "express";
import * as path from "path";
import { Server } from "http";
import peerServer from "./peer";
let app: express.Express = express();


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

app.use(express.static(path.join(__dirname, "../../frontend/dist")));


export const server: Server = app.listen(9000);


app.use("/peer", peerServer);