
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    if (!user) return null

    const toggle = () => setIsOpen(!isOpen)

    return (
        <>
            {/* TOGGLE BUTTON (Visible on Mobile) */}
            <button
                onClick={toggle}
                className="lg:hidden fixed top-4 right-4 z-[60] bg-amber-400 text-blue-950 p-3 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform"
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                )}
            </button>

            {/* FULL SCREEN MENU OVERLAY */}
            {isOpen && (
                <div className="fixed inset-0 z-[55] bg-blue-950/95 backdrop-blur-xl flex flex-col p-8 overflow-y-auto animate-in fade-in duration-200">
                    <div className="mb-8 border-b-2 border-amber-400 pb-4">
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-white">
                            Zerotouches.
                        </h1>
                        <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mt-2">
                            Mobile System
                        </p>
                    </div>

                    <nav className="flex-1 space-y-2" onClick={() => setIsOpen(false)}>
                        <div className="mb-6 bg-blue-900/50 p-3 rounded border border-amber-400/20 text-center">
                            <p className="text-[10px] font-mono text-amber-400/60 uppercase mb-1">Operating Credits</p>
                            <p className="text-xl font-black text-white tracking-tighter">
                                £{Number(user.tenant.walletBalance || 0).toFixed(2)}
                            </p>
                        </div>

                        <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">Operations</p>
                        {user.tenant.subscriptionStatus === 'ACTIVE' ? (
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

                            {user.tenant.subscriptionStatus === 'ACTIVE' ? (
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
