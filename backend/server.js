import express from "express";
import cors from "cors";
import apiRouter from "./routes/api.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.get("/", (req,res)=>{
  res.json({
    name:"Apex Signals API",
    status:"running"
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
});