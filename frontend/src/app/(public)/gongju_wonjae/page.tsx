import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: '이원재 줍기',
  description: '성공하면 상금 ??,???원을 드려요',
  openGraph: {
    images: ['/wonjae_og.png']
  }
}

export default async function SurveyPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col items-center justify-start p-6 lg:px-8">
      <div className="flex w-full flex-col items-center gap-y-10">
        <Image
          width={1080}
          height={1080}
          priority={true}
          src="/magic-girl.jpeg"
          alt="hero image"
          className="h-80 w-auto lg:h-[640px]"
        />
      </div>
    </main>
  )
}
