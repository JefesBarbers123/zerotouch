
import { getClientDetails } from '../actions'
import styles from './profile.module.css'
import { notFound } from 'next/navigation'
import FeedbackButton from '../feedback-button'

export default async function ClientProfilePage({ params }: { params: { id: string } }) {
    const client = await getClientDetails(params.id)

    if (!client) {
        notFound()
    }

    return (
        <main className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.name}>{client.name}</h1>
                        <p className={styles.meta}>{client.mobile} • {client.email || 'No Email'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`${styles.badge} ${styles['status_' + client.status]}`}>
                            {client.status}
                        </span>
                        <FeedbackButton clientId={client.id} />
                    </div>
                </div>

                <div className={styles.statsGrid}>
                    <div className={styles.stat}>
                        <div className={styles.statLabel}>Total Visits</div>
                        <div className={styles.statValue}>{client.stats.totalVisits}</div>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.statLabel}>Total Spent</div>
                        <div className={styles.statValue}>£{client.stats.totalSpent}</div>
                    </div>
                    <div className={styles.stat}>
                        <div className={styles.statLabel}>Retention</div>
                        <div className={styles.statValue}>-</div>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <h3 className={styles.sectionTitle}>Visit History</h3>
                <div className={styles.timeline}>
                    {client.visits.length === 0 && <p className={styles.subtext}>No visits recorded yet.</p>}

                    {client.visits.map((visit: any) => (
                        <div key={visit.id} className={styles.timelineItem}>
                            <div className={styles.timelineDate}>{new Date(visit.date).toLocaleDateString()}</div>
                            <div className={styles.timelineContent}>
                                {visit.service.name}
                                <span className={styles.subtext}> with {visit.barber.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
