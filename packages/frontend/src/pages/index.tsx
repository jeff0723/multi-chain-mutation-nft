import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router'
import { BsArrowRightCircleFill } from 'react-icons/bs'
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter()
  return (
    <main
      className={`flex h-full min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className='flex h-full min-h-[70vh] justify-center items-center gap-24'>
        <div className='flex flex-col gap-10 w-1/3'>
          <div className='font-bold text-4xl'>Mutation NFT</div>
          <div className='text-xl text-gray-400'> Multi-chain NFT generator. Choose an image, pay gas, mutate!</div>
          <button
            className='hover:bg-opacity-50 flex gap-3 text-lg justify-center items-center px-9 py-[15px] bg-white rounded-3xl text-black font-bold'
            onClick={() => {
              router.push('/mint')
            }}> Create your avatar
            <BsArrowRightCircleFill />
          </button>
        </div>
        <div className='w-2/3'>
          <img src='https://cdn-site-assets.veed.io/AI_Avatar_3337ab64fb/AI_Avatar_3337ab64fb.png?width=1280&quality=75' />

        </div>
      </div>
    </main>
  )
}
