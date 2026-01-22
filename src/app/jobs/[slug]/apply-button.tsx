'use client'

import { useState } from 'react'
import { applyToJob } from '@/app/jobs/actions'
import { useRouter } from 'next/navigation'

export function ApplyButton({ jobId, sourceUrl }: { jobId: string, sourceUrl: string }) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleApply = async (e: React.MouseEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const result = await applyToJob(jobId, sourceUrl)

            if (result.success && result.url) {
                // Open external link
                window.open(result.url, '_blank')
            }
        } catch (e: any) {
            console.error(e)
            if (e.message === "UNAUTHORIZED_LOGIN_REQUIRED") {
                // Redirect to login
                router.push('/login?redirect=/jobs')
            } else if (e.message === "LIMIT_REACHED") {
                alert("You have reached your daily limit of 3 free applications. Please upgrade for unlimited access.")
            } else {
                alert("Failed to apply. Please try again.")
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleApply}
            disabled={isLoading}
            className="block w-full bg-amber-400 hover:bg-white text-blue-950 font-black uppercase tracking-widest text-center py-4 border-2 border-amber-400 hover:border-white transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isLoading ? 'Processing...' : 'Apply Now ↗'}
        </button>
    )
}
