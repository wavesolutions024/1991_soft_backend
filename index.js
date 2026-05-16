import express from "express";
import cors from "cors";
import  http from "http";
import dotenv from "dotenv";
import cookiesParser from "cookie-parser"
import { createConnection } from "./db/database.js";
import { createALLtabels } from "./table/Table.js";
import { franchRoute } from "./routes/franchiesRoute.js";
import { clientRoute } from "./routes/clientsRoute.js";
dotenv.config();


const app = express();
app.use(express.json());
app.use(cookiesParser());


app.use(
  cors({
    origin: [
      "http://localhost:5173"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "idempotency-key",
      "x-access-token",
      "x-refresh-token",
    ],
  }),
);


const port = process.env.PORT;


app.use("/api/franchies", franchRoute);
app.use("/api/client",clientRoute)

app.use("/", (req,res)=>{
    res.send("Hello 1991 tattoo studio")
})
try {

    await createConnection();
    await createALLtabels()

   const server = await http.createServer(app);

   server.listen(port,()=>{
    console.log(`your app running on ${port} `)
   });


} catch (error) {
    
}