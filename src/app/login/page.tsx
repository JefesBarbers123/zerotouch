
import { getAllUsers } from '@/lib/auth'
import { login } from './actions'

export default async function LoginPage() {
    let users: any[] = []
    let error = null

    try {
        users = await getAllUsers()
    } catch (e: any) {
        console.error("Login Page Error:", e)
        error = e.message
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-blue-950 p-4">
            <div className="w-full max-w-md p-8 border-2 border-amber-400 bg-blue-900/30 relative overflow-hidden">
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400 -mt-2 -mr-2" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400 -mb-2 -ml-2" />

                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">
                        Zerotouches.
                    </h1>
                    <p className="font-mono text-xs text-amber-400 uppercase tracking-widest">
                        System Access Control
                    </p>
                </div>

                <div className="space-y-4">
                    {error && (
                        <div className="p-4 border border-red-500 bg-red-500/10 text-red-500 font-mono text-xs mb-4">
                            <strong>SYSTEM ERROR:</strong> {error}
                        </div>
                    )}

                    {/* Standard Login */}
                    <form action={async (formData) => {
                        'use server'
                        const email = formData.get('email') as string
                        const { loginByEmail } = await import('./actions')
                        await loginByEmail(email)
                    }} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="ENTER EMAIL"
                                required
                                className="w-full bg-blue-950 border-2 border-amber-400/30 p-3 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                            />
                        </div>
                        <button className="w-full px-6 py-3 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-sm">
                            Access System
                        </button>
                    </form>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-blue-900/30 px-2 text-white/50 font-mono">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Login */}
                    <form action={async () => {
                        'use server'
                        const { loginWithGoogle } = await import('./actions')
                        await loginWithGoogle()
                    }}>
                        <button className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors text-sm">
                            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            Sign in with Google
                        </button>
                    </form>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 text-center">
                    <p className="font-mono text-xs text-white/50 mb-4">
                        Don't have an account?
                    </p>
                    <a href="/register" className="inline-block px-6 py-3 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-xs">
                        Start Free Trial
                    </a>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-white/20 font-mono uppercase">
                        Restricted Access • Auth Ref: 0X-99
                    </p>
                </div>
            </div>
        </div>
    )
}
