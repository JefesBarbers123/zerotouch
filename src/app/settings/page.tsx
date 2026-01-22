import { getServices, getTenantProfile, updateTenantProfile, getTeamMembers, inviteBarber, deleteTeamMember, updateUserProfile, updateAccountType, getReferralPayload } from './actions'
import { checkPhoneStatus } from './phone/actions'
import { getGoogleStatus } from './integrations/actions'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'
import ServiceManager from './service-manager'

export default async function SettingsPage() {
    const currentUser = await getCurrentUser()
    const services = await getServices()
    const tenant = await getTenantProfile()
    const team = await getTeamMembers()
    const referral = await getReferralPayload()

    // Status Checks

    // Status Checks
    const phoneStatus = await checkPhoneStatus()
    const googleStatus = await getGoogleStatus()

    const isOwner = currentUser?.role === 'OWNER'

    // Shared Styles
    const sectionClasses = "bg-blue-900/20 border-2 border-amber-400/20 p-8 mb-8"
    const titleClasses = "text-xl font-bold uppercase tracking-widest text-white mb-6 border-b border-amber-400/30 pb-2"
    const inputClasses = "w-full bg-blue-950 border-2 border-amber-400/30 p-3 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
    const labelClasses = "block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest"
    const buttonClasses = "px-6 py-3 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-sm"
    const secondaryButtonClasses = "px-4 py-2 border border-red-500/50 text-red-400 font-mono text-xs uppercase hover:bg-red-500/10 transition-colors"

    return (
        <div className="p-8 max-w-5xl mx-auto w-full text-white">
            <header className="mb-12 border-b-2 border-amber-400 pb-8">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">
                    System Settings
                </h1>
                <p className="font-mono text-sm text-amber-400/70 uppercase tracking-widest">
                    Configuration & Fleet Management
                </p>
            </header>

            {/* 1. Business Profile */}
            <section className={sectionClasses} id="profile">
                <h2 className={titleClasses}>HQ Profile</h2>
                <form action={updateTenantProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Shop Name (Brand ID)</label>
                            <input name="name" type="text" defaultValue={tenant?.name} className={inputClasses} disabled={!isOwner} />
                        </div>
                        <div>
                            <label className={labelClasses}>SMS Signature (Phone)</label>
                            <input name="phone" type="tel" defaultValue={tenant?.phone || ''} placeholder="e.g. 07123 456789" className={inputClasses} disabled={!isOwner} />
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Physical Address</label>
                        <input name="address" type="text" defaultValue={tenant?.address || ''} placeholder="123 Barber St, London" className={inputClasses} disabled={!isOwner} />
                    </div>

                    <div>
                        <label className={labelClasses}>Churn Threshold (Days)</label>
                        <div className="flex items-center gap-4">
                            <input name="churnThresholdDays" type="number" defaultValue={tenant?.churnThresholdDays || 28} className={inputClasses} style={{ width: '120px' }} disabled={!isOwner} />
                            <span className="text-xs font-mono text-white/40 uppercase">Days inactive before flagged as "At Risk"</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-blue-950/50 p-4 border border-white/5">
                        <input
                            name="retentionSmsEnabled"
                            type="checkbox"
                            defaultChecked={tenant?.retentionSmsEnabled}
                            className="w-5 h-5 accent-amber-400"
                            disabled={!isOwner}
                        />
                        <div>
                            <label className="block text-xs font-bold uppercase text-white tracking-widest">Auto-Send Retention SMS</label>
                            <span className="text-[10px] font-mono text-white/40 uppercase">Automatically message clients when they become DUE or OVERDUE.</span>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="flex justify-end pt-4 border-t border-white/5">
                            <button type="submit" className={buttonClasses}>Update HQ Profile</button>
                        </div>
                    )}
                </form>
            </section>

            {/* 1.B Account Type & Referral */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <section className={sectionClasses + " mb-0"}>
                    <h2 className={titleClasses}>Operating Mode</h2>
                    <form action={updateAccountType} className="flex gap-4">
                        <button
                            name="accountType"
                            value="PERSONAL"
                            className={`flex-1 p-4 border-2 ${tenant?.accountType === 'PERSONAL' ? 'border-amber-400 bg-amber-400/10 text-white' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                        >
                            <div className="text-xl mb-1">✂️</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest">Solo</div>
                        </button>
                        <button
                            name="accountType"
                            value="BUSINESS"
                            className={`flex-1 p-4 border-2 ${tenant?.accountType === 'BUSINESS' ? 'border-amber-400 bg-amber-400/10 text-white' : 'border-white/10 text-white/50 hover:border-white/30'}`}
                        >
                            <div className="text-xl mb-1">💈</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest">Shop</div>
                        </button>
                    </form>
                    <p className="text-[10px] font-mono text-white/40 mt-4 text-center uppercase">
                        {tenant?.accountType === 'BUSINESS' ? 'Unlocks Staff Management & Analytics' : 'Simplified for Solo Barbers'}
                    </p>
                </section>

                <section className={sectionClasses + " mb-0 bg-amber-400/10 border-amber-400/40"}>
                    <h2 className={titleClasses + " text-amber-400 border-amber-400/40"}>Invite & Earn</h2>
                    <p className="text-xs font-bold text-white mb-4 uppercase tracking-wide">
                        Get 1 Month Free for every shop that joins.
                    </p>
                    <div className="bg-blue-950 p-4 border border-amber-400/30 font-mono text-sm text-amber-400 break-all text-center select-all cursor-pointer">
                        {referral?.link}
                    </div>
                    <div className="flex justify-between mt-4 text-[10px] font-mono text-white/50 uppercase tracking-widest">
                        <span>Your Code: {referral?.code}</span>
                        <span>0 Referred</span>
                    </div>
                </section>
            </div>

            {/* 2. Team Management */}
            <section className={sectionClasses} id="team">
                <h2 className={titleClasses}>Crew Manifest</h2>
                <div className="space-y-4 mb-8">
                    {team.map((member: any) => (
                        <div key={member.id} className="flex justify-between items-center p-4 bg-blue-950 border border-white/5 hover:border-amber-400/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-900 border border-amber-400/30 flex items-center justify-center font-bold text-amber-400">
                                    {member.name?.[0]}
                                </div>
                                <div>
                                    <div className="font-bold uppercase tracking-wider text-sm">{member.name}</div>
                                    <div className="text-[10px] font-mono text-white/40 uppercase">
                                        {member.email} • <span className="text-amber-400">{member.role}</span>
                                    </div>
                                    {(tenant?.accountType === 'BUSINESS' && member.stats) && (
                                        <div className="flex gap-3 mt-1 text-[10px] font-mono text-white/60">
                                            <span>📅 {member.stats.appointmentCount} appts</span>
                                            <span>💰 £{member.stats.revenue.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {isOwner && member.id !== currentUser?.id && (
                                <form action={deleteTeamMember}>
                                    <input type="hidden" name="userId" value={member.id} />
                                    <button type="submit" className={secondaryButtonClasses}>Discharge</button>
                                </form>
                            )}
                        </div>
                    ))}
                </div>

                {isOwner && (
                    <div className="bg-blue-950/50 p-6 border-2 border-dashed border-white/10">
                        <h3 className="text-xs font-bold uppercase text-white/70 mb-4 tracking-widest">Recruit New Barber</h3>
                        <form action={inviteBarber} className="flex flex-col md:flex-row gap-4">
                            <input name="name" type="text" placeholder="FULL NAME" required className={inputClasses} />
                            <input name="email" type="email" placeholder="LOGIN EMAIL" required className={inputClasses} />
                            <button type="submit" className={buttonClasses}>Send Invite</button>
                        </form>
                    </div>
                )}
            </section>

            {/* 3. Services */}
            <section className={sectionClasses} id="services">
                <h2 className={titleClasses}>Service Menu</h2>
                <ServiceManager services={services} isOwner={isOwner} />
            </section>

            {/* 4. Integrations & Systems */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className={sectionClasses}>
                    <h2 className={titleClasses}>External Links</h2>
                    <p className="text-xs text-white/50 font-mono mb-6 leading-relaxed">
                        Connect third-party calendars and CRM tools.
                        <br />Status: {googleStatus ? <span className="text-green-400">ACTIVE</span> : <span className="text-white/30">DISCONNECTED</span>}
                    </p>
                    <Link href="/settings/integrations" className={buttonClasses + " inline-block text-center w-full"}>
                        Manage Integrations
                    </Link>
                </section>

                <section className={sectionClasses}>
                    <h2 className={titleClasses}>Concierge System</h2>
                    <p className="text-xs text-white/50 font-mono mb-6 leading-relaxed">
                        Configure VOIP numbers, call forwarding, and auto-SMS rules.
                        <br />Status: {phoneStatus?.twilioNumber ? <span className="text-amber-400">OPERATIONAL ({phoneStatus.twilioNumber})</span> : <span className="text-white/30">NOT CONFIGURED</span>}
                    </p>
                    <Link href="/settings/phone" className={buttonClasses + " inline-block text-center w-full"}>
                        Configure Phone
                    </Link>
                </section>
            </div>

            {/* 5. Notifications */}
            <section className={sectionClasses} id="notifications">
                <h2 className={titleClasses}>Communications</h2>
                <form action={updateUserProfile} className="flex items-center gap-4 bg-blue-950/50 p-4 border border-white/5">
                    <input
                        name="emailNotificationsEnabled"
                        type="checkbox"
                        defaultChecked={currentUser?.emailNotificationsEnabled ?? true}
                        className="w-5 h-5 accent-amber-400"
                    />
                    <div>
                        <label className="block text-xs font-bold uppercase text-white tracking-widest">Email Notifications</label>
                        <span className="text-[10px] font-mono text-white/40 uppercase">Receive updates about activity and new applications.</span>
                    </div>
                    <button type="submit" className="ml-auto text-xs text-amber-400 font-bold uppercase hover:text-white">Save Prefs</button>
                </form>
            </section>
        </div >
    )
}
