import Header from '@/components/Header'
import React, { useState } from 'react'
import { create } from 'ipfs-http-client'
import { uploadAssetToIpfs } from '@/utils/uploadToIPFS'

type Props = {}

const MintPage = (props: Props) => {
    const [inputFile, setInputFile] = useState<File>()
    const [inputPrompt, setInputPrompt] = useState<string>("")
    const handleGenerateImage = async () => {
        if (inputFile) {

            // const fileBuffer = await inputFile.arrayBuffer();
            const result = await uploadAssetToIpfs(inputFile)
            const cid = result.path

            const response = await fetch('/api/generate', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: inputPrompt,
                    ipfsCid: cid
                })
            })
            console.log('response')
            // fetch('/api/generate', {
            //     method: 'POST',
            //     body: formData,
            // })
            //     .then((response) => response.json())
            //     .then((data) => {
            //         console.log('File uploaded successfully:', data);
            //         // Handle the server response as needed
            //     })
            //     .catch((error) => {
            //         console.error('Error uploading file:', error);
            //         // Handle errors
            //     });
        } else {
            console.error('No file selected.');
        }
    };
    return (
        <div>
            <Header />
            <div className='flex flex-col'>
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
                            console.log(e.target.files)
                            console.log(e)
                        }} />
                    </label>
                </div>
                <label>Prompt</label>
                <textarea className='outline-none bg-gray-400' value={inputPrompt} onChange={(e) => {
                    console.log('change: ', e.target.value)
                    setInputPrompt(e.target.value)
                }}></textarea>
            </div>
            <button onClick={handleGenerateImage}>Button</button>
        </div>
    )
}

export default MintPage