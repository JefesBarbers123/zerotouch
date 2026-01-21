
import Link from 'next/link'

export default function ClientHealthWidget({ atRiskClients }: { atRiskClients: any[] }) {
    if (atRiskClients.length === 0) return null

    return (
        <div className="bg-white border border-gray-200 p-8 mb-12">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-lg font-serif font-bold text-black border-b border-gray-200 pb-2 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-600 block"></span>
                        Retention Monitor
                    </h2>
                    <p className="text-sm text-gray-500 font-sans">
                        {atRiskClients.length} clients require attention.
                    </p>
                </div>
            </div>

            <div className="grid gap-3">
                {atRiskClients.map(client => (
                    <div key={client.id} className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-100">
                        <div>
                            <div className="font-semibold text-gray-900">{client.name}</div>
                            <div className="text-xs text-red-600">
                                {client._count.visits} visits • Last seen {new Date(client.lastVisitDate).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <a
                                href={`sms:${client.mobile}?body=Hey ${client.name.split(' ')[0]}, you wanted a fresh cut? We have space this week!`}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded font-medium hover:bg-red-700 decoration-none"
                            >
                                Recover (SMS)
                            </a>
                            <Link href={`/clients/${client.id}`} className="px-3 py-1 bg-white border border-gray-300 text-gray-600 text-sm rounded hover:bg-gray-50">
                                View
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
