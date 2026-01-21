'use client'

import { useState, useRef, useTransition } from 'react'
import { updateShopProfile } from './actions'

export default function ShopProfileEditor({ profile, stats, tenantName }: any) {
    const [isPending, startTransition] = useTransition()
    const [logo, setLogo] = useState<string | null>(profile.logo || null)
    const logoInputRef = useRef<HTMLInputElement>(null)

    const handleLogoUpload = (file: File) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            setLogo(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = (formData: FormData) => {
        if (logo) formData.set('logo', logo)
        startTransition(() => updateShopProfile(formData))
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* LEFT: VERIFIED STATS (Read Only) */}
            <div className="space-y-8">
                <div className="p-6 border-2 border-amber-400 bg-blue-900/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-amber-400 text-blue-950 text-[10px] font-black uppercase px-2 py-1">
                        Verified Employer
                    </div>

                    <div className="mb-8 flex items-center gap-6">
                        {/* LOGO UPLOAD */}
                        <div
                            onClick={() => logoInputRef.current?.click()}
                            className="w-24 h-24 bg-blue-950 border-2 border-amber-400 flex items-center justify-center cursor-pointer hover:opacity-80 relative overflow-hidden"
                        >
                            {logo ? (
                                <img src={logo} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-[10px] uppercase font-bold text-amber-400 text-center px-1">Upload Logo</span>
                            )}
                            <input
                                type="file"
                                ref={logoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                            />
                        </div>

                        <div>
                            <h2 className="text-3xl font-black uppercase text-white tracking-wide leading-none">{tenantName}</h2>
                            <p className="font-mono text-xs text-amber-400/70 uppercase mt-2">Verified Barbershop</p>
                            <button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                className="text-[10px] uppercase font-bold text-amber-400 underline hover:text-white mt-2"
                            >
                                Change Logo
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-950 border border-amber-400/30">
                            <div className="text-3xl font-black text-white">{stats.avgClientsPerWeek}</div>
                            <div className="text-[10px] font-mono uppercase text-amber-400/60 tracking-wider">Shop Visits/Wk</div>
                        </div>
                        <div className="p-4 bg-blue-950 border border-amber-400/30">
                            <div className="text-3xl font-black text-white">{stats.totalBarbers}</div>
                            <div className="text-[10px] font-mono uppercase text-amber-400/60 tracking-wider">Active Barbers</div>
                        </div>
                        <div className="p-4 bg-blue-950 border border-amber-400/30">
                            <div className="text-3xl font-black text-white">{stats.reviewScore}</div>
                            <div className="text-[10px] font-mono uppercase text-amber-400/60 tracking-wider">Reputation</div>
                        </div>
                        <div className="p-4 bg-blue-950 border border-amber-400/30">
                            <div className="text-3xl font-black text-white">{stats.clientGrowthRate}%</div>
                            <div className="text-[10px] font-mono uppercase text-amber-400/60 tracking-wider">Monthly Growth</div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border border-amber-400/20 bg-blue-900/10">
                    <h3 className="text-sm font-bold uppercase text-white mb-2">Employer Branding</h3>
                    <p className="text-xs text-white/50 leading-relaxed font-mono">
                        Talented barbers want busy shops. These stats prove you have the footfall and retention to fill their chair immediately.
                    </p>
                </div>
            </div>

            {/* RIGHT: EDITABLE PROFILE */}
            <form action={handleSubmit} className="space-y-6">

                {/* Hiring Toggle */}
                <div className="p-6 border-2 border-dashed border-amber-400/30 flex items-center justify-between">
                    <div>
                        <label className="block text-xs font-bold uppercase text-amber-400 mb-1 tracking-widest">
                            Recruitment Status
                        </label>
                        <p className="text-[10px] text-white/50 font-mono">Are you currently scouting for talent?</p>
                    </div>
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isHiring" defaultChecked={profile.isHiring} className="sr-only peer" />
                        <div className="w-11 h-6 bg-blue-900 peer-focus:outline-none border border-amber-400/50 peer-checked:bg-amber-400 peer-checked:border-amber-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-none after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-white tracking-widest">Shop Pitch / Vibe</label>
                    <textarea
                        name="description"
                        defaultValue={profile.description || ''}
                        rows={4}
                        placeholder="Describe the shop culture, music, clientele..."
                        className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-white tracking-widest">Models Offered</label>
                    <input
                        name="offeredModels"
                        type="text"
                        defaultValue={profile.offeredModels || ''}
                        placeholder="e.g. 60/40 Split, Chair Rent £200pw"
                        className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                    />
                </div>

                <div className="p-6 border border-white/10 bg-white/5 space-y-4">
                    <h3 className="text-xs font-bold uppercase text-amber-400 tracking-widest">Manual Stats (Unverified)</h3>
                    <p className="text-[10px] text-white/50 font-mono mb-4">
                        Enter these if you don't use our SaaS operations yet. These will be displayed as unverified.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-white tracking-widest">Avg Earnings (£)</label>
                            <input
                                name="averageBarberEarnings"
                                type="number"
                                defaultValue={profile.averageBarberEarnings || ''}
                                placeholder="3500"
                                className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-white tracking-widest">Weekly Footfall</label>
                            <input
                                name="weeklyFootfall"
                                type="number"
                                defaultValue={profile.weeklyFootfall || ''}
                                placeholder="150"
                                className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-white tracking-widest">Location (City)</label>
                        <input
                            name="city"
                            type="text"
                            defaultValue={profile.city || ''}
                            placeholder="LONDON"
                            className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-white tracking-widest">Website / IG</label>
                        <input
                            name="website"
                            type="text"
                            defaultValue={profile.website || ''}
                            placeholder="barbershop.com"
                            className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-t border-amber-400/20">
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isPublic" defaultChecked={profile.isPublic} className="sr-only peer" />
                        <div className="w-11 h-6 bg-blue-900 peer-focus:outline-none border border-amber-400/50 peer-checked:bg-amber-400 peer-checked:border-amber-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-none after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </div>
                    <span className="text-xs font-bold uppercase text-white tracking-widest">
                        Public Shop Profile Active
                    </span>
                </div>

                <button
                    disabled={isPending}
                    className="w-full py-4 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                >
                    {isPending ? 'Update Shop Brand' : 'Update Shop Brand'}
                </button>

            </form>
        </div>
    )
}
