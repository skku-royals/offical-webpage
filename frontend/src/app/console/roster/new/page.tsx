import CreateRosterForm from './_components/CreateRosterForm'

export default function CreateRoster() {
  return (
    <main className="mx-auto flex w-full flex-grow flex-col items-center justify-center">
      <div className="mt-4 w-full px-4 text-left sm:px-6">
        <h1 className="text-base font-bold sm:text-xl">부원생성</h1>
      </div>
      <div className="flex w-full flex-grow flex-col gap-5 py-4 sm:px-6">
        <CreateRosterForm />
      </div>
    </main>
  )
}