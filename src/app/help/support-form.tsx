'use client'

import { useState } from 'react'
import { submitSupportRequest } from './actions'

export function SupportForm() {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')

    async function handleSubmit(formData: FormData) {
        setStatus('LOADING')
        const res = await submitSupportRequest(formData)
        if (res.success) {
            setStatus('SUCCESS')
            // Optionally reset form
        } else {
            setStatus('ERROR')
        }
    }

    if (status === 'SUCCESS') {
        return (
            <div className="bg-green-500/10 border border-green-500/50 p-6 text-center rounded">
                <p className="text-green-400 font-bold mb-2 uppercase tracking-wide">✓ Request Received</p>
                <p className="text-sm text-green-300">We've sent a confirmation to your email. An admin will review shortly.</p>
                <button
                    onClick={() => setStatus('IDLE')}
                    className="mt-4 text-xs underline text-green-400/70 hover:text-green-400"
                >
                    Send another message
                </button>
            </div>
        )
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-mono uppercase text-amber-400 font-bold mb-1">Subject</label>
                <select name="subject" className="w-full bg-blue-900/50 border border-white/10 text-white p-3 focus:outline-none focus:border-amber-400 transition-colors">
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Billing Question">Billing Question</option>
                    <option value="Feature Request">Feature Request</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-mono uppercase text-amber-400 font-bold mb-1">Message</label>
                <textarea
                    name="message"
                    required
                    rows={4}
                    placeholder="How can we help?"
                    className="w-full bg-blue-900/50 border border-white/10 text-white p-3 focus:outline-none focus:border-amber-400 transition-colors"
                />
            </div>

            <button
                disabled={status === 'LOADING'}
                className="w-full bg-amber-400 text-blue-950 font-black uppercase tracking-widest py-4 hover:bg-white transition-colors disabled:opacity-50"
            >
                {status === 'LOADING' ? 'Sending...' : 'Send Request'}
            </button>

            {status === 'ERROR' && (
                <p className="text-center text-red-400 text-xs font-mono">Failed to send. Please try again.</p>
            )}
        </form>
    )
}
