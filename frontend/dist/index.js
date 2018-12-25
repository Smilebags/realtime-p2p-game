"use strict";
// @ts-ignore
let peer = new Peer();
peer.on("open", function (id) {
    console.log("ID: " + id);
});
peer.on("error", function (err) {
    if (err.type === "unavailable-id") {
        alert("" + err);
        peer.reconnect();
    }
    else {
        alert(err);
    }
});
peer.on("connection", (conn) => {
    console.log("Connected");
    conn.on("data", (data) => {
        console.log(data);
    });
    peer.on("disconnected", () => {
        alert("Connection has been lost.");
        peer.reconnect();
    });
    let i = 0;
    setInterval(() => {
        conn.send(i++);
    }, 1000);
});
document.addEventListener("DOMContentLoaded", () => {
    let connectEl = document.querySelector(".connect");
    if (connectEl) {
        connectEl.addEventListener("click", () => {
            console.log("Connect clicked");
            let id = (document.querySelector(".id")).value;
            let conn = peer.connect(id);
            conn.on("open", () => {
                conn.on("data", (data) => {
                    console.log(`Data: ${data}`);
                });
                conn.send("Connected");
                let i = 0;
                setInterval(() => {
                    conn.send(i++);
                }, 1000);
            });
        });
    }
});
