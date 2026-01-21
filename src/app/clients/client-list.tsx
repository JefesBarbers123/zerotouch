'use client'

import React, { useState, useEffect } from 'react'


export default function ClientList({ initialClients, onSearch }: { initialClients: any[], onSearch: (q: string) => Promise<any[]> }) {
    const [clients, setClients] = useState(initialClients)
    const [query, setQuery] = useState('')

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(async () => {
            const results = await onSearch(query)
            setClients(results)
        }, 300)
        return () => clearTimeout(timer)
    }, [query, onSearch])

    return (
        <div>
            <div className="mb-8">
                <input
                    type="text"
                    placeholder="SEARCH CLIENTS..."
                    className="input w-full md:w-1/2 lg:w-1/3"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-amber-400">
                            <th className="py-4 px-2 font-black uppercase tracking-widest text-sm text-amber-400">Name</th>
                            <th className="py-4 px-2 font-black uppercase tracking-widest text-sm text-amber-400">Mobile</th>
                            <th className="py-4 px-2 font-black uppercase tracking-widest text-sm text-amber-400">Visits</th>
                            <th className="py-4 px-2 font-black uppercase tracking-widest text-sm text-amber-400">Status</th>
                            <th className="py-4 px-2 font-black uppercase tracking-widest text-sm text-amber-400">Last Visit</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                        {clients.map(client => (
                            <tr key={client.id}
                                onClick={() => window.location.href = `/clients/${client.id}`}
                                className="border-b border-amber-400/20 hover:bg-amber-400/10 cursor-pointer transition-colors group"
                            >
                                <td className="py-4 px-2 font-bold text-white group-hover:text-amber-400">{client.name}</td>
                                <td className="py-4 px-2 text-white/70">{client.mobile}</td>
                                <td className="py-4 px-2 text-white">{client._count.visits}</td>
                                <td className="py-4 px-2">
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider 
                                        ${client.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : ''}
                                        ${client.status === 'DUE' ? 'bg-blue-500/20 text-blue-400' : ''}
                                        ${client.status === 'OVERDUE' ? 'bg-amber-500/20 text-amber-400' : ''}
                                        ${client.status === 'CHURNED' ? 'bg-red-500/20 text-red-400' : ''}
                                    `}>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="py-4 px-2 text-white/70">{client.lastVisitDate ? new Date(client.lastVisitDate).toLocaleDateString() : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
