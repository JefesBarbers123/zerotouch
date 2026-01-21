
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

async function getStats() {
    // 1. Total Tenants
    const tenantCount = await prisma.tenant.count()

    // 2. Total Users
    const userCount = await prisma.user.count()

    // 3. Revenue (Sum of Wallet Tx + Subscriptions)
    // Simplified: Assuming all active tenants pay £30/mo subscription
    // + wallet balance top-ups (tracked in WalletTransaction)
    const activeSubs = await prisma.tenant.count({ where: { subscriptionStatus: 'ACTIVE' } })
    const mrr = activeSubs * 30

    const txSum = await prisma.walletTransaction.aggregate({
        _sum: { amount: true },
        where: { type: 'CREDIT' }
    })
    const totalRevenue = (txSum._sum.amount?.toNumber() || 0) + (mrr * 1) // + 1 month MRR for simple snapshot

    // 4. SMS Profit (80% Margin on SMS Debits)
    const smsTxSum = await prisma.walletTransaction.aggregate({
        _sum: { amount: true },
        where: {
            type: 'DEBIT',
            description: { contains: 'SMS' }
        }
    })
    const smsProfit = Math.abs((smsTxSum._sum.amount?.toNumber() || 0)) * 0.8

    // 5. Costs (Estimated)
    const estimatedCost = 150

    // 6. Sign Ups (Total Users)
    // already have userCount

    // 7. Lifetime Use (Avg Tenant Age in Days)
    const allTenants = await prisma.tenant.findMany({ select: { createdAt: true } })
    const now = new Date()
    const totalDays = allTenants.reduce((acc, t) => {
        const age = now.getTime() - t.createdAt.getTime()
        return acc + age
    }, 0)
    const avgLifetimeDays = allTenants.length > 0 ? Math.floor((totalDays / allTenants.length) / (1000 * 60 * 60 * 24)) : 0

    // 8. Activity Percentage (Tenants with a Visit in last 30 days)
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    const activeTenants = await prisma.visit.groupBy({
        by: ['tenantId'],
        where: { createdAt: { gte: thirtyDaysAgo } },
    })
    const activeRate = allTenants.length > 0 ? ((activeTenants.length / allTenants.length) * 100) : 0

    return { tenantCount, userCount, mrr, totalRevenue, estimatedCost, smsProfit, avgLifetimeDays, activeRate }
}

async function getTenants() {
    return await prisma.tenant.findMany({
        include: { users: true },
        orderBy: { createdAt: 'desc' },
        take: 50
    })
}

export default async function SuperAdminPage() {
    const user = await getCurrentUser()
    if (!user || user.role !== 'SUPER_ADMIN') {
        redirect('/dashboard') // Protect Route
    }

    const stats = await getStats()
    const tenants = await getTenants()

    return (
        <div className="min-h-screen bg-blue-950 text-white p-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-amber-400 mb-8">
                Master Control
            </h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="bg-blue-900/30 border border-amber-400/20 p-6 rounded relative overflow-hidden">
                    <div className="text-xs font-mono uppercase text-white/50 mb-2">Total Revenue (All Time)</div>
                    <div className="text-3xl font-black text-amber-400">£{stats.totalRevenue.toFixed(2)}</div>
                </div>
                <div className="bg-blue-900/30 border border-amber-400/20 p-6 rounded relative overflow-hidden">
                    <div className="text-xs font-mono uppercase text-white/50 mb-2">Monthly Recurring (MRR)</div>
                    <div className="text-3xl font-black text-white">£{stats.mrr.toFixed(2)}</div>
                </div>
                <div className="bg-blue-900/30 border border-amber-400/20 p-6 rounded relative overflow-hidden">
                    <div className="text-xs font-mono uppercase text-white/50 mb-2">Est. Running Cost</div>
                    <div className="text-3xl font-black text-red-400">-£{stats.estimatedCost}</div>
                </div>
                <div className="bg-blue-900/30 border border-amber-400/20 p-6 rounded relative overflow-hidden">
                    <div className="text-xs font-mono uppercase text-white/50 mb-2">Active Tenants</div>
                    <div className="text-3xl font-black text-white">{stats.tenantCount}</div>
                </div>
                <div className="bg-blue-900/30 border border-amber-400/20 p-6 rounded relative overflow-hidden">
                    <div className="text-xs font-mono uppercase text-white/50 mb-2">SMS Profit (80%)</div>
                    <div className="text-3xl font-black text-green-400">£{stats.smsProfit.toFixed(2)}</div>
                </div>
                <div className="bg-blue-900/30 border border-amber-400/20 p-6 rounded relative overflow-hidden">
                    <div className="text-xs font-mono uppercase text-white/50 mb-2">Total Sign Ups</div>
                    <div className="text-3xl font-black text-white">{stats.userCount}</div>
                </div>
                <div className="bg-blue-900/30 border border-amber-400/20 p-6 rounded relative overflow-hidden">
                    <div className="text-xs font-mono uppercase text-white/50 mb-2">Avg. Tenure</div>
                    <div className="text-3xl font-black text-white">{stats.avgLifetimeDays} <span className="text-xs text-white/40">days</span></div>
                </div>
                <div className="bg-blue-900/30 border border-amber-400/20 p-6 rounded relative overflow-hidden">
                    <div className="text-xs font-mono uppercase text-white/50 mb-2">Activity Rate (30d)</div>
                    <div className="text-3xl font-black text-amber-400">{stats.activeRate.toFixed(1)}%</div>
                </div>
            </div>

            {/* Tenant Management */}
            <div className="bg-blue-900/20 border border-white/10 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="font-bold uppercase tracking-widest text-sm">Tenant Database</h2>
                    <span className="text-xs font-mono text-white/40">{stats.tenantCount} Records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-mono">
                        <thead className="bg-blue-950 text-white/40 uppercase text-xs">
                            <tr>
                                <th className="p-4">Tenant Name</th>
                                <th className="p-4">Owner</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Wallet</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tenants.map((t) => (
                                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-bold text-white">{t.name}</td>
                                    <td className="p-4 text-white/70">
                                        {t.users.find(u => u.role === 'OWNER')?.email || 'Unknown'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2 py-1 rounded text-[10px] uppercase font-bold ${t.subscriptionStatus === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                                            {t.subscriptionStatus}
                                        </span>
                                    </td>
                                    <td className="p-4">£{t.walletBalance.toString()}</td>
                                    <td className="p-4 text-right">
                                        <button className="text-amber-400 hover:text-white underline text-xs uppercase">Manage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
