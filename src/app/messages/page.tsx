import { getMessageHistory } from './actions'
import { prisma } from '@/lib/prisma'

export default async function MessagesPage() {
    const messages = await getMessageHistory()

    // Also get some clients for a simple "New Message" UI test
    const clients = await prisma.client.findMany({ take: 5 })

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Message Center</h1>

            {/* History */}
            <div className="bg-white rounded shadow p-4">
                <h2 className="text-lg font-semibold mb-2">Recent Outbound Messages</h2>
                {messages.length === 0 ? (
                    <p className="text-gray-500">No messages sent yet.</p>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">To</th>
                                <th className="p-2">Message</th>
                                <th className="p-2">Sent</th>
                                <th className="p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map(m => (
                                <tr key={m.id} className="border-b">
                                    <td className="p-2 font-medium">{m.client.name}</td>
                                    <td className="p-2 text-gray-700">{m.content}</td>
                                    <td className="p-2 text-sm text-gray-500">{m.sentAt.toLocaleString()}</td>
                                    <td className="p-2 text-xs">
                                        <span className={`px-2 py-1 rounded ${m.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
