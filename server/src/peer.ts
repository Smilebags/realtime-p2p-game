import { Router } from "express";
import { server } from "./index";
// @ts-ignore
import { ExpressPeerServer } from "peer";

let router: Router = Router();


let peerserver: any = ExpressPeerServer(server, {
    debug: true
});

router.use("/", peerserver);

export default router;