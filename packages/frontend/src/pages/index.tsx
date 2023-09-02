import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter()
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className='flex '>
        <div className='flex flex-col '>
          <div className='font-bold text-4xl'>Mutation NFT</div>
          <div className='text-xl'> Online avatar generator. Choose an avatar, select a voice, and animate!</div>
          <button onClick={() => {
            router.push('/mint')
          }}> Create your avatar</button>
        </div>
        <div>
          <img src='' />

        </div>
      </div>
    </main>
  )
}
