'use client'

import Link from 'next/link'

interface UpgradeOverlayProps {
    type?: 'LOGIN_REQUIRED' | 'UPGRADE_REQUIRED'
}

export default function UpgradeOverlay({ type = 'UPGRADE_REQUIRED' }: UpgradeOverlayProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-md"></div>

            <div className="relative max-w-lg w-full bg-blue-900 border-2 border-amber-400 p-8 text-center shadow-2xl overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-amber-400/20 -mt-2 -mr-2"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-amber-400/20 -mb-2 -ml-2"></div>

                <div className="w-16 h-1 bg-amber-400 mx-auto mb-6"></div>

                <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
                    {type === 'LOGIN_REQUIRED' ? 'Account Required' : 'Premium Access'}
                </h2>

                <div className="text-blue-100 mb-8 font-medium leading-relaxed">
                    <p className="mb-4">
                        For the same price of <span className="text-amber-400 font-bold border-b-2 border-amber-400">1 cut a month</span>,
                        you could <span className="text-green-400 font-bold">3x your turnover</span> with our proven systems.
                    </p>
                    <p className="text-sm opacity-80">
                        Unlock Client Data, Automated SMS, and Staff Performance Tracking.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {type === 'LOGIN_REQUIRED' ? (
                        <>
                            <Link
                                href="/login"
                                className="w-full py-4 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white transition-colors"
                            >
                                Access System
                            </Link>
                            <Link
                                href="/register"
                                className="w-full py-4 border-2 border-white/10 text-white font-bold uppercase tracking-widest hover:bg-white/10 transition-colors"
                            >
                                Create Account
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/settings/billing"
                            className="w-full py-4 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white transition-colors shadow-lg shadow-amber-900/20"
                        >
                            Start Growing Now
                        </Link>
                    )}
                </div>

                <div className="mt-6 text-[10px] uppercase tracking-widest text-white/30 font-mono">
                    Restricted Area • Secure Protocol
                </div>
            </div>
        </div>
    )
}
