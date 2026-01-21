
import { registerShop } from './actions'
import Link from 'next/link'

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-blue-950 p-4">
            <div className="w-full max-w-lg p-8 border-2 border-amber-400 bg-blue-900/30 relative overflow-hidden">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400 -mt-2 -mr-2" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400 -mb-2 -ml-2" />

                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
                        Zerotouches.
                    </h1>
                    <p className="font-mono text-xs text-amber-400 uppercase tracking-widest">
                        New Shop Registration
                    </p>
                </div>

                <form action={registerShop} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Shop / Brand Name</label>
                        <input
                            name="shopName"
                            type="text"
                            required
                            placeholder="e.g. Blade & Fades"
                            className="w-full bg-blue-950 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Owner Full Name</label>
                            <input
                                name="ownerName"
                                type="text"
                                required
                                placeholder="e.g. Joe Barber"
                                className="w-full bg-blue-950 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Mobile Number</label>
                            <input
                                name="phone"
                                type="tel"
                                placeholder="e.g. 07700 900000"
                                className="w-full bg-blue-950 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Login Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="w-full bg-blue-950 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                        />
                        <p className="text-[10px] text-white/40 mt-2 font-mono">This will be your admin login ID.</p>
                    </div>

                    <button type="submit" className="w-full p-4 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-sm mt-8">
                        Launch System
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-white/5 pt-8">
                    <p className="font-mono text-xs text-white/50">
                        Already have access? <Link href="/login" className="text-amber-400 hover:text-white hover:underline">Login Here</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
