// import Header from '@/components/Header'
import React, { useCallback, useEffect, useState } from 'react'
import { create } from 'ipfs-http-client'
import { uploadAssetToIpfs, uploadIpfs } from '@/utils/uploadToIPFS'
import dynamic from 'next/dynamic';
import ImageCard from '@/components/ImageCard';
import toast from 'react-hot-toast';
import { ST } from 'next/dist/shared/lib/utils';
import { useAccount } from 'wagmi'
import { mintNFT } from '@/action/mint';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';

const Header = dynamic(() => import('@/components/Header'), { suspense: true });

type Props = {}

enum Status {
    noAction,
    uploading,
    minting,
    complete
}
const MintPage = (props: Props) => {
    const [width, height] = useWindowSize()
    const [status, setStatus] = useState<Status>(Status.noAction)
    const [inputFile, setInputFile] = useState<File>()
    const [imageUrls, setImageUrls] = useState<string[]>([])
    const [previewURL, setPreviewURL] = useState('');

    const [stableDiffusionResponse, setStableDiffusionResponse] = useState<{
        status: string
        url?: string
        fetch_result?: string
    }[]>()
    const { address, isConnecting, isDisconnected } = useAccount()

    const handleGenerateImage = async () => {
        if (inputFile) {
            setStatus(Status.uploading)
            const fileBuffer = await inputFile.arrayBuffer();
            const result = await uploadAssetToIpfs(inputFile)
            const cid = result.path

            const responses = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ipfsCid: cid
                })
            }).then(res => res.json())
            const _stableDiffusionResult = []
            const _imageUrls = []
            for (let response of responses) {
                if (response.status == 'processing') {
                    _stableDiffusionResult.push({
                        status: 'processing',
                        fetch_result: response.fetch_result
                    })
                    _imageUrls.push('')
                }
                if (response.status == 'success') {
                    _stableDiffusionResult.push({
                        status: 'success',
                        url: response.output[0]
                    })
                    _imageUrls.push(response.output[0])
                }
            }
            setStableDiffusionResponse(_stableDiffusionResult)
            setImageUrls(_imageUrls)
        }
    };
    const isValidImageUrl = useCallback(() => {
        if (!imageUrls.length) return false
        for (let imageUrl of imageUrls) {
            if (!imageUrl) return false
        }
        return true
    }, [imageUrls])
    const mint = useCallback(async () => {
        if (!isValidImageUrl() || !address) return
        try {
            const tokenUrlPromise = []
            for (let url of imageUrls) {
                tokenUrlPromise.push(uploadIpfs({ "image": url, "attributes": [{ "trait_type": "Clothes", "value": "Bayc T Black" }, { "trait_type": "Earring", "value": "Gold Stud" }, { "trait_type": "Eyes", "value": "Bored" }, { "trait_type": "Fur", "value": "Tan" }, { "trait_type": "Background", "value": "Gray" }, { "trait_type": "Hat", "value": "Horns" }, { "trait_type": "Mouth", "value": "Bored Unshaven Cigar" }] }))
            }

            const _tokenUrls = await Promise.all(tokenUrlPromise)
            const tokenUrls = _tokenUrls.map(result => result.path)

            await mintNFT(address, tokenUrls, [10000000000000000, 10000000000000000, 10000000000000000], ["optimism", "polygonzk", "linea"])
            toast.success('successfully mint mutation nft')
            setStatus(Status.complete)
        } catch (err) {
            //@ts-ignore
            toast.error(`Error: ${err.message}`)
        }


    }, [imageUrls, address])
    useEffect(() => {
        if (isValidImageUrl()) {

            setStatus(Status.minting)
            mint()
        }
    }, [imageUrls])
    console.log(stableDiffusionResponse)
    const renderButtonText = () => {
        if (status == Status.noAction) return <div>Generate</div>
        if (status == Status.uploading) return (
            <div className='flex justify-center items-center gap-2'>
                <div className="w-4 h-4 border-t-2 border-black border-solid rounded-full animate-spin"></div>
                <div>Generating...</div>
            </div>
        )
        if (status == Status.minting) return (
            <div className='flex justify-center items-center gap-2'>
                <div className="w-4 h-4 border-t-2 border-black border-solid rounded-full animate-spin"></div>
                <div>Minting...</div>
            </div>
        )
        if (status == Status.complete) return <div className='text-cyan-400'>Success</div>



    }
    return (
        <div>
            <Header />
            {status == Status.complete ?
                <Confetti
                    width={width}
                    height={height}
                /> : <></>}
            <div className='p-8'>
                <div className='flex flex-col'>
                    <div className='flex gap-4 w-full items-center'>
                        <div>
                            {previewURL && <img src={previewURL} width={300} height={300} />

                            }
                        </div>
                        <div className="flex items-center justify-center w-full">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                </div>
                                <input id="dropzone-file" type="file" className="hidden" onChange={(e) => {
                                    if (!e.target.files?.length) return
                                    setInputFile(e.target.files[0])
                                    const filePreviewURL = URL.createObjectURL(e.target.files[0]);
                                    setPreviewURL(filePreviewURL);
                                    console.log(e.target.files)
                                    console.log(e)
                                }} />
                            </label>
                        </div>
                    </div>
                    {/* <label>Prompt</label>
                    <textarea className='outline-none bg-gray-400' value={inputPrompt} onChange={(e) => {
                        console.log('change: ', e.target.value)
                        setInputPrompt(e.target.value)
                    }}></textarea> */}
                </div>
                <button disabled={(status == Status.noAction && !previewURL) || (status == Status.uploading && !isValidImageUrl()) || (status != Status.complete && status != Status.noAction)} onClick={handleGenerateImage} className='mt-4 w-full p-4 rounded-2xl bg-white text-black font-bold hover:bg-opacity-50 disabled:bg-opacity-60'>
                    {renderButtonText()}
                </button>
                <div className='mt-4 flex gap-4 flex-wrap justify-center'>
                    {stableDiffusionResponse?.map((response, index) => (
                        <ImageCard key={index} index={index} {...response} setImageUrls={setImageUrls} />

                    ))}
                </div>
            </div>
        </div>
    )
}

export default MintPage