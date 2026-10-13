import { app } from "./app.js";
import { connectDb } from "./db/connect.js";
import { env } from "./env.js";

connectDb()
    .then(() => {
        console.log("MongoDB se connect ho gaya.");
        app.listen(env.PORT, () => {
            console.log(`Munim API chal rahi hai: http://localhost:${env.PORT}`);
        });
    })
    .catch((err: Error) => {
        console.error("MongoDB se connect nahi ho paaya:", err.message);
        process.exit(1);
    });