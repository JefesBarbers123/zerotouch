
import { getDashboardStats, getAtRiskClients } from './actions'


import Link from 'next/link'
import ClientHealthWidget from './ClientHealthWidget'

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const atRiskClients = await getAtRiskClients()
    const isOwner = stats.userRole === 'OWNER'

    return (
        <div className="p-8 max-w-7xl mx-auto w-full">
            <header className="mb-12 border-b-2 border-amber-400 pb-8">
                <h1 className="text-5xl font-black text-white mb-2">Dashboard</h1>
                <p className="font-mono text-sm text-amber-400/70 uppercase tracking-widest">
                    Operator: <span className="text-white">{stats.userName}</span> // Role: <span className="text-white">{stats.userRole}</span>
                </p>
            </header>

            <ClientHealthWidget atRiskClients={atRiskClients} />

            {/* High Level Stats */}
            <h2 className="text-xs font-bold uppercase text-white mb-4 tracking-widest pl-1">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                <div className="card group hover:bg-amber-400/10 transition-colors">
                    <div className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                        {isOwner ? 'Shop 30-Day Revenue' : 'My 30-Day Revenue'}
                    </div>
                    <div className="text-5xl font-mono text-green-400">£{stats.revenue30Days.toLocaleString()}</div>
                </div>

                {isOwner ? (
                    <div className="card group hover:bg-amber-400/10 transition-colors">
                        <div className="text-xs font-bold uppercase tracking-widest text-white mb-4">Potential Lost Revenue</div>
                        <div className="text-5xl font-mono text-red-400">£{stats.potentialLostRevenue?.toLocaleString()}</div>
                        <div className="text-[10px] uppercase tracking-wide text-amber-400/50 mt-4 border-t border-amber-400/20 pt-2">
                            If Overdue/Churned not recovered
                        </div>
                    </div>
                ) : (
                    <div className="card group hover:bg-amber-400/10 transition-colors">
                        <div className="text-xs font-bold uppercase tracking-widest text-white mb-4">My Activity (30d)</div>
                        <div className="text-5xl font-mono text-amber-400">{stats.myVisitCount}</div>
                        <div className="text-[10px] uppercase tracking-wide text-amber-400/50 mt-4 border-t border-amber-400/20 pt-2">
                            Visits completed
                        </div>
                    </div>
                )}

                <div className="card group hover:bg-amber-400/10 transition-colors">
                    <div className="text-xs font-bold uppercase tracking-widest text-white mb-4">Active Clients</div>
                    <div className="text-5xl font-mono text-amber-400">{stats.statusCounts['ACTIVE'] || 0}</div>
                    <div className="text-[10px] uppercase tracking-wide text-amber-400/50 mt-4 border-t border-amber-400/20 pt-2">
                        Shop-wide
                    </div>
                </div>
            </div>

            {/* Retention Funnel */}
            <div className="mb-12">
                <h2 className="text-xs font-bold uppercase text-white mb-4 tracking-widest pl-1 border-b border-amber-400/30 pb-2">Retention Funnel (Shop Wide)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card border-l-4 border-l-blue-400">
                        <div className="text-xs font-bold uppercase tracking-widest text-blue-300 mb-4">Due Soon</div>
                        <div className="text-4xl font-mono text-white">{stats.statusCounts['DUE'] || 0}</div>
                        <div className="text-[10px] uppercase tracking-wide text-amber-400/50 mt-2">Window to rebook</div>
                    </div>
                    <div className="card border-l-4 border-l-orange-400">
                        <div className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-4">Overdue</div>
                        <div className="text-4xl font-mono text-white">{stats.statusCounts['OVERDUE'] || 0}</div>
                        <div className="text-[10px] uppercase tracking-wide text-amber-400/50 mt-2">Immediate Message Required</div>
                    </div>
                    <div className="card border-l-4 border-l-red-500">
                        <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-4">Churned</div>
                        <div className="text-4xl font-mono text-white">{stats.statusCounts['CHURNED'] || 0}</div>
                        <div className="text-[10px] uppercase tracking-wide text-amber-400/50 mt-2">Requires Win-Back Offer</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
