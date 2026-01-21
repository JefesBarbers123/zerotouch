'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AREA_CODES } from '@/lib/phone_constants'
import { searchNumbers, purchaseNumber, updateForwardingSettings } from './actions'

export default function PhoneSettingsPage({ activeNumber, personalNumber, smsEnabled }: { activeNumber: string | null, personalNumber: string | null, smsEnabled: boolean }) {
    const router = useRouter()

    // Search State
    const [country, setCountry] = useState<'GB' | 'US'>('GB')
    const [areaCode, setAreaCode] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [searchError, setSearchError] = useState<string | null>(null)
    const [purchasing, setPurchasing] = useState<string | null>(null)

    // Settings State
    const [savingSettings, setSavingSettings] = useState(false)
    const [settingsError, setSettingsError] = useState<string | null>(null)
    const [isSmsEnabled, setIsSmsEnabled] = useState(smsEnabled)

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setSearchError(null)
        setResults([])

        const formData = new FormData()
        formData.append('country', country)
        formData.append('areaCode', areaCode)

        try {
            const res = await searchNumbers(formData)
            if (res.success && res.numbers) {
                setResults(res.numbers)
            } else {
                setSearchError(res.error || 'Failed to search')
            }
        } catch (err) {
            setSearchError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    async function handleBuy(phoneNumber: string) {
        setPurchasing(phoneNumber)
        try {
            const res = await purchaseNumber(phoneNumber)
            if (res.success) {
                router.refresh()
            } else {
                setSearchError(res.error || 'Failed to purchase')
            }
        } catch (err) {
            setSearchError('Failed to purchase')
        } finally {
            setPurchasing(null)
        }
    }

    // Shared Styles
    const containerClasses = "bg-blue-900/20 border-2 border-amber-400/20 p-8 mb-8"
    const titleClasses = "text-xl font-bold uppercase tracking-widest text-white mb-6 border-b border-amber-400/30 pb-2"
    const inputClasses = "w-full bg-blue-950 border-2 border-amber-400/30 p-3 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
    const labelClasses = "block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest"
    const buttonClasses = "px-6 py-3 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-sm disabled:opacity-50"

    return (
        <div className="p-8 max-w-5xl mx-auto w-full text-white min-h-screen">
            <header className="mb-12 border-b-2 border-amber-400 pb-8">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">
                    Concierge Phone
                </h1>
                <p className="font-mono text-sm text-amber-400/70 uppercase tracking-widest">
                    VOIP Voice & SMS Automation
                </p>
            </header>

            {/* ACTIVE NUMBER & SETTINGS */}
            {activeNumber ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT: STATUS */}
                    <div className={containerClasses}>
                        <h2 className={titleClasses}>System Status</h2>
                        <div className="text-center py-8 bg-blue-950/50 border border-white/5 mb-6">
                            <div className="text-sm font-mono text-white/50 uppercase mb-2">Active Line</div>
                            <div className="text-4xl font-mono font-bold text-white mb-4">{activeNumber}</div>
                            <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest border border-green-500/30">
                                ● Online & Routing
                            </span>
                        </div>
                        <div className="text-xs text-white/40 font-mono leading-relaxed">
                            This number is owned by your shop. Incoming calls are forwarded to your personal device. Missed calls trigger an auto-SMS response.
                        </div>
                    </div>

                    {/* RIGHT: CONFIGURATION */}
                    <div className={containerClasses}>
                        <h2 className={titleClasses}>Routing Rules</h2>
                        <form action={async (formData) => {
                            setSavingSettings(true)
                            setSettingsError(null)
                            const res = await updateForwardingSettings(formData)
                            if (!res.success) {
                                setSettingsError(res.error || 'Failed to save settings')
                            }
                            setSavingSettings(false)
                        }} className="space-y-6">

                            <div>
                                <label className={labelClasses}>Forward Calls To (Personal Mobile)</label>
                                <input
                                    name="phone"
                                    defaultValue={personalNumber || ''}
                                    placeholder="+447700900000"
                                    className={inputClasses}
                                />
                                <p className="text-[10px] text-white/30 font-mono mt-1">* Required for live forwarding. Use International format.</p>
                            </div>

                            <div className="bg-blue-950 p-4 border border-white/5">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="smsAutoReplyEnabled"
                                        checked={isSmsEnabled}
                                        onChange={(e) => setIsSmsEnabled(e.target.checked)}
                                        className="w-5 h-5 accent-amber-400"
                                    />
                                    <span className="font-bold uppercase tracking-wider text-xs text-white">Enable Auto-SMS Reply</span>
                                </label>

                                {isSmsEnabled ? (
                                    <>
                                        <div className="mt-3 pl-8 text-xs text-green-400/80 font-mono border-l-2 border-green-400/30">
                                            Active: Missed calls trigger an apology SMS. <br />
                                            Cost: £0.05/msg from Wallet.
                                        </div>
                                        <div className="mt-3 pl-8">
                                            <label className={labelClasses}>Custom Message</label>
                                            <textarea
                                                name="smsAutoReplyMessage"
                                                defaultValue={activeNumber ? "Sorry, I missed your call. Whats up? Ill call you back in a second" : ""}
                                                className={inputClasses + " h-24 resize-none"}
                                                placeholder="Enter your auto-reply text here..."
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="mt-3 pl-8 text-xs text-red-400/80 font-mono border-l-2 border-red-400/30">
                                        Disabled: No SMS will be sent.
                                    </div>
                                )}
                            </div>

                            {settingsError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-mono">
                                    ERROR: {settingsError}
                                </div>
                            )}

                            <button
                                disabled={savingSettings}
                                className={buttonClasses + " w-full"}
                            >
                                {savingSettings ? 'Saving Configuration...' : 'Update Routing Rules'}
                            </button>

                            {/* FEEDBACK LOOP INFO */}
                            <div className="pt-8 border-t border-amber-400/20">
                                <h3 className="text-sm font-bold uppercase text-white mb-4 tracking-widest">Active workfows</h3>
                                <div className="bg-blue-950 p-4 border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <div className="text-4xl">💬</div>
                                    </div>
                                    <div className="font-bold uppercase tracking-wider text-xs text-amber-400 mb-2">Feedback Loop</div>
                                    <p className="text-[10px] text-white/60 font-mono mb-3 leading-relaxed">
                                        Trigger via Client Profile. Auto-handles responses:
                                    </p>
                                    <ul className="text-[10px] text-white/40 font-mono space-y-1 mb-3">
                                        <li>• &quot;Good&quot; → Request Google Review</li>
                                        <li>• &quot;Bad&quot; → Alert Manager</li>
                                    </ul>
                                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] font-bold uppercase text-green-500">System Ready</span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div >
            ) : (
                /* NO NUMBER - PURCHASE FLOW */
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="w-full lg:w-96 shrink-0">
                        <div className={containerClasses + " sticky top-8"}>
                            <h2 className={titleClasses}>Provision New Line</h2>
                            <div className="space-y-6">
                                <div>
                                    <label className={labelClasses}>Region Selection</label>
                                    <div className="flex bg-blue-950 p-1 border border-amber-400/30">
                                        <button
                                            onClick={() => { setCountry('GB'); setAreaCode('') }}
                                            className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${country === 'GB' ? 'bg-amber-400 text-blue-950' : 'text-white/50 hover:text-white'}`}
                                        >
                                            GB (UK)
                                        </button>
                                        <button
                                            onClick={() => { setCountry('US'); setAreaCode('') }}
                                            className={`flex-1 py-2 text-xs font-bold uppercase transition-colors ${country === 'US' ? 'bg-amber-400 text-blue-950' : 'text-white/50 hover:text-white'}`}
                                        >
                                            US (USA)
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSearch} className="space-y-4">
                                    <div>
                                        <label className={labelClasses}>Area Code / Zone</label>
                                        <select
                                            value={areaCode}
                                            onChange={(e) => setAreaCode(e.target.value)}
                                            className={inputClasses + " appearance-none"}
                                            required
                                        >
                                            <option value="" disabled>-- SELECT ZONE --</option>
                                            {Object.entries(AREA_CODES[country] || {}).map(([city, code]) => (
                                                <option key={code} value={code} className="bg-blue-950">
                                                    {city.toUpperCase()} [{code}]
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button type="submit" disabled={loading} className={buttonClasses + " w-full"}>
                                        {loading ? 'Scanning Network...' : 'Search Available Numbers'}
                                    </button>
                                </form>

                                {searchError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-xs font-mono uppercase">
                                        Error: {searchError}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="bg-blue-950 p-8 min-h-[400px]">
                            <h2 className="text-lg font-bold uppercase tracking-widest text-white mb-8 border-b border-white/10 pb-4 flex justify-between">
                                <span>Search Results</span>
                                <span className="text-amber-400 font-mono">{results.length} Found</span>
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.map((num) => (
                                    <div key={num.phoneNumber} className="bg-blue-900/20 border border-amber-400/20 p-6 hover:border-amber-400 transition-colors group">
                                        <div className="mb-6">
                                            <div className="text-2xl font-mono font-bold text-white group-hover:text-amber-400 transition-colors">{num.friendlyName}</div>
                                            <div className="text-[10px] uppercase font-bold text-white/40 mt-1">{num.locality}, {num.region}</div>
                                        </div>
                                        <div className="flex items-end justify-between">
                                            <div className="font-mono text-green-400 text-xl font-bold">£2.50<span className="text-[10px] text-white/50 ml-1">/mo</span></div>
                                            <button
                                                onClick={() => handleBuy(num.phoneNumber)}
                                                disabled={!!purchasing}
                                                className="px-4 py-2 border border-amber-400 text-amber-400 text-[10px] font-bold uppercase hover:bg-amber-400 hover:text-blue-950 transition-colors disabled:opacity-50"
                                            >
                                                {purchasing === num.phoneNumber ? 'Purchasing...' : 'Provision'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {results.length === 0 && !loading && (
                                <div className="h-64 flex flex-col items-center justify-center text-white/10">
                                    <div className="text-6xl font-black uppercase mb-4">No Signal</div>
                                    <div className="text-sm font-mono uppercase">Select a zone and initiate search</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
            }
        </div >
    )
}
