import { app } from "./app.ts";
import { connectDb } from "./db/connect.ts";
import { env } from "./env.ts";

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