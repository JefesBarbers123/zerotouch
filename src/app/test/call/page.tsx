
'use client'

import { useState } from 'react'

export default function TestCallPage() {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('')

    const simulateCall = async () => {
        setLoading(true)
        setStatus('Simulating ring...')

        try {
            await fetch('/api/calls/simulate', {
                method: 'POST',
                body: JSON.stringify({ from: '555-0199' })
            })
            setStatus('Calling! Check your Dashboard tab.')
        } catch (e) {
            setStatus('Error failed.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-12 max-w-lg mx-auto text-center">
            <h1 className="text-3xl font-serif font-bold mb-4">Simulate Incoming Call</h1>
            <p className="text-gray-500 mb-8">
                Press the button below to simulate "Mario" calling the shop.
                Keep your Dashboard open in another tab to see the ID pop up.
            </p>

            <button
                onClick={simulateCall}
                disabled={loading}
                className="w-full py-4 bg-black text-white font-bold text-lg hover:bg-gray-800 disabled:opacity-50 transition-all border border-black"
            >
                {loading ? 'Calling...' : '📞 TRIGGER CALL'}
            </button>

            {status && (
                <p className="mt-8 font-mono text-sm text-green-600 animate-pulse">{status}</p>
            )}
        </div>
    )
}
