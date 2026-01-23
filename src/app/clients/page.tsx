import { getClients } from './actions'
import ClientList from './client-list'
import { getCurrentUser } from '@/lib/auth'
import UpgradeOverlay from '@/components/UpgradeOverlay'

export default async function ClientsPage() {
    const user = await getCurrentUser()

    // DEBUG LOGS (REMOVE LATER)
    console.log("[DEBUG] /clients - User:", user ? `ID: ${user.id}` : 'NULL')
    console.log("[DEBUG] /clients - User Tenant:", user?.tenant)
    console.log("[DEBUG] /clients - Subscription:", user?.tenant?.subscriptionStatus)

    // 1. Not Logged In
    if (!user) {
        return (
            <main className="relative min-h-screen p-8 max-w-7xl mx-auto w-full overflow-hidden">
                <UpgradeOverlay type="LOGIN_REQUIRED" />
                <div className="filter blur-md select-none pointer-events-none opacity-50">
                    <div className="mb-12 border-b-2 border-amber-400 pb-8">
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Client Directory</h1>
                        <p className="font-mono text-sm text-amber-400/70 uppercase tracking-widest">
                            Manage your book
                        </p>
                    </div>
                    {/* Dummy content for visual background */}
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-blue-900/50 border border-white/5 rounded-none" />
                        ))}
                    </div>
                </div>
            </main>
        )
    }

    // 2. Free Tier (Needs Upgrade)
    if (user.tenant.subscriptionStatus === 'FREE') {
        return (
            <main className="relative min-h-screen p-8 max-w-7xl mx-auto w-full overflow-hidden">
                <UpgradeOverlay type="UPGRADE_REQUIRED" />
                <div className="filter blur-md select-none pointer-events-none opacity-50">
                    <div className="mb-12 border-b-2 border-amber-400 pb-8">
                        <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Client Directory</h1>
                        <p className="font-mono text-sm text-amber-400/70 uppercase tracking-widest">
                            Manage your book
                        </p>
                    </div>
                    {/* Dummy content for visual background */}
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-20 bg-blue-900/50 border border-white/5 rounded-none" />
                        ))}
                    </div>
                </div>
            </main>
        )
    }

    // 3. Paid/Authenticated
    const clients = await getClients()

    return (
        <main className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-12 border-b-2 border-amber-400 pb-8">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Client Directory</h1>
                <p className="font-mono text-sm text-amber-400/70 uppercase tracking-widest">
                    Manage your book
                </p>
            </div>
            <ClientList initialClients={clients} onSearch={getClients} />
        </main>
    )
}
