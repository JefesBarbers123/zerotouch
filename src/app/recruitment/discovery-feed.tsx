'use client'

import { useState, useTransition, useEffect } from 'react'
import { toggleSaveBarber, toggleSaveShop } from '../actions/save-profile'

export default function DiscoveryFeed({ barbers, shops, user }: any) {
    const [activeTab, setActiveTab] = useState<'BARBERS' | 'SHOPS'>('BARBERS')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [pendingId, setPendingId] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    // Select first item by default on load/tab change
    useEffect(() => {
        if (activeTab === 'BARBERS' && barbers.length > 0) setSelectedId(barbers[0].id)
        if (activeTab === 'SHOPS' && shops.length > 0) setSelectedId(shops[0].id)
    }, [activeTab, barbers, shops])

    const handleSaveBarber = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setPendingId(id)
        startTransition(async () => {
            await toggleSaveBarber(id)
            setPendingId(null)
        })
    }

    const handleSaveShop = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setPendingId(id)
        startTransition(async () => {
            await toggleSaveShop(id)
            setPendingId(null)
        })
    }

    const getSelectedBarber = () => barbers.find((b: any) => b.id === selectedId)
    const getSelectedShop = () => shops.find((s: any) => s.id === selectedId)

    const selectedBarber = getSelectedBarber()
    const selectedShop = getSelectedShop()

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            {/* TABS HEADER */}
            <div className="flex border-b border-white/10 mb-4 items-center gap-4">
                <button
                    onClick={() => setActiveTab('BARBERS')}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'BARBERS'
                        ? 'border-amber-400 text-amber-400'
                        : 'border-transparent text-white/50 hover:text-white'
                        }`}
                >
                    Talent ({barbers.length})
                </button>
                <button
                    onClick={() => setActiveTab('SHOPS')}
                    className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 ${activeTab === 'SHOPS'
                        ? 'border-amber-400 text-amber-400'
                        : 'border-transparent text-white/50 hover:text-white'
                        }`}
                >
                    Shops ({shops.length})
                </button>
            </div>

            {/* SPLIT LAYOUT */}
            <div className="flex flex-1 gap-6 overflow-hidden">

                {/* LEFT: LIST VIEW */}
                <div className="w-full md:w-5/12 lg:w-4/12 overflow-y-auto pr-2 space-y-3">
                    {activeTab === 'BARBERS' && barbers.map((barber: any) => (
                        <div
                            key={barber.id}
                            onClick={() => setSelectedId(barber.id)}
                            className={`p-4 border cursor-pointer transition-all group relative ${selectedId === barber.id
                                ? 'bg-blue-900/30 border-amber-400 border-l-4'
                                : 'bg-transparent border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-bold uppercase ${selectedId === barber.id ? 'text-white' : 'text-amber-400'}`}>
                                    {barber.user.name}
                                </h3>
                                {barber.isVerified && (
                                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                        Verified
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs text-white/50 font-mono">{barber.city || 'Location N/A'}</p>
                                {barber.isRedacted ? (
                                    <span className="text-[9px] font-bold text-white/30 font-mono uppercase border border-white/10 px-1 rounded">
                                        Stats Locked
                                    </span>
                                ) : (
                                    barber.retentionRate > 0 && (
                                        <span className="text-[10px] font-bold text-green-400 font-mono">
                                            {Math.round(barber.retentionRate)}% Retention
                                        </span>
                                    )
                                )}
                            </div>
                            <div className="flex gap-2 text-[10px] font-mono text-white/40 uppercase">
                                <span className="bg-white/5 px-2 py-1 rounded">{barber.status.replace(/_/g, ' ')}</span>
                                {!barber.isRedacted && barber.clientBaseSize > 0 && (
                                    <span className="bg-white/5 px-2 py-1 rounded">{barber.clientBaseSize} Clients</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {activeTab === 'SHOPS' && shops.map((shop: any) => (
                        <div
                            key={shop.id}
                            onClick={() => setSelectedId(shop.id)}
                            className={`p-4 border cursor-pointer transition-all group relative ${selectedId === shop.id
                                ? 'bg-blue-900/30 border-amber-400 border-l-4'
                                : 'bg-transparent border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-bold uppercase ${selectedId === shop.id ? 'text-white' : 'text-white/90'}`}>
                                    {shop.tenant.name}
                                </h3>
                                {shop.isVerified && (
                                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                        Verified
                                    </span>
                                )}
                            </div>
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-xs text-amber-400/80 font-mono">{shop.city || 'Location N/A'}</p>
                                {shop.averageBarberEarnings > 0 && (
                                    <span className="text-[10px] font-bold text-green-400 font-mono">
                                        £{shop.averageBarberEarnings}/mo Avg
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2 text-[10px] font-mono text-white/40 uppercase">
                                <span className="bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">Hiring</span>
                                {shop.weeklyFootfall > 0 && (
                                    <span className="bg-white/5 px-2 py-1 rounded">{shop.weeklyFootfall} Visits/Wk</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* EMPTY STATES */}
                    {(activeTab === 'BARBERS' && barbers.length === 0) && (
                        <div className="p-8 text-center text-white/30 font-mono text-xs uppercase border border-dashed border-white/10">No results found.</div>
                    )}
                    {(activeTab === 'SHOPS' && shops.length === 0) && (
                        <div className="p-8 text-center text-white/30 font-mono text-xs uppercase border border-dashed border-white/10">No results found.</div>
                    )}
                </div>

                {/* RIGHT: DETAIL VIEW (STICKY) */}
                <div className="hidden md:block flex-1 bg-blue-950 border border-white/10 p-8 overflow-y-auto shadow-2xl relative">
                    {/* BARBER DETAIL */}
                    {activeTab === 'BARBERS' && selectedBarber && (
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-4xl font-black uppercase text-white mb-2">{selectedBarber.user.name}</h2>
                                    <p className="text-lg text-amber-400 font-mono">{selectedBarber.city}</p>
                                </div>
                                <div className="w-20 h-20 bg-blue-900 flex items-center justify-center border border-amber-400/30 text-amber-400 font-black text-2xl">
                                    {selectedBarber.user.name?.[0]}
                                </div>
                            </div>

                            <div className="prose prose-invert prose-sm mb-8">
                                <h3 className="text-xs font-bold uppercase text-white/50 tracking-widest mb-2">About</h3>
                                <p className="text-white/80 leading-relaxed">{selectedBarber.bio || "This user has not added a bio yet."}</p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/10 flex gap-4">
                                <button
                                    onClick={(e) => handleSaveBarber(selectedBarber.id, e)}
                                    disabled={isPending}
                                    className="flex-1 py-4 bg-amber-400 text-blue-950 font-black uppercase tracking-widest hover:bg-white transition-colors"
                                >
                                    {isPending ? 'Saving...' : 'Connect / Save'}
                                </button>
                                <button className="flex-1 py-4 border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                                    View Full Profile
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SHOP DETAIL */}
                    {activeTab === 'SHOPS' && selectedShop && (
                        <div>
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-4xl font-black uppercase text-white mb-2">{selectedShop.tenant.name}</h2>
                                    <p className="text-lg text-amber-400 font-mono">{selectedShop.city || selectedShop.tenant.address}</p>
                                </div>
                                <div className="px-4 py-2 border border-green-500/50 text-green-400 font-bold uppercase text-xs tracking-widest">
                                    Hiring Now
                                </div>
                            </div>

                            <div className="prose prose-invert prose-sm mb-8">
                                <h3 className="text-xs font-bold uppercase text-white/50 tracking-widest mb-2">Shop Description</h3>
                                <p className="text-white/80 leading-relaxed">{selectedShop.description || "No description provided."}</p>
                            </div>

                            {selectedShop.offeredModels && (
                                <div className="bg-blue-900/20 p-6 border border-white/10 mb-8">
                                    <h3 className="text-xs font-bold uppercase text-white/50 tracking-widest mb-2">Compensation Model</h3>
                                    <p className="font-mono text-amber-300">{selectedShop.offeredModels}</p>
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-white/10 flex gap-4">
                                <button
                                    onClick={(e) => handleSaveShop(selectedShop.id, e)}
                                    disabled={isPending}
                                    className="flex-1 py-4 bg-white text-blue-950 font-black uppercase tracking-widest hover:bg-amber-400 transition-colors"
                                >
                                    {isPending ? 'Saving...' : 'Apply / Save'}
                                </button>
                                <button className="flex-1 py-4 border border-white/20 text-white font-black uppercase tracking-widest hover:bg-white/10 transition-colors">
                                    Visit Website
                                </button>
                            </div>
                        </div>
                    )}

                    {/* NO SELECTION */}
                    {((activeTab === 'BARBERS' && !selectedBarber) || (activeTab === 'SHOPS' && !selectedShop)) && (
                        <div className="h-full flex items-center justify-center text-white/20 font-mono uppercase text-sm">
                            Select an item to view details
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
