import { getServices } from './actions'
import CheckInForm from './check-in-form'

export default async function CheckInPage() {
    const services = await getServices()

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-2xl">
                <header className="mb-8 border-b-2 border-amber-400 pb-8 text-center">
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Check In</h1>
                    <p className="font-mono text-sm text-amber-400/70 uppercase tracking-widest">Record a client visit</p>
                </header>

                <CheckInForm services={services} />
            </div>
        </div>
    )
}
