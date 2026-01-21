'use client'

import { useState, useTransition, useRef } from 'react'
import { updateBarberProfile } from './actions'

export default function ProfileEditor({ profile, stats, user }: any) {
    const [isPending, startTransition] = useTransition()
    const [currentStatus, setCurrentStatus] = useState(profile.status || 'NOT_LOOKING')

    // Image State
    const [profileImage, setProfileImage] = useState<string | null>(profile.profileImage || null)
    const [portfolioImages, setPortfolioImages] = useState<string[]>(profile.portfolio?.map((p: any) => p.url) || [])

    const profileInputRef = useRef<HTMLInputElement>(null)
    const portfolioInputRef = useRef<HTMLInputElement>(null)

    // Helper: Convert File to Base64 (with simple resizing if needed in future)
    const handleImageUpload = (file: File, type: 'PROFILE' | 'PORTFOLIO') => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64 = reader.result as string

            if (type === 'PROFILE') {
                setProfileImage(base64)
            } else {
                if (portfolioImages.length >= 5) {
                    alert("Max 5 portfolio images allowed")
                    return
                }
                setPortfolioImages([...portfolioImages, base64])
            }
        }
        reader.readAsDataURL(file)
    }

    const removePortfolioImage = (index: number) => {
        setPortfolioImages(portfolioImages.filter((_, i) => i !== index))
    }

    const handleSubmit = (formData: FormData) => {
        // Append Images manually (since they are in state)
        if (profileImage) formData.set('profileImage', profileImage)
        if (portfolioImages.length > 0) formData.set('portfolioImages', JSON.stringify(portfolioImages))

        startTransition(() => updateBarberProfile(formData))
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* LEFT: VERIFIED STATS (Read Only) */}
            <div className="space-y-8">
                <div className="p-6 border-2 border-amber-400 bg-blue-900/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-amber-400 text-blue-950 text-[10px] font-black uppercase px-2 py-1">
                        Verified by Zerotouches
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                        {/* Interactive Profile Pic */}
                        <div
                            onClick={() => profileInputRef.current?.click()}
                            className="w-20 h-20 bg-amber-400 rounded-none flex items-center justify-center text-3xl font-black text-blue-950 relative overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border-2 border-transparent hover:border-white"
                        >
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span>{user.name?.[0]}</span>
                            )}
                            <input
                                type="file"
                                ref={profileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'PROFILE')}
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black uppercase text-white tracking-wide">{user.name}</h2>
                            <button
                                type="button"
                                onClick={() => profileInputRef.current?.click()}
                                className="text-[10px] uppercase font-bold text-amber-400 underline hover:text-white"
                            >
                                Change Photo
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-950 border border-amber-400/30">
                            <div className="text-3xl font-black text-white">{stats.avgClientsPerWeek}</div>
                            <div className="text-[10px] font-mono uppercase text-amber-400/60 tracking-wider">Clients / Week</div>
                        </div>
                        <div className="p-4 bg-blue-950 border border-amber-400/30">
                            <div className="text-3xl font-black text-white">{stats.clientRetention}%</div>
                            <div className="text-[10px] font-mono uppercase text-amber-400/60 tracking-wider">Retention Rate</div>
                        </div>
                        <div className="p-4 bg-blue-950 border border-amber-400/30">
                            <div className="text-3xl font-black text-white">${stats.avgTicket}</div>
                            <div className="text-[10px] font-mono uppercase text-amber-400/60 tracking-wider">Avg Ticket</div>
                        </div>
                        <div className="p-4 bg-blue-950 border border-amber-400/30">
                            <div className="text-3xl font-black text-white">{stats.totalVisits}</div>
                            <div className="text-[10px] font-mono uppercase text-amber-400/60 tracking-wider">Total Cuts</div>
                        </div>
                    </div>
                </div>

                {/* PORTFOLIO SECTION */}
                <div className="p-6 border border-amber-400/20 bg-blue-900/10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold uppercase text-white">Portfolio ({portfolioImages.length}/5)</h3>
                        {portfolioImages.length < 5 && (
                            <button
                                type="button"
                                onClick={() => portfolioInputRef.current?.click()}
                                className="text-[10px] font-bold uppercase bg-amber-400 text-blue-950 px-2 py-1 hover:bg-white"
                            >
                                + Add Image
                            </button>
                        )}
                        <input
                            type="file"
                            ref={portfolioInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'PORTFOLIO')}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        {portfolioImages.map((img, i) => (
                            <div key={i} className="relative aspect-square bg-black group">
                                <img src={img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
                                <button
                                    type="button"
                                    onClick={() => removePortfolioImage(i)}
                                    className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        {portfolioImages.length === 0 && (
                            <div className="col-span-3 text-center py-8 text-white/20 text-xs font-mono border-2 border-dashed border-white/10">
                                NO IMAGES UPLOADED
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RIGHT: EDITABLE PROFILE */}
            <form action={handleSubmit} className="space-y-6">

                {/* Recruitment Status Toggle */}
                <div className="p-6 border-2 border-dashed border-amber-400/30">
                    <label className="block text-xs font-bold uppercase text-amber-400 mb-4 tracking-widest">
                        Availability Status
                    </label>
                    <div className="flex gap-4">
                        {['ACTIVELY_LOOKING', 'OPEN_TO_OPPORTUNITIES', 'NOT_LOOKING'].map((s) => (
                            <label key={s} className="flex-1 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value={s}
                                    checked={currentStatus === s}
                                    onChange={() => setCurrentStatus(s)}
                                    className="peer hidden"
                                />
                                <div className="h-full py-3 px-2 text-center border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider text-white/50 peer-checked:bg-amber-400 peer-checked:text-blue-950 peer-checked:border-amber-400 transition-all">
                                    {s.replace(/_/g, ' ')}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-white tracking-widest">Bio / Pitch</label>
                    <textarea
                        name="bio"
                        defaultValue={profile.bio || ''}
                        rows={4}
                        placeholder="Tell shops about your style, experience, and what you're looking for..."
                        className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-white tracking-widest">City</label>
                        <input
                            name="city"
                            type="text"
                            defaultValue={profile.city || ''}
                            placeholder="MANCHESTER"
                            className="w-full bg-blue-900/50 border-2 border-amber-400/30 p-4 text-white placeholder:text-white/20 focus:border-amber-400 outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-white tracking-widest">Instagram</label>
                        <input
                            name="instagram"
                            type="text"
                            defaultValue={profile.instagram || ''}
                            placeholder="@YOURHANDLE"
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
                        Public Profile Active
                    </span>
                </div>

                <button
                    disabled={isPending}
                    className="w-full py-4 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                >
                    {isPending ? 'Saving...' : 'Save Profile'}
                </button>

            </form>
        </div>
    )
}
