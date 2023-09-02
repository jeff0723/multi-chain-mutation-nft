import React, { useEffect, useState } from 'react'

type Props = {
    index: number
    status: string
    fetch_result?: string
    url?: string
    setImageUrls: React.Dispatch<React.SetStateAction<string[]>>
}

const ImageCard = ({
    index,
    status,
    fetch_result,
    url,
    setImageUrls
}: Props) => {
    const [imageUrl, setImageUrl] = useState(url ?? "")
    const [isSuccess, setIsSuccess] = useState(status == 'success')

    useEffect(() => {
        if (status == 'processing') {
            //keep fetching until it have image url fetch every 3 second
            const fetchData = async () => {
                console.log('fetch data: ')
                console.log('fetchUrl: ', fetch_result)
                try {
                    if (isSuccess) {
                        // Stop polling if success flag is true
                        clearInterval(pollingIntervalId);
                        return;
                    }
                    if (!fetch_result) return
                    const response = await fetch(fetch_result);

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const data = await response.json();
                    // Check the result and handle it as needed
                    if (data.stauts === 'success') {
                        // The desired result is achieved, set success flag
                        console.log('Desired result achieved:', data);
                        // setPollingResult(data);
                        setIsSuccess(true);
                        setImageUrl(data.output[0])
                        setImageUrls((prev) => {
                            const _prev = prev
                            prev[index] = data.output[0]
                            return [..._prev]
                        })
                    } else {
                        console.log('Result not yet achieved:', data);
                    }
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }

            // Start polling at the specified interval
            const pollingIntervalId = setInterval(fetchData, 3000);

            // Stop polling and clear the interval when the component unmounts
            return () => clearInterval(pollingIntervalId);
        }

    }, [])
    return (
        <div className='w-[300px] h-[300px]'>
            {isSuccess &&
                <img src={imageUrl} className='w-full h-full rounded-lg' />
            }
            {!isSuccess &&
                <div className='flex w-full h-full justify-center items-center'>
                    <div className="w-16 h-16 border-t-4 border-white border-solid rounded-full animate-spin"></div>
                </div>
            }
        </div>
    )
}

export default ImageCard