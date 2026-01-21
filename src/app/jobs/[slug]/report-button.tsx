'use client'

import { useState } from 'react'
import { reportJob } from '../actions'

export function ReportButton({ jobId }: { jobId: string }) {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')

    async function handleReport() {
        if (!confirm("Report this job as spam or inappropriate?")) return

        setStatus('LOADING')
        const res = await reportJob(jobId, "User Reporting via UI")

        if (res.success) {
            setStatus('SUCCESS')
        } else {
            setStatus('ERROR')
        }
    }

    if (status === 'SUCCESS') {
        return <p className="text-xs text-green-400 font-mono text-center mt-4">✓ Reported to Admin</p>
    }

    return (
        <button
            onClick={handleReport}
            disabled={status === 'LOADING'}
            className="block w-full text-center mt-6 text-[10px] font-mono uppercase text-red-400/50 hover:text-red-400 transition-colors"
        >
            {status === 'LOADING' ? 'Sending Report...' : 'Report this Job'}
        </button>
    )
}
