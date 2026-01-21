'use client'

import { useState } from 'react'
import { requestFeedback } from './actions'

export default function FeedbackButton({ clientId }: { clientId: string }) {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE')

    const onClick = async () => {
        setLoading(true)
        try {
            const res = await requestFeedback(clientId)
            if (res.success) {
                setStatus('SUCCESS')
            } else {
                setStatus('ERROR')
                console.error(res.error)
            }
        } catch (e) {
            setStatus('ERROR')
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    if (status === 'SUCCESS') return <span className="text-green-500 text-sm">Request Sent!</span>

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 disabled:opacity-50"
        >
            {loading ? 'Sending...' : 'Request Feedback'}
        </button>
    )
}
