
import Link from 'next/link'
import { SupportForm } from './support-form'

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-blue-950 text-white font-sans selection:bg-amber-400 selection:text-blue-950">
            {/* Header */}
            <div className="bg-blue-900/50 border-b border-white/10 p-8 md:p-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-4">
                        Operator Manual<span className="text-amber-400">.</span>
                    </h1>
                    <p className="text-lg text-blue-200 font-mono uppercase tracking-wide max-w-2xl mx-auto">
                        Zerotouches System Reference
                    </p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-8 md:p-12 space-y-24">

                {/* 1. DASHBOARD */}
                <section id="dashboard" className="scroll-mt-24">
                    <div className="flex items-baseline gap-4 mb-6 border-b border-white/10 pb-4">
                        <span className="text-amber-400 font-mono text-xl">01</span>
                        <h2 className="text-3xl font-black uppercase tracking-tight">The Dashboard</h2>
                    </div>

                    <div className="prose prose-invert prose-lg text-blue-100 max-w-none">
                        <p>
                            The Dashboard is your primary command center. It provides a real-time snapshot of your business health, focusing on two critical areas: <strong>Revenue</strong> and <strong>Retention</strong>.
                        </p>

                        <h3 className="text-white font-bold uppercase text-lg mt-8 mb-4">Reading the Data</h3>
                        <ul className="space-y-4 list-none pl-0">
                            <li className="bg-blue-900/20 p-4 border-l-2 border-amber-400">
                                <strong className="text-white block mb-1">Total Revenue</strong>
                                Calculating the 30-day rolling income from all completed appointments. This helps you track performance against your monthly targets.
                            </li>
                            <li className="bg-blue-900/20 p-4 border-l-2 border-amber-400">
                                <strong className="text-white block mb-1">Client Retention</strong>
                                This percentage represents clients who have booked a second visit within your defined churn window (usually 30-60 days). A retention rate above 70% is considered healthy.
                            </li>
                        </ul>

                        <h3 className="text-white font-bold uppercase text-lg mt-8 mb-4">Action Items</h3>
                        <p>
                            On the right side of the dashboard, look for the <strong>"Action Required"</strong> list. This system automatically flags clients who have moved from "Due" to "Overdue".
                        </p>
                        <p>
                            <strong>Tip:</strong> Click on an overdue client's name to instantly send them a re-engagement SMS.
                        </p>
                    </div>
                </section>

                {/* 2. CONCIERGE PHONE */}
                <section id="concierge" className="scroll-mt-24">
                    <div className="flex items-baseline gap-4 mb-6 border-b border-white/10 pb-4">
                        <span className="text-amber-400 font-mono text-xl">02</span>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Concierge Phone</h2>
                    </div>

                    <div className="prose prose-invert prose-lg text-blue-100 max-w-none">
                        <p>
                            The Concierge Phone acts as your 24/7 receptionist. It ensures you never miss a booking opportunity, even when you're busy with a client.
                        </p>

                        <h3 className="text-white font-bold uppercase text-lg mt-8 mb-4">How it Works</h3>
                        <ol className="list-decimal pl-4 space-y-2 marker:text-amber-400 marker:font-bold">
                            <li><strong>Provisioning:</strong> You purchase a local business number (e.g., 0161 for Manchester) through the Settings panel.</li>
                            <li><strong>Call Forwarding:</strong> Any call to this business number is instantly forwarded to your personal mobile. You interpret the call as normal.</li>
                            <li><strong>Missed Call Protection:</strong> If you decline the call (because you are cutting hair) or miss it, the system detects this disconnect.</li>
                            <li><strong>Auto-Reply:</strong> Within seconds, the system sends an SMS to the caller: <em>"Sorry I missed you! I'm with a client. Reply to this text to book a slot."</em></li>
                        </ol>

                        <div className="bg-amber-400/10 p-4 rounded mt-6 border border-amber-400/20">
                            <p className="text-sm text-amber-200 m-0">
                                <strong>Note:</strong> Maintaining a phone line costs <strong>£2.50/month</strong>, deducted from your wallet balance.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 3. INTEGRATIONS */}
                <section id="integrations" className="scroll-mt-24">
                    <div className="flex items-baseline gap-4 mb-6 border-b border-white/10 pb-4">
                        <span className="text-amber-400 font-mono text-xl">03</span>
                        <h2 className="text-3xl font-black uppercase tracking-tight">Integrations</h2>
                    </div>

                    <div className="prose prose-invert prose-lg text-blue-100 max-w-none">
                        <p>
                            Zerotouches connects with your existing tools to minimize data entry.
                        </p>

                        <h3 className="text-white font-bold uppercase text-lg mt-8 mb-4">Google Contacts CRM</h3>
                        <p>
                            The most powerful way to populate your client database is via the Google Contacts sync.
                        </p>
                        <ul className="list-disc pl-4 space-y-2 marker:text-amber-400">
                            <li>Navigate to <strong>Settings &rarr; Integrations</strong>.</li>
                            <li>Click "Sync Google Contacts".</li>
                            <li>Grant permission.</li>
                            <li>The system will import all contacts with valid mobile numbers directly into your "Clients" tab. Duplicate entries are automatically merged.</li>
                        </ul>
                    </div>
                </section>

                {/* 4. SUPPORT BOX */}
                <section id="support" className="scroll-mt-24 pt-12 border-t-2 border-amber-400/20">
                    <div className="bg-blue-900/30 p-8 md:p-12 border border-white/10 rounded-2xl relative overflow-hidden">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 p-32 bg-amber-400/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                        <div className="grid md:grid-cols-2 gap-12 relative z-10">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-4">
                                    Need Assistance?
                                </h2>
                                <p className="text-blue-200 mb-8 leading-relaxed">
                                    Our support team is available to help with technical setup, billing inquiries, or feature requests.
                                </p>
                                <p className="text-sm text-white/40 font-mono uppercase tracking-widest border-l-2 border-white/20 pl-4 mb-8">
                                    Direct Line to Admin
                                </p>
                                <div className="text-xs text-amber-400/60 font-mono">
                                    Replies sent to your dashboard & email.
                                </div>
                            </div>

                            <div className="bg-blue-950 p-6 rounded border border-white/5 shadow-xl">
                                <SupportForm />
                            </div>
                        </div>
                    </div>
                </section>

            </div>

            <div className="mt-24 py-12 border-t border-white/10 bg-blue-900/20 text-center">
                <p className="font-mono text-xs text-white/30 uppercase tracking-widest mb-4">Zerotouches OS v2.5</p>
                <Link href="/dashboard" className="text-amber-400 font-bold uppercase tracking-wide border-b-2 border-amber-400 hover:text-white hover:border-white transition-all">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    )
}
