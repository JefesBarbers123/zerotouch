
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

                    {users.map((user: any) => (
                        <form key={user.id} action={async () => {
                            'use server'
                            await login(user.id)
                        }}>
                            <button className="w-full group relative flex items-center gap-4 p-4 border border-white/10 bg-blue-950 hover:bg-amber-400 hover:border-amber-400 hover:text-blue-950 transition-all text-left">
                                <div className="w-10 h-10 flex items-center justify-center border border-current font-black uppercase text-lg group-hover:border-black">
                                    {user.name?.[0] || '?'}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold uppercase tracking-wider text-sm">{user.name}</div>
                                    <div className="font-mono text-[10px] uppercase opacity-60 group-hover:opacity-100">
                                        {user.role} • {user.tenant.name}
                                    </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 font-black text-xl transition-opacity">
                                    →
                                </div>
                            </button>
                        </form>
                    ))}
                    {users.length === 0 && (
                        <div className="p-4 border border-dashed border-red-500/50 text-red-400 font-mono text-center text-xs uppercase">
                            No credentials found.
                        </div>
                    )}
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
