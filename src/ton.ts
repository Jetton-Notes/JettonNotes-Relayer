import { TonClient4, WalletContractV4, WalletContractV5R1, } from "@ton/ton";
import { mnemonicNew, mnemonicToPrivateKey } from "@ton/crypto";
import { Address, toNano, OpenedContract } from "@ton/core"

import { Blockchain, RemoteBlockchainStorage, wrapTonClient4ForRemote } from '@ton/sandbox'
import { getHttpV4Endpoint, type Network } from '@orbs-network/ton-access'
import { DepositWithdraw } from "./DepositWithdraw";

const network = process.env.NETWORK as Network;

export const MainnetAPI = "https://toncenter.com/api/v2/jsonRPC"
export const TestnetAPI = "https://testnet.toncenter.com/api/v2/jsonRPC"

const CURRENTAPI = TestnetAPI;

export async function simulateTransaction(pi_a: any, pi_b: any, pi_c: any, publicSignals: any): Promise<boolean> {
    const blockchain = await Blockchain.create({
        storage: new RemoteBlockchainStorage(wrapTonClient4ForRemote(new TonClient4({
            endpoint: await getHttpV4Endpoint({
                network: network ?? "testnet"
            })
        })))
    })

    const contractAddrString = process.env.CONTRACTADDRESS;

    if (!contractAddrString) {
        console.error("contract address not found")
        return false;
    }

    const relayerAddress = process.env.RELAYERADDRESS;

    if (!relayerAddress) {
        console.error("missing relayer address");
        return false;
    }


    let sender = blockchain.sender(Address.parse(relayerAddress));

    const contractAddress = Address.parse(contractAddrString);
    const depositWithdraw = blockchain.openContract(DepositWithdraw.createFromAddress(contractAddress));

    const tx = await depositWithdraw.sendUtxo_Withdraw(sender, {
        pi_a,
        pi_b,
        pi_c,
        pubInputs: publicSignals,
        value: toNano("0.1")
    });

    let bounced = false;
    for (let i = 0; i < tx.events.length; i++) {
        //@ts-ignore
        if (tx.events[i]?.bounced) {
            //A message bounced, means the simulation fails
            bounced = true;
        }
    }
    //if the contract call bounced, return false
    return !bounced;
}

export async function sendTransaction(pi_a: any, pi_b: any, pi_c: any, publicSignals: any): Promise<{ success: boolean, reason: string }> {
    try {
        // Create Client
        const client = new TonClient4({
            endpoint: CURRENTAPI
        });

        const contractAddrString = process.env.CONTRACTADDRESS;

        if (!contractAddrString) {
            console.error("contract address not found")
            return {
                success: false,
                reason: "server error",


            };
        }

        const keyPair = await getKeypair();

        if (!keyPair) {
            console.error("missing keypair")
            return {
                success: false,
                reason: "server error",


            };
        }


        let workchain = 0; // Usually you need a workchain 0
        let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });

        console.log("here")
        console.log("wallet address",wallet.address)
        

        const walletContract = client.open(wallet);
        console.log(walletContract.address)
        console.log("Balance: ",await walletContract.getBalance())

        // const walletSender = walletContract.sender(keyPair.secretKey);
        // const seqno = await walletContract.getSeqno();



        // const depositWithdraw = DepositWithdraw.createFromAddress(Address.parse(contractAddrString));
        // const depositWithdrawClient = client.open(depositWithdraw) as OpenedContract<DepositWithdraw>

        // const result = await depositWithdrawClient.sendUtxo_Withdraw(
        //     walletSender,
        //     {
        //         pi_a,
        //         pi_b,
        //         pi_c,
        //         pubInputs: publicSignals,
        //         value: toNano("0.1")
        //     }
        // )
        // console.log("here")
        // console.log(result);

        return { success: true, reason: "" };
    } catch (err: any) {
        console.log("thew weeor")
        console.log(err);
        return { success: false, reason: "server error" }
    }
}


async function getKeypair() {
    let mnemonics = process.env.MNEMONIC;

    if (!mnemonics) {
        console.error("Missing Mnemonic");
        return;
    }

    let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));

    return keyPair;
}

export async function relayerWallet() {
    const keyPair = await getKeypair();

    if (!keyPair) {
        return;
    }


    let workchain = 0; // Usually you need a workchain 0

    // let contract = client.open(wallet);

    // Get balance
    // let balance: bigint = await contract.getBalance();
}

async function VerifyRelayedTransaction() {

    //TODO: creace client and then use the contract

    //TODO: then check if the comm

}
