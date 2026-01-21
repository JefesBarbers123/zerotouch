'use client'

import { useState } from 'react'
import { parseText, confirmAssistedVisit } from './actions'
import styles from './assisted.module.css'
import { useRouter } from 'next/navigation'

export default function AssistedForm() {
    const [text, setText] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const router = useRouter()

    const handleParse = async () => {
        if (!text) return
        setIsLoading(true)
        const parsed = await parseText(text)
        setResult(parsed)
        setIsLoading(false)
    }

    const handleConfirm = async () => {
        if (!result) return
        setIsLoading(true)
        await confirmAssistedVisit(result)
        setIsLoading(false)
        router.push('/dashboard')
    }

    return (
        <div>
            <textarea
                className={styles.textarea}
                placeholder="Paste booking text here. Example: 'Hi, can I get a Skin Fade tomorrow at 5pm with Mario?'"
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            {!result && (
                <button
                    className={styles.button}
                    onClick={handleParse}
                    disabled={isLoading || !text}
                >
                    {isLoading ? 'Analyzing...' : 'Parse Booking'}
                </button>
            )}

            {result && (
                <div className={styles.resultCard}>
                    <div className={styles.resultTitle}>
                        <span>Did I get this right?</span>
                        <span className={result.confidence > 0.7 ? styles.confidenceHigh : styles.confidenceLow}>
                            {result.confidence > 0.7 ? 'High Confidence' : 'Low Confidence'}
                        </span>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Client Name</label>
                        <input
                            className={styles.valueInput}
                            value={result.name || ''}
                            onChange={(e) => setResult({ ...result, name: e.target.value })}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Service</label>
                        <input
                            className={styles.valueInput}
                            value={result.serviceName || ''}
                            onChange={(e) => setResult({ ...result, serviceName: e.target.value })}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Date & Time</label>
                        <div className={styles.value}>
                            {result.date ? new Date(result.date).toLocaleDateString() : 'Today'}
                            {result.time && ` at ${result.time}`}
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.cancelButton} onClick={() => setResult(null)}>Cancel</button>
                        <button className={styles.confirmButton} onClick={handleConfirm} disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Confirm & Save'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
