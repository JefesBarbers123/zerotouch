import { getClients } from './actions'
import ClientList from './client-list'


export default async function ClientsPage() {
    const clients = await getClients()

    return (
        <main className="p-8 max-w-7xl mx-auto w-full">
            <div className="mb-12 border-b-2 border-amber-400 pb-8">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-2">Client Directory</h1>
                <p className="font-mono text-sm text-amber-400/70 uppercase tracking-widest">
                    Manage your book
                </p>
            </div>
            <ClientList initialClients={clients} onSearch={getClients} />
        </main>
    )
}
