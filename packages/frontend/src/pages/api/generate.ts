// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { IMG_2_IMG_TEMPLATE_INPUT } from '@/constant/inputJson';
import { STYLED_PROMPTS } from '@/constant/stylePrompt';
import type { NextApiRequest, NextApiResponse } from 'next';
//@ts-ignore
// import imgurUploader from "imgur-uploader"
// // const imgurUploader = require("imgur-uploader");
// import * as Upload from "upload-js-full";
// // import fetch from "node-fetch";

type Data = {
    name?: string
    error?: string
}
async function fetchWithExponentialRetry(url: string, options: any, maxRetries = 10, baseDelay = 100): Promise<Response> {
    console.log('retry', maxRetries)
    return fetch(url, options)
        .then((response) => {
            console.log('response status code: ', response.status)
            if (!response.ok) {
                throw new Error(`Fetch failed with status: ${response.status}`);
            }
            return response.json()
        })
        .then((response) => {
            if (response.error_log || response.status == 'failed') {
                console.log('error', response?.error_log.response)
                throw new Error(`Fetch failed with status: ${response.response.error_log}`);
            }
            return response
        })
        .catch((error) => {
            if (maxRetries <= 0) {
                throw error; // No more retries left, propagate the error
            }

            const currentDelay = baseDelay
            console.error(`Request failed. Retrying in ${currentDelay} ms... (${maxRetries} retries left)`);

            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(fetchWithExponentialRetry(url, options, maxRetries - 1, baseDelay * 2));
                }, currentDelay);
            });
        });
}



// export const config = {
//     api: {
//         bodyParser: false
//     }
// };
// function parseForm(req: NextApiRequest) {
//     return new Promise((resolve, reject) => {
//         const form = formidable({ uploadDir: './public' })
//         form.parse(req, (err, fields, files) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve({ fields, files });
//             }
//         });
//     });
// }




export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    // console.log('req', req)
    if (req.method === 'POST') {
        console.log('received request')
        const {
            ipfsCid
        } = req.body

        if (!ipfsCid) {
            return res.status(400).json({ error: 'Missing required fields' })
        }
        const imageUrl = "https://res.cloudinary.com/do3iiid2j/image/upload/v1693639326/AN8M6JlQuTqzWhTrQ2PA1XAuq6XHQo_yonElYOQFAeNsxJKl29bqYnr_zpee_IY6kMBAhXI6Y3aSXVSNVuzT2EZPMoG_5owYhrJO_piwxmk.png"
        const generagteImagePromise = []
        for (const style in STYLED_PROMPTS) {
            const stylePrompt = STYLED_PROMPTS[style]
            const styleInput = {
                ...IMG_2_IMG_TEMPLATE_INPUT,
                prompt: stylePrompt.prompt,
                negative_prompt: stylePrompt.negative_prompt,
                init_image: imageUrl,
                safety_checker: "yes",


            }
            console.log('styleInput', styleInput)
            generagteImagePromise.push(fetchWithExponentialRetry('https://stablediffusionapi.com/api/v3/img2img', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(styleInput)
            }))
        }
        const responses = await Promise.all(generagteImagePromise)
        console.log('responses', responses)
        res.status(200).send(responses)
        // for (let response of responses) {
        //     if (response.error_log) {
        //         console.log('error', response.error_log.response)
        //     }
        // }
    }
}
