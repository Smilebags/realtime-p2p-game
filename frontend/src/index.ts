// @ts-ignore
let peer: any = new Peer();



peer.on("open", function (id: string): void {
    console.log("ID: " + id);
});

peer.on("error", function (err:Error): void {
    if (err.type === "unavailable-id") {
        alert("" + err);
        peer.reconnect();
    } else {
        alert(err);
    }
});

peer.on("connection", (conn: any) => {
    console.log("Connected");

    conn.on("data", (data: any) => {
        console.log(data);
    });

    peer.on("disconnected", () => {
        alert("Connection has been lost.");
        peer.reconnect();
    });
    let i: number = 0;
    setInterval(() => {
        conn.send(i++);
    }, 1000);
});

document.addEventListener("DOMContentLoaded", () => {
    let connectEl: HTMLElement | null = document.querySelector(".connect");
    if(connectEl) {
        connectEl.addEventListener("click", () => {
            console.log("Connect clicked");
            let id: string = (<HTMLInputElement>(document.querySelector(".id"))).value;
            let conn: any = peer.connect(id);
            conn.on("open", () => {
                conn.on("data", (data: any) => {
                    console.log(`Data: ${data}`);
                });
                conn.send("Connected");

                let i: number = 0;
                setInterval(() => {
                    conn.send(i++);
                }, 1000);
            });
        });
    }
});