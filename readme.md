# Jetton Notes Relayer

This is the relayer for jetton notes that allows relaying of transactions on testnet. It is currently not wired into the front end while Jetton Notes is on testnet. 

## How it works?

The `/relayTransaction` endpoint takes a proof and publicInputs emitted by snarkjs groth16 prove on the front end, via JSON api.

Then the proof is converted to a contract friendly format.

The Relayer runs a simulation @ton/sandbox to verify the transaction is valid and then submits it to the network.

The relayer  charges a fixed rate fee that is set in the contract.


## Deployment

This is a nodeJs application, intended to be hosted on a VPS.

`npm run start` will start the application

`npm run build` will build the typescrypt project