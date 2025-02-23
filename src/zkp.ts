//@ts-ignore
import { buildBls12381, utils } from "ffjavascript";
const { unstringifyBigInts } = utils;

import { Buffer } from "node:buffer";

export function g1Compressed(curve: any, p1Raw: any) {
    let p1 = curve.G1.fromObject(p1Raw);

    let buff = new Uint8Array(48);
    curve.G1.toRprCompressed(buff, 0, p1);
    // convert from ffjavascript to blst format
    if (buff[0] & 0x80) {
        buff[0] |= 32;
    }
    buff[0] |= 0x80;
    return toHexString(buff);
}

export function g2Compressed(curve: any, p2Raw: any) {
    let p2 = curve.G2.fromObject(p2Raw);

    let buff = new Uint8Array(96);
    curve.G2.toRprCompressed(buff, 0, p2);
    // convert from ffjavascript to blst format
    if (buff[0] & 0x80) {
        buff[0] |= 32;
    }
    buff[0] |= 0x80;
    return toHexString(buff);
}

export function toHexString(byteArray: any) {
    return Array.from(byteArray, function (byte: any) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join("");
}


export async function prepareProof(proof: any) {
    const curve = await buildBls12381();
    const proofProc = unstringifyBigInts(proof);
    const pi_aS = g1Compressed(curve, proofProc.pi_a);
    const pi_bS = g2Compressed(curve, proofProc.pi_b);
    const pi_cS = g1Compressed(curve, proofProc.pi_c);
    const pi_a = Buffer.from(pi_aS, "hex");
    const pi_b = Buffer.from(pi_bS, "hex");
    const pi_c = Buffer.from(pi_cS, "hex");

    return { pi_a, pi_b, pi_c }
}