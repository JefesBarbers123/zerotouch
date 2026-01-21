
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function UpgradePage() {
    const user = await getCurrentUser()

    if (user?.tenant.subscriptionStatus === 'ACTIVE') {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen bg-blue-950 flex flex-col items-center justify-center p-6 relative">
            {/* Background Accents (Fixed) */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-400 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[150px]"></div>
            </div>

            <div className="max-w-2xl w-full bg-blue-900/40 backdrop-blur-xl border-2 border-amber-400 p-8 md:p-12 text-center shadow-2xl relative z-10">
                <div className="w-20 h-2 bg-amber-400 mx-auto mb-8"></div>

                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
                    Unlock Full Access
                </h1>

                <p className="text-xl md:text-2xl text-blue-200 font-medium mb-10 leading-relaxed">
                    For the same price of <span className="text-amber-400 font-bold border-b-2 border-amber-400">1 cut a month</span>,
                    you could <span className="text-green-400 font-bold">3x your turnover</span> with our proven methods.
                </p>

                <div className="grid gap-4 md:grid-cols-2 text-left mb-10 text-sm font-bold text-white/80 uppercase tracking-widest">
                    <div className="flex items-center gap-3">
                        <span className="text-amber-400 text-xl">✓</span> Automate Client Check-ins
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-amber-400 text-xl">✓</span> SMS Marketing Suite
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-amber-400 text-xl">✓</span> Staff Performance Tracking
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-amber-400 text-xl">✓</span> 24/7 Concierge AI
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <Link
                        href="/settings/billing"
                        className="w-full py-5 bg-amber-400 hover:bg-white hover:text-blue-950 text-blue-950 font-black text-xl uppercase tracking-[0.2em] transition-all transform hover:scale-[1.02] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]"
                    >
                        Start Growing Now
                    </Link>
                    <p className="text-white/40 text-xs font-mono uppercase mt-2">
                        Cancel anytime. No lock-in contract.
                    </p>
                </div>
            </div>
        </div>
    )
}
