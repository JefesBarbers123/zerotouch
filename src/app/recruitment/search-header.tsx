'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

export default function SearchHeader() {
    const searchParams = useSearchParams()
    const { replace } = useRouter()
    const pathname = usePathname()

    const [location, setLocation] = useState(searchParams.get('l') || '')
    const [sort, setSort] = useState(searchParams.get('sort') || '')
    const [activeType, setActiveType] = useState<'BARBERS' | 'SHOPS'>('BARBERS') // Default, but should probably sync with DiscoveryFeed

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams(searchParams)

        if (location) params.set('l', location)
        else params.delete('l')

        if (sort) params.set('sort', sort)
        else params.delete('sort')

        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="bg-blue-950/80 border-b-2 border-amber-400/20 p-6 sticky top-0 z-10 backdrop-blur-md">
            <form onSubmit={handleSearch} className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">

                {/* RANK BY DROPDOWN */}
                <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">
                        Rank By (Performance)
                    </label>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full bg-blue-900/50 border border-white/10 p-3 text-white focus:border-amber-400 outline-none font-mono text-sm appearance-none cursor-pointer"
                    >
                        <option value="">Default (Newest)</option>
                        <optgroup label="Barber Stats">
                            <option value="retentionRate">Retention Rate (High → Low)</option>
                            <option value="clientBaseSize">Client Base (Large → Small)</option>
                            <option value="averageTicket">Avg. Ticket Value (High → Low)</option>
                            <option value="experienceYears">Experience (Years)</option>
                        </optgroup>
                        <optgroup label="Shop Stats">
                            <option value="averageBarberEarnings">Avg. Barber Earnings</option>
                            <option value="weeklyFootfall">Weekly Footfall (Busy)</option>
                        </optgroup>
                    </select>
                </div>

                {/* LOCATION INPUT */}
                <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase text-amber-400 mb-2 tracking-widest">
                        Location
                    </label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, region, or postcode"
                        className="w-full bg-blue-900/50 border border-white/10 p-3 text-white placeholder:text-white/20 focus:border-amber-400 outline-none font-mono text-sm"
                    />
                </div>

                <div className="flex items-end">
                    <button type="submit" className="h-[46px] px-8 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors text-sm">
                        Refresh Grid
                    </button>
                </div>
            </form>
        </div>
    )
}
