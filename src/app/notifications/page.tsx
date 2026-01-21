
import { getNotifications } from '../actions/notifications'
import NotificationList from './notification-list'
import { redirect } from 'next/navigation'

export default async function NotificationsPage() {
    const notifications = await getNotifications()

    // Auth check handled by action returning [] or null if session missing, 
    // but better to explicitly protect page if needed. 
    // Assuming middleware or layout protects, but let's be safe:
    if (notifications === null) redirect('/login')

    return (
        <div className="flex-1 flex flex-col p-8 lg:p-12 max-w-4xl mx-auto w-full">
            <header className="mb-12 border-b-2 border-amber-400 pb-8">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">
                    System Alerts
                </h1>
                <p className="font-mono text-sm text-amber-400/70 uppercase tracking-widest">
                    Stay updated on bookings, talent, and system events.
                </p>
            </header>

            <NotificationList notifications={notifications} />
        </div>
    )
}
