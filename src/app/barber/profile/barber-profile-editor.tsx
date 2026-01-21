'use client'

import { useState, useTransition } from 'react'
import { updateBarberProfile } from './actions'

export default function BarberProfileEditor({ profile, userName }: any) {
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (formData: FormData) => {
        startTransition(() => updateBarberProfile(formData))
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* LEFT: PREVIEW CARD (Rough approximation) */}
            <div className="space-y-8">
                <div className="p-6 border-2 border-amber-400 bg-blue-900/30 relative">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-black uppercase text-white mb-2">{userName}</h2>
                            <p className="text-lg text-amber-400 font-mono">{profile.city || 'Location N/A'}</p>
                        </div>
                        <div className="w-16 h-16 bg-blue-900 flex items-center justify-center border border-amber-400/30 text-amber-400 font-black text-xl">
                            {userName?.[0]}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-950 border border-amber-400/30">
                            <div className="text-2xl font-black text-white">{profile.retentionRate}%</div>
                            <div className="text-[10px] font-mono uppercase text-amber-400/60 tracking-wider">Retention</div>
                        </div>
                        <div className="p-4 bg-blue-950 border border-amber-400/30">
                            <div className="text-2xl font-black text-white">{profile.clientBaseSize}</div>
                            <div className="text-[10px] font-mono uppercase text-amber-400/60 tracking-wider">Clients</div>
                        </div>
                    </div>

                    <div className="mt-4 p-4 border border-white/10 bg-white/5">
                        <p className="text-xs text-white/80 leading-relaxed italic">"{profile.bio || 'Your bio will appear here...'}"</p>
                    </div>
                </div>

                <div className="p-6 border border-amber-400/20 bg-blue-900/10">
                    <h3 className="text-sm font-bold uppercase text-white mb-2">Why Stats Matter?</h3>
                    <p className="text-xs text-white/50 leading-relaxed font-mono">
                        Shops prioritize barbers who know their numbers. Even if unverified, showing your retention and client base demonstrates professionalism.
                    </p>
                </div>
            </div>

            {/* RIGHT: EDITABLE PROFILE */}
            <form action={handleSubmit} className="space-y-6">

                {/* Status Toggle */}
                <div className="p-6 border-2 border-dashed border-amber-400/30 flex items-center justify-between">
                    <div>
                        <label className="block text-xs font-bold uppercase text-amber-400 mb-1 tracking-widest">
                            Work Status
                        </label>
                        <p className="text-[10px] text-white/50 font-mono">Are you open to new opportunities?</p>
                    </div>
                    <select
                        name="status"
                        defaultValue={profile.status}
                        className="bg-blue-950 border border-white/20 text-white text-xs font-bold uppercase p-2"
                    >
                        <option value="NOT_LOOKING">Not Looking</option>
                        <option value="OPEN_TO_OFFERS">Open To Offers</option>
                        <option value="ACTIVELY_LOOKING">Actively Looking</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-white tracking-widest">Bio / Pitch</label>
                    <textarea
                        name="bio"
                        defaultValue={profile.bio || ''}
                        rows={4}
                        placeholder="Tell shops about your style, experience and what you're looking for..."
                        className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                    />
                </div>

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

                <div className="p-6 border border-white/10 bg-white/5 space-y-4">
                    <h3 className="text-xs font-bold uppercase text-amber-400 tracking-widest">Performance Stats (Reflects in Rank)</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-white tracking-widest">Years Experience</label>
                            <input
                                name="experienceYears"
                                type="number"
                                defaultValue={profile.experienceYears || ''}
                                placeholder="5"
                                className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-white tracking-widest">Client Base Size</label>
                            <input
                                name="clientBaseSize"
                                type="number"
                                defaultValue={profile.clientBaseSize || ''}
                                placeholder="400"
                                className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-white tracking-widest">Retention Rate (%)</label>
                            <input
                                name="retentionRate"
                                type="number"
                                step="0.1"
                                max="100"
                                defaultValue={profile.retentionRate || ''}
                                placeholder="85.5"
                                className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-white tracking-widest">Avg Ticket (£)</label>
                            <input
                                name="averageTicket"
                                type="number"
                                step="0.1"
                                defaultValue={profile.averageTicket || ''}
                                placeholder="35.00"
                                className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-t border-amber-400/20">
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="shareStatsWithVerifiedShops" defaultChecked={profile.shareStatsWithVerifiedShops} className="sr-only peer" />
                        <div className="w-11 h-6 bg-blue-900 peer-focus:outline-none border border-amber-400/50 peer-checked:bg-amber-400 peer-checked:border-amber-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-none after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase text-white tracking-widest block">
                            Share Stats with Verified Shops
                        </span>
                        <span className="text-[10px] text-white/50 font-mono">
                            If unchecked, your stats will be hidden from everyone.
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4 py-4 border-t border-amber-400/20">
                    <div className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isPublic" defaultChecked={profile.isPublic} className="sr-only peer" />
                        <div className="w-11 h-6 bg-blue-900 peer-focus:outline-none border border-amber-400/50 peer-checked:bg-amber-400 peer-checked:border-amber-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-none after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </div>
                    <span className="text-xs font-bold uppercase text-white tracking-widest">
                        Public Profile Active
                    </span>
                </div>

                <button
                    disabled={isPending}
                    className="w-full py-4 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                >
                    {isPending ? 'Update Profile' : 'Update Profile'}
                </button>

            </form>
        </div>
    )
}
