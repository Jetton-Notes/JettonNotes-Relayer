// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { sendTransaction, simulateTransaction } from "./ton";
import { prepareProof } from "./zkp";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;


app.use(cors())
app.use(express.json())

app.get("/", (req: Request, res: Response) => {
  res.send("Jetton Notes Relayer");
});

app.post("/relayTransaction", bodyParser.json(), async (req: Request, res: Response) => {
  const { proof, publicSignals } = req.body;
  const { pi_a, pi_b, pi_c } = await prepareProof(proof);

  const simulationSuccess = await simulateTransaction(pi_a, pi_b, pi_c, publicSignals)

  if (simulationSuccess) {
    //Send the transaction

    const tx = await sendTransaction(pi_a, pi_b, pi_c, publicSignals);

    res.send({ success: true })

  } else {
    //Simulation faile, send an error message
    res.send(JSON.stringify({ success: false, reason: "simulation_bounced" }));
  }

})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});