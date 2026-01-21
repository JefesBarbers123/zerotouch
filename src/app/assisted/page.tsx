import AssistedForm from './assisted-form'
import styles from './assisted.module.css'

export default function AssistedPage() {
    return (
        <main className={styles.container}>
            <h1 className={styles.title}>Assisted Data Entry (AI)</h1>
            <p className={styles.subtitle}>Paste a text, DM, or email to instantly create a booking.</p>
            <AssistedForm />
        </main>
    )
}
