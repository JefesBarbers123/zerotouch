
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    const toggle = () => setIsOpen(!isOpen)

    return (
        <>
            {/* MOBILE HEADER BAR */}
            <div className="lg:hidden sticky top-0 w-full z-[60] bg-blue-900 border-b-2 border-amber-400 flex justify-between items-center p-4 text-white shadow-md">
                <Link href="/" className="font-black uppercase tracking-tighter text-lg">
                    Zerotouches
                </Link>

                <button
                    onClick={toggle}
                    className="text-xs font-mono bg-amber-400 text-blue-950 px-2 py-1 font-bold hover:bg-white transition-colors"
                >
                    {isOpen ? 'CLOSE' : 'MENU'}
                </button>
            </div>

            {/* FULL SCREEN MENU OVERLAY */}
            {isOpen && (
                <div className="fixed inset-0 z-[55] bg-blue-950/95 backdrop-blur-xl flex flex-col p-8 pt-24 overflow-y-auto animate-in fade-in duration-200">
                    <div className="mb-8 border-b-2 border-amber-400 pb-4">
                        <Link href="/" className="text-3xl font-black uppercase tracking-tighter leading-none text-white block">
                            Zerotouches.
                        </Link>
                        <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mt-2">
                            Mobile System
                        </p>
                    </div>

                    <nav className="flex-1 space-y-2" onClick={() => setIsOpen(false)}>
                        {user ? (
                            <>
                                <div className="mb-6 bg-blue-900/50 p-3 rounded border border-amber-400/20 text-center">
                                    <p className="text-[10px] font-mono text-amber-400/60 uppercase mb-1">Operating Credits</p>
                                    <p className="text-xl font-black text-white tracking-tighter">
                                        £{Number(user.tenant?.walletBalance || 0).toFixed(2)}
                                    </p>
                                </div>

                                <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">Operations</p>
                                {user.tenant?.subscriptionStatus === 'ACTIVE' ? (
                                    <>
                                        <NavLink href="/dashboard">Dashboard</NavLink>
                                        <NavLink href="/clients">Clients</NavLink>
                                        <NavLink href="/check-in">Check In</NavLink>
                                    </>
                                ) : (
                                    <div className="opacity-70">
                                        <NavLink href="/upgrade">Dashboard 🔒</NavLink>
                                        <NavLink href="/upgrade">Clients 🔒</NavLink>
                                        <NavLink href="/upgrade">Check In 🔒</NavLink>
                                    </div>
                                )}

                                <div className="pt-4 mt-4 border-t-2 border-amber-400/20">
                                    <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">System</p>
                                    <NavLink href="/settings">Settings</NavLink>
                                    <NavLink href="/settings/billing">Billing & Plans</NavLink>

                                    {user.tenant?.subscriptionStatus === 'ACTIVE' ? (
                                        <NavLink href="/settings/phone">Concierge Phone</NavLink>
                                    ) : (
                                        <NavLink href="/upgrade">Concierge Phone 🔒</NavLink>
                                    )}

                                    <div className="pt-4 pb-2 text-xs font-bold text-amber-500/50 uppercase tracking-widest">Network</div>

                                    <NavLink href="/barber/profile">My Profile</NavLink>
                                    {user.role === 'OWNER' && (
                                        <NavLink href="/shop/profile">Shop Profile</NavLink>
                                    )}
                                    <NavLink href="/jobs">Job Board</NavLink>
                                    <NavLink href="/notifications">Alerts</NavLink>
                                    <NavLink href="/assisted">AI Console</NavLink>
                                    <NavLink href="/help">Manual</NavLink>
                                </div>

                                {user.role === 'OWNER' && (
                                    <div className="pt-4 mt-4 border-t-2 border-amber-400/20">
                                        <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">Admin</p>
                                        <NavLink href="/admin/sources">Job Sources</NavLink>
                                        <NavLink href="/admin/jobs">Job Moderation</NavLink>
                                    </div>
                                )}

                                <div className="pt-4 mt-4 border-t-2 border-amber-400/20">
                                    <form action={async () => {
                                        'use server'
                                        const { logout } = await import('../app/login/actions')
                                        await logout()
                                    }}>
                                        <button className="flex items-center justify-center w-full px-4 py-3 text-sm font-black uppercase tracking-wider border-2 border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/20">
                                            Sign Out
                                        </button>
                                    </form>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-6 p-4 rounded border border-amber-400/20 text-center bg-blue-900/50">
                                    <p className="text-sm font-bold text-white mb-2">Barber Retention System</p>
                                    <Link href="/login" className="block w-full bg-amber-400 text-blue-950 font-bold py-2 uppercase tracking-wide text-xs rounded hover:bg-white transition-colors">
                                        Login / Join
                                    </Link>
                                </div>
                                <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">Operations</p>
                                <div className="opacity-70">
                                    <NavLink href="/login">Dashboard 🔒</NavLink>
                                    <NavLink href="/login">Clients 🔒</NavLink>
                                    <NavLink href="/login">Check In 🔒</NavLink>
                                </div>

                                <div className="pt-4 mt-4 border-t-2 border-amber-400/20">
                                    <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">System</p>
                                    <NavLink href="/">Job Board</NavLink>
                                    <NavLink href="/login">Barber Login</NavLink>
                                    <div className="mt-4 opacity-70">
                                        <NavLink href="/login">Concierge Phone 🔒</NavLink>
                                        <NavLink href="/login">AI Console 🔒</NavLink>
                                    </div>
                                </div>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </>
    )
}

function NavLink({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
    return (
        <Link href={href} className={`flex items-center px-4 py-3 text-sm font-bold uppercase tracking-wider border-2 border-transparent hover:border-amber-400 hover:bg-amber-400 hover:text-blue-950 transition-all text-amber-400/60 ${className || ''}`}>
            {children}
        </Link>
    )
}
