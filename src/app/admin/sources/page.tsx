
import { prisma } from '@/lib/prisma';
import { addSource, deleteSource, toggleSource, refreshSource } from './actions';

// Force dynamic to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function SourcesPage() {
    const sources = await prisma.jobSource.findMany();

    return (
        <div className="p-8 text-white min-h-screen bg-neutral-900">
            <h1 className="text-3xl font-bold mb-8">Job Sources</h1>

            <div className="bg-neutral-800 p-6 rounded-xl mb-8 border border-neutral-700">
                <h2 className="text-xl font-semibold mb-4">Add New Source</h2>
                <form action={addSource} className="flex flex-col md:flex-row gap-4">
                    <input name="name" placeholder="Source Name" className="bg-neutral-900 border border-neutral-700 p-2 rounded text-white" required />
                    <input name="url" placeholder="URL (RSS Feed / API)" className="bg-neutral-900 border border-neutral-700 p-2 rounded text-white flex-1" required />
                    <select name="type" className="bg-neutral-900 border border-neutral-700 p-2 rounded text-white" required>
                        <option value="RSS">RSS</option>
                        <option value="API">API</option>
                        <option value="ADZUNA">Adzuna API</option>
                        <option value="SCRAPER">Scraper</option>
                    </select>
                    <button className="bg-amber-500 text-black font-bold px-4 py-2 rounded hover:bg-amber-400">Add</button>
                </form>
            </div>

            <div className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700">
                <table className="w-full text-left">
                    <thead className="bg-neutral-900 text-neutral-400">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Last Checked</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sources.map((source) => (
                            <tr key={source.id} className="border-t border-neutral-700">
                                <td className="p-4 font-medium">{source.name}</td>
                                <td className="p-4"><span className="bg-neutral-700 px-2 py-1 rounded text-xs">{source.type}</span></td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${source.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                        {source.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    {source.lastStatus === 'ERROR' && <span className="ml-2 text-xs text-red-500">Error</span>}
                                </td>
                                <td className="p-4 text-sm text-neutral-400">
                                    {source.lastChecked ? source.lastChecked.toLocaleString() : 'Never'}
                                    {source.errorMsg && <div className="text-xs text-red-400 mt-1 max-w-xs truncate">{source.errorMsg}</div>}
                                </td>
                                <td className="p-4 flex gap-2">
                                    <form action={refreshSource.bind(null, source.id)}>
                                        <button className="bg-blue-600 hover:bg-blue-500 border border-blue-400 px-3 py-1 rounded text-xs font-bold shadow-sm">
                                            Force Refresh
                                        </button>
                                    </form>
                                    <form action={toggleSource.bind(null, source.id, source.isActive)}>
                                        <button className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-xs">
                                            {source.isActive ? 'Disable' : 'Enable'}
                                        </button>
                                    </form>
                                    <form action={deleteSource.bind(null, source.id)}>
                                        <button className="bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 rounded text-xs">
                                            Delete
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {sources.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-neutral-500">No sources added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
