export default function ForgotPasswordPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const defaultEmail = searchParams?.email as string || ''
    const sent = searchParams?.sent === 'true'

    return (
        <div className="flex min-h-screen items-center justify-center bg-blue-950 p-4">
            <div className="w-full max-w-lg p-8 border-2 border-amber-400 bg-blue-900/30 relative overflow-hidden">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
                        Account Recovery
                    </h1>
                    <p className="font-mono text-xs text-amber-400 uppercase tracking-widest">
                        Reset Access Protocol
                    </p>
                </div>

                {sent ? (
                    <div className="text-center space-y-4">
                        <div className="p-4 border border-green-500 bg-green-500/10 text-green-400 font-mono text-sm">
                            <strong>CHECK COMMS:</strong> Recovery link dispatched.
                        </div>
                        <p className="text-white/60 text-xs">Please check your email inbox.</p>
                        <a href="/login" className="inline-block mt-4 text-amber-400 text-xs font-bold uppercase tracking-widest hover:text-white">Return to Login</a>
                    </div>
                ) : (
                    <form action={async (formData) => {
                        'use server'
                        const email = formData.get('email') as string
                        const { requestPasswordReset } = await import('@/app/auth/actions')
                        await requestPasswordReset(email)
                    }} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Login Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                defaultValue={defaultEmail}
                                placeholder="you@example.com"
                                className="w-full bg-blue-950 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                            />
                        </div>

                        <button type="submit" className="w-full p-4 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-sm">
                            Send Reset Link
                        </button>

                        <div className="text-center">
                            <a href="/login" className="text-[10px] font-mono text-white/40 hover:text-white uppercase tracking-widest">Cancel</a>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
