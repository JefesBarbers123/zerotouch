
import { getBarberProfileData } from './actions'
import BarberProfileEditor from './barber-profile-editor'
import { redirect } from 'next/navigation'

export default async function BarberProfilePage() {
    const data = await getBarberProfileData()

    if (!data) {
        redirect('/login')
    }

    return (
        <div className="flex-1 flex flex-col p-8 lg:p-12 max-w-7xl mx-auto w-full">
            <header className="mb-12 border-b-2 border-amber-400 pb-8">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">
                    My Barber Profile
                </h1>
                <p className="font-mono text-sm text-amber-400/70 uppercase tracking-widest">
                    Manage your public presence and stats.
                </p>
            </header>

            <BarberProfileEditor
                profile={data.profile}
                userName={data.userName}
            />
        </div>
    )
}
