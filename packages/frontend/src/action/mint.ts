

import { DINOSAUR_ABI } from '@/constant/abt';
import { DINOSAUR_ADDRESS } from '@/constant/address';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { prepareWriteContract, writeContract, waitForTransaction } from '@wagmi/core';
export const mintNFT = async (to: string, tokenUrls: string[], gasFees: number[], destinations: string[]): Promise<TransactionReceipt> => {

    // Prepare the transaction data
    const { request } = await prepareWriteContract({
        address: DINOSAUR_ADDRESS,
        abi: DINOSAUR_ABI,
        functionName: 'mintNFT',
        args: [to, tokenUrls, gasFees, destinations],
        value: BigInt(40000000000000000)
    });

    // Execute the transaction
    const { hash, } = await writeContract(request)


    // Wait for the transaction block to be mined
    const data = await waitForTransaction({
        hash,
    })
    //@ts-ignore
    return data;
}