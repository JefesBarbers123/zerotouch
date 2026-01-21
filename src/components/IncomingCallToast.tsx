
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function IncomingCallToast() {
    const [call, setCall] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        // Simple polling for demo purposes (Zero dependency)
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/calls/active')
                const data = await res.json()
                if (data.activeCall && (!call || call.id !== data.activeCall.id)) {
                    setCall(data.activeCall)
                    // Play sound?
                } else if (!data.activeCall) {
                    setCall(null)
                }
            } catch (e) {
                console.error("Polling error", e)
            }
        }, 2000)

        return () => clearInterval(interval)
    }, [call])

    if (!call) return null

    return (
        <div className="fixed bottom-6 right-6 bg-black text-white p-6 shadow-2xl border border-gray-800 z-[100] w-96 animate-slide-up">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="text-xs uppercase tracking-widest text-green-400 font-bold mb-1 animate-pulse">
                        Incoming Call...
                    </div>
                    <h3 className="text-xl font-serif font-bold">{call.clientName || 'Unknown Caller'}</h3>
                    <p className="text-sm text-gray-400 font-mono tracking-wide mt-1">{call.from}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
                    📞
                </div>
            </div>

            <div className="border-t border-gray-800 pt-4 mt-4">
                <div className="flex gap-4 text-sm text-gray-300 mb-4">
                    <div>
                        <span className="block text-xs uppercase text-gray-500">Status</span>
                        <span className="text-red-400 font-bold">At Risk</span>
                    </div>
                    <div>
                        <span className="block text-xs uppercase text-gray-500">History</span>
                        <span>5 Visits</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => router.push(`/clients?q=${call.from}`)}
                        className="bg-white text-black py-2 font-bold hover:bg-gray-200 transition-colors"
                    >
                        View Profile
                    </button>
                    <button
                        onClick={() => setCall(null)}
                        className="bg-transparent border border-gray-700 text-gray-400 py-2 hover:border-gray-500 hover:text-white transition-colors"
                    >
                        Ignore
                    </button>
                </div>
            </div>
        </div>
    )
}
