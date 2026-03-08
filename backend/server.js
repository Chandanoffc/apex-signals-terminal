import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRoutes);

app.get("/", (req,res)=>{
  res.send("Apex Signals API running");
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, ()=>{
  console.log("Server running on port", PORT);
});