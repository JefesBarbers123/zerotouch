'use client'

import { useState, useTransition } from 'react'
import { searchClients, createVisit, createClient } from './actions'


interface Service {
    id: string
    name: string
    price: number
}

interface Client {
    id: string
    name: string
    mobile: string
}

export default function CheckInForm({ services }: { services: Service[] }) {
    const [query, setQuery] = useState('')
    const [clients, setClients] = useState<Client[]>([])
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [selectedService, setSelectedService] = useState<string>('')

    // New Client state
    const [isCreating, setIsCreating] = useState(false)
    const [newClientMobile, setNewClientMobile] = useState('')

    const [isPending, startTransition] = useTransition()

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value
        setQuery(q)
        if (q.length > 1) {
            const results = await searchClients(q)
            setClients(results as Client[])
        } else {
            setClients([])
        }
    }

    const handleSelectClient = (client: Client) => {
        setSelectedClient(client)
        setQuery('')
        setClients([])
    }

    const handleCreateClient = async () => {
        if (!query || !newClientMobile) return
        try {
            const newClient = await createClient(query, newClientMobile)
            setSelectedClient(newClient as Client)
            setIsCreating(false)
            setQuery('')
        } catch (e) {
            alert('Error creating client')
        }
    }

    const handleSubmit = () => {
        if (!selectedClient || !selectedService) return

        startTransition(async () => {
            await createVisit(selectedClient.id, selectedService)
            // Reset
            setSelectedClient(null)
            setSelectedService('')
            alert('Checked In Successfully!')
        })
    }

    return (
        <div className="space-y-8">
            {/* 1. Client Selection */}
            {!selectedClient ? (
                <div className="relative">
                    <input
                        type="text"
                        placeholder="NAME OR MOBILE..."
                        className="input"
                        value={query}
                        onChange={handleSearch}
                    />

                    {clients.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-blue-900 border-2 border-amber-400 mt-1 max-h-60 overflow-y-auto z-10 shadow-xl">
                            {clients.map(c => (
                                <div key={c.id} className="p-4 hover:bg-amber-400 hover:text-blue-950 cursor-pointer border-b border-amber-400/20 last:border-0 transition-colors" onClick={() => handleSelectClient(c)}>
                                    <div className="font-bold uppercase tracking-wider">{c.name}</div>
                                    <div className="font-mono text-xs opacity-70">{c.mobile}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Create Prompt */}
                    {query.length > 2 && clients.length === 0 && !isCreating && (
                        <div className="mt-4 p-4 border-2 border-dashed border-amber-400/50 text-center">
                            <p className="text-amber-400 mb-4 font-mono text-xs uppercase">No client found.</p>
                            <button className="btn-secondary w-full" onClick={() => setIsCreating(true)}>
                                CREATE &quot;{query.toUpperCase()}&quot;
                            </button>
                        </div>
                    )}

                    {isCreating && (
                        <div className="mt-4 p-6 bg-blue-900/50 border-2 border-amber-400 space-y-4">
                            <p className="font-bold uppercase text-white">New Client: <span className="text-amber-400">{query}</span></p>
                            <input
                                type="tel"
                                placeholder="MOBILE NUMBER"
                                className="input"
                                value={newClientMobile}
                                onChange={e => setNewClientMobile(e.target.value)}
                            />
                            <div className="flex gap-4 pt-2">
                                <button className="btn-primary flex-1" onClick={handleCreateClient}>SAVE</button>
                                <button className="btn-secondary flex-1" onClick={() => setIsCreating(false)}>CANCEL</button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-6 border-2 border-green-400 bg-green-900/10 flex justify-between items-center">
                    <div>
                        <div className="font-black text-xl text-white uppercase tracking-wider">{selectedClient.name}</div>
                        <div className="font-mono text-green-400">{selectedClient.mobile}</div>
                    </div>
                    <button onClick={() => setSelectedClient(null)} className="text-xs font-bold uppercase tracking-widest text-red-400 hover:text-white underline">
                        CHANGE
                    </button>
                </div>
            )}

            {/* 2. Service Selection */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-4 pl-1">Select Service</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map(s => (
                        <div
                            key={s.id}
                            className={`p-4 border-2 cursor-pointer transition-all duration-200 ${selectedService === s.id
                                ? 'bg-amber-400 border-amber-400 text-blue-950 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                                : 'bg-transparent border-amber-400/30 text-white hover:border-amber-400 hover:bg-amber-400/10'
                                }`}
                            onClick={() => setSelectedService(s.id)}
                        >
                            <div className="font-black uppercase tracking-wider text-sm">{s.name}</div>
                            <div className="font-mono text-xs opacity-80 mt-1">${s.price}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Action */}
            <button
                className="btn-primary w-full py-6 text-lg tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedClient || !selectedService || isPending}
                onClick={handleSubmit}
            >
                {isPending ? 'PROCESSING...' : 'CONFIRM CHECK IN'}
            </button>
        </div>
    )
}
