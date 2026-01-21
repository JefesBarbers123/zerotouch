
import { connectGoogle, getIntegrationStatus, syncCalendar, disconnectGoogle, getImportHistory, syncContacts } from './actions'
import styles from './integrations.module.css'

export default async function IntegrationsPage() {
    const integration = await getIntegrationStatus()
    const history = await getImportHistory()

    // Shared Styles
    const sectionClasses = "bg-blue-900/20 border-2 border-amber-400/20 p-8 mb-8"
    const titleClasses = "text-xl font-bold uppercase tracking-widest text-white mb-6 border-b border-amber-400/30 pb-2"
    const buttonClasses = "px-6 py-3 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-sm"
    const secondaryButtonClasses = "px-4 py-2 border border-red-500/50 text-red-400 font-mono text-xs uppercase hover:bg-red-500/10 transition-colors"
    const connectedBadgeClasses = "px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/50 font-mono text-xs uppercase tracking-widest"
    const disconnectedBadgeClasses = "px-3 py-1 bg-white/5 text-white/30 border border-white/10 font-mono text-xs uppercase tracking-widest"

    return (
        <div className="p-8 max-w-5xl mx-auto w-full text-white">
            <header className="mb-12 border-b-2 border-amber-400 pb-8">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">
                    Integrations
                </h1>
                <p className="font-mono text-sm text-amber-400/70 uppercase tracking-widest">
                    External System Connections
                </p>
            </header>

            <section className={sectionClasses}>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-950 border-2 border-amber-400/30 flex items-center justify-center font-bold text-3xl text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                            G
                        </div>
                        <div>
                            <h2 className={titleClasses.replace('mb-6', 'mb-2').replace('border-b', '')}>Google Calendar</h2>
                            <p className="text-xs text-white/50 font-mono uppercase tracking-wider">Sync bookings automagically.</p>
                        </div>
                    </div>
                    <div>
                        {integration ? (
                            <span className={connectedBadgeClasses}>Connected</span>
                        ) : (
                            <span className={disconnectedBadgeClasses}>Not Connected</span>
                        )}
                    </div>
                </div>

                <div className="border-t border-white/5 pt-6 mt-6">
                    {!integration ? (
                        <div className="bg-blue-950/30 p-6 border border-white/5">
                            <p className="text-sm text-white/70 mb-4 font-mono">Connect your primary booking calendar to enable 2-way sync.</p>
                            <form action={connectGoogle}>
                                <button type="submit" className={buttonClasses}>
                                    Connect Google Account
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Calendar Sync */}
                            <div className="flex items-center gap-6 bg-blue-950/30 p-6 border border-green-500/20">
                                <div className="flex-1">
                                    <h3 className="text-xs font-bold uppercase text-white/70 mb-2 tracking-widest">Calendar Sync</h3>
                                    <form action={syncCalendar}>
                                        <button type="submit" className={buttonClasses}>
                                            Sync Automagically
                                        </button>
                                    </form>
                                    <p className="text-[10px] text-white/30 font-mono uppercase mt-2">
                                        Last synced: {integration.updatedAt.toLocaleTimeString()}
                                    </p>
                                </div>

                                <div className="h-20 w-px bg-white/10"></div>

                                {/* Contacts Sync */}
                                <div className="flex-1">
                                    <h3 className="text-xs font-bold uppercase text-white/70 mb-2 tracking-widest">Client Import</h3>
                                    <form action={syncContacts}>
                                        <button type="submit" className={buttonClasses}>
                                            Import Contacts
                                        </button>
                                    </form>
                                    <p className="text-[10px] text-white/30 font-mono uppercase mt-2">
                                        Syncs Name, Email & Phone
                                    </p>
                                </div>

                                <div className="h-20 w-px bg-white/10"></div>

                                <form action={disconnectGoogle}>
                                    <button type="submit" className={secondaryButtonClasses}>
                                        Disconnect
                                    </button>
                                </form>
                            </div>
                            <p className="text-[10px] text-amber-400/50 font-mono text-center">* If Import fails, please Disconnect and Re-connect to grant Permissions.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Sync History */}
            {integration && history.length > 0 && (
                <section className={sectionClasses}>
                    <h2 className={titleClasses}>Sync History</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="uppercase tracking-wider border-b-2 border-white/10 font-bold text-white/50 text-[10px]">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Imported At</th>
                                    <th scope="col" className="px-6 py-3">Event Date</th>
                                    <th scope="col" className="px-6 py-3">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-blue-950/30">
                                {history.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-white/60">
                                            {item.createdAt.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-amber-400">
                                            {item.date.toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-white/80">
                                            {item.summary}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    )
}
