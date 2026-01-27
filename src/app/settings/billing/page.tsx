
import { getBillingData, createTopUpCheckout, createSubscriptionCheckout } from './actions'
import { formatAmount } from '@/lib/stripe'
import { redirect } from 'next/navigation'

export default async function BillingPage({ searchParams }: { searchParams: { success?: string, canceled?: string, error?: string } }) {
    const data = await getBillingData()
    if (!data) redirect('/login')

    const isPro = data.subscriptionStatus === 'ACTIVE'
    const balance = Number(data.walletBalance)

    return (
        <div className="bg-blue-950 min-h-screen text-amber-400 font-sans p-8 lg:p-12">
            <header className="mb-12 border-b-2 border-amber-400 pb-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 text-white">
                    Billing & Resources
                </h1>
                <p className="font-mono text-xs text-amber-400/70 uppercase tracking-widest">
                    Manage your operating capital and system access.
                </p>
            </header>

            {searchParams.success && (
                <div className="mb-8 p-4 bg-green-900/40 border-2 border-green-500 text-green-400 font-mono text-sm uppercase">
                    Transaction Successful. Your balance/status has been updated.
                </div>
            )}

            {searchParams.error && (
                <div className="mb-8 p-4 bg-red-900/40 border-2 border-red-500 text-red-400 font-mono text-sm uppercase">
                    System Error: Payment Initialization Failed. Please check server logs or contact support.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* 1. WALLET SECTION */}
                <div className="space-y-8">
                    <section className="bg-blue-900/30 border-2 border-amber-400 p-8">
                        <h2 className="font-mono text-xs font-bold uppercase mb-6 tracking-wider text-white border-b-2 border-amber-400/20 pb-2">
                            Operating Wallet
                        </h2>

                        <div className="mb-8">
                            <p className="font-mono text-xs text-amber-400/60 uppercase mb-1">Current Balance</p>
                            <p className="text-6xl font-black text-white tracking-tighter">
                                {formatAmount(balance * 100)}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[1000, 2000, 5000].map((amount) => (
                                <form key={amount} action={createTopUpCheckout.bind(null, amount)}>
                                    <button className="w-full py-4 border-2 border-amber-400 hover:bg-amber-400 hover:text-blue-950 transition-all font-bold uppercase tracking-wider text-sm">
                                        + {formatAmount(amount)}
                                    </button>
                                </form>
                            ))}
                        </div>
                        <p className="mt-4 text-[10px] font-mono text-amber-400/40 uppercase">
                            Funds used for SMS Messaging & Concierge Phone Rentals.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-mono text-xs font-bold uppercase mb-6 tracking-wider text-white border-b-2 border-amber-400/20 pb-2">
                            Recent Transactions
                        </h2>
                        <div className="space-y-2">
                            {data.transactions.length === 0 && (
                                <p className="text-xs font-mono text-white/30 uppercase">No transactions recorded.</p>
                            )}
                            {data.transactions.map((tx) => (
                                <div key={tx.id} className="flex justify-between items-center py-3 border-b border-amber-400/10">
                                    <div>
                                        <p className="text-white font-bold text-xs uppercase">{tx.type.replace('_', ' ')}</p>
                                        <p className="text-[10px] font-mono text-amber-400/60">{tx.description} • {new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`font-mono text-sm font-bold ${Number(tx.amount) > 0 ? 'text-green-400' : 'text-amber-400'}`}>
                                        {Number(tx.amount) > 0 ? '+' : ''}{formatAmount(Number(tx.amount) * 100)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* 2. SUBSCRIPTION SECTION */}
                <div className="space-y-8">
                    <section className={`p-8 border-2 ${isPro ? 'border-green-500 bg-green-900/10' : 'border-white/20 bg-white/5'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="font-mono text-xs font-bold uppercase mb-2 tracking-wider text-white">
                                    System Access Plan
                                </h2>
                                <h3 className="text-3xl font-black uppercase text-white">
                                    {isPro ? 'Operational' : 'Restricted'}
                                </h3>
                            </div>
                            <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${isPro ? 'border-green-500 text-green-400' : 'border-red-500 text-red-500'}`}>
                                {data.subscriptionStatus}
                            </div>
                        </div>

                        {!isPro ? (
                            <div className="space-y-6">
                                <p className="text-sm text-white/70 leading-relaxed font-mono">
                                    Access to Clients, Dashboard, and Automations is currently locked. Upgrade to unlock full system capabilities.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs uppercase font-bold text-amber-400">
                                        <span>✓</span> Operations Dashboard
                                    </div>
                                    <div className="flex items-center gap-2 text-xs uppercase font-bold text-amber-400">
                                        <span>✓</span> Client CRM & History
                                    </div>
                                    <div className="flex items-center gap-2 text-xs uppercase font-bold text-amber-400">
                                        <span>✓</span> Automated Check-ins
                                    </div>
                                </div>
                                <form action={createSubscriptionCheckout}>
                                    <button className="w-full py-4 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white transition-colors">
                                        Activate System (£30/mo)
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm text-green-400 font-mono uppercase mb-4">
                                    All systems operational. Next billing date: [Stripe Managed]
                                </p>
                                <button disabled className="w-full py-4 border-2 border-white/10 text-white/30 font-bold uppercase tracking-widest cursor-not-allowed">
                                    Plan Active
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="bg-blue-900/30 p-8 border border-white/5">
                        <h2 className="font-mono text-xs font-bold uppercase mb-4 tracking-wider text-white">
                            Merchant ID
                        </h2>
                        <p className="font-mono text-xs text-white/50 break-all">
                            {data.stripeCustomerId || 'NOT_LINKED'}
                        </p>
                    </section>
                </div>

            </div>
        </div>
    )
}
