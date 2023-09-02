// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { IMG_2_IMG_TEMPLATE_INPUT } from '@/constant/inputJson';

type Data = {
    name?: string
    error?: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    // console.log('req', req)
    if (req.method === 'POST') {
        const {
            prompt,
            ipfsCid
        } = req.body
        if (!prompt || !ipfsCid) {
            return res.status(400).json({ error: 'Missing required fields' })
        }
        const imageUrl = `https://ipfs.io/ipfs/${ipfsCid}`
        const input = {
            ...IMG_2_IMG_TEMPLATE_INPUT,
            prompt: prompt,
            init_image: imageUrl
        }
        const response = await fetch('https://stablediffusionapi.com/api/v3/img2img', {
            method: 'POST',
            body: JSON.stringify(input)
        })
        console.log('response', response)

    }
    res.status(200).json({ name: 'John Doe' })
}
