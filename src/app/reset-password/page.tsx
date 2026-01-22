import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ResetPasswordPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const token = searchParams?.token as string

    if (!token) redirect('/login')

    // Verify token validity
    const user = await prisma.user.findUnique({
        where: { resetToken: token }
    })

    console.log(`[RESET DEBUG] Token received: ${token.substring(0, 10)}...`)
    console.log(`[RESET DEBUG] User found: ${user?.email}`)
    console.log(`[RESET DEBUG] Token Expiry: ${user?.resetTokenExpiry}`)
    console.log(`[RESET DEBUG] Current Time: ${new Date()}`)

    const isValid = user && user.resetTokenExpiry && user.resetTokenExpiry > new Date()

    if (!isValid) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-blue-950 p-4 text-white text-center">
                <div className="max-w-md">
                    <h1 className="text-2xl font-bold mb-4 text-red-500">Invalid or Expired Link</h1>
                    <p className="mb-4">This password reset link is invalid or has expired.</p>
                    <a href="/forgot-password" className="text-amber-400 underline">Request a new one</a>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-blue-950 p-4">
            <div className="w-full max-w-lg p-8 border-2 border-amber-400 bg-blue-900/30 relative overflow-hidden">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-white mb-2">
                        Set New Password
                    </h1>
                </div>

                <form action={async (formData) => {
                    'use server'
                    const password = formData.get('password') as string
                    const token = formData.get('token') as string
                    const { resetPassword } = await import('@/app/auth/actions')
                    await resetPassword(token, password)
                }} className="space-y-6">
                    <input type="hidden" name="token" value={token} />

                    <div>
                        <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">New Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            minLength={8}
                            className="w-full bg-blue-950 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                        />
                    </div>

                    <button type="submit" className="w-full p-4 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-sm">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    )
}
