'use client';

import { useState } from 'react';
import { JobSource } from '@prisma/client';
import { addSource, deleteSource, toggleSource, refreshSource } from './actions';

interface SourceManagerProps {
    sources: JobSource[];
}

export default function SourceManager({ sources }: SourceManagerProps) {
    const [activeTab, setActiveTab] = useState<'list' | 'builder'>('list');

    return (
        <div className="text-white">
            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-neutral-700 pb-1">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`pb-3 px-2 font-bold uppercase tracking-wider text-sm transition-colors border-b-2 ${activeTab === 'list'
                            ? 'border-amber-500 text-amber-500'
                            : 'border-transparent text-neutral-500 hover:text-neutral-300'
                        }`}
                >
                    All Sources
                </button>
                <button
                    onClick={() => setActiveTab('builder')}
                    className={`pb-3 px-2 font-bold uppercase tracking-wider text-sm transition-colors border-b-2 ${activeTab === 'builder'
                            ? 'border-amber-500 text-amber-500'
                            : 'border-transparent text-neutral-500 hover:text-neutral-300'
                        }`}
                >
                    RSS Feed Builder
                </button>
            </div>

            {/* Content */}
            {activeTab === 'builder' && (
                <div className="bg-neutral-800 p-8 rounded-xl border border-neutral-700 max-w-2xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span className="text-amber-500">⚡</span> Build New Source
                    </h2>
                    <form action={addSource} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Source Name</label>
                            <input name="name" placeholder="e.g. Indeed Barber Jobs" className="w-full bg-neutral-900 border border-neutral-700 p-4 rounded text-white focus:border-amber-500 outline-none transition-colors" required />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Target URL</label>
                            <input name="url" placeholder="https://example.com/rss/barber-jobs" className="w-full bg-neutral-900 border border-neutral-700 p-4 rounded text-white focus:border-amber-500 outline-none transition-colors" required />
                            <p className="text-xs text-neutral-600 mt-2">Enter the direct RSS feed URL or API endpoint.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-2">Source Type</label>
                            <select name="type" className="w-full bg-neutral-900 border border-neutral-700 p-4 rounded text-white focus:border-amber-500 outline-none transition-colors" required>
                                <option value="RSS">RSS Feed</option>
                                <option value="API">API Integration</option>
                                <option value="ADZUNA">Adzuna API</option>
                                <option value="SCRAPER">HTML Scraper</option>
                            </select>
                        </div>

                        <div className="pt-4">
                            <button className="bg-amber-500 hover:bg-amber-400 text-blue-950 font-black uppercase tracking-widest py-4 px-8 w-full rounded transition-all transform active:scale-95">
                                Create Source
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'list' && (
                <div className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700">
                    <table className="w-full text-left">
                        <thead className="bg-neutral-900 text-neutral-400 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="p-4 font-bold">Name</th>
                                <th className="p-4 font-bold">Type</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold">Last Checked</th>
                                <th className="p-4 font-bold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-700">
                            {sources.map((source) => (
                                <tr key={source.id} className="hover:bg-neutral-700/50 transition-colors">
                                    <td className="p-4 font-medium text-white">{source.name}</td>
                                    <td className="p-4"><span className="bg-neutral-700 px-2 py-1 rounded text-[10px] font-mono">{source.type}</span></td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${source.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className={`text-xs ${source.isActive ? 'text-green-300' : 'text-red-300'}`}>
                                                {source.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {source.lastStatus === 'ERROR' && <span className="text-[10px] font-bold bg-red-900/50 text-red-500 px-2 py-0.5 rounded mt-1 inline-block">ERROR</span>}
                                    </td>
                                    <td className="p-4 text-sm text-neutral-400">
                                        {source.lastChecked ? new Date(source.lastChecked).toLocaleString() : 'Never'}
                                        {source.errorMsg && <div className="text-xs text-red-400 mt-1 max-w-xs truncate" title={source.errorMsg}>{source.errorMsg}</div>}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <form action={async () => {
                                            await refreshSource(source.id);
                                        }}>
                                            <button className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/30 px-3 py-1 rounded text-xs font-bold transition-all">
                                                Refresh
                                            </button>
                                        </form>
                                        <form action={async () => {
                                            await toggleSource(source.id, source.isActive);
                                        }}>
                                            <button className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-xs text-white transition-all">
                                                {source.isActive ? 'Pause' : 'Resume'}
                                            </button>
                                        </form>
                                        <form action={async () => {
                                            if (confirm('Are you sure?')) {
                                                await deleteSource(source.id);
                                            }
                                        }}>
                                            <button className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/30 px-3 py-1 rounded text-xs font-bold transition-all">
                                                Delete
                                            </button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                            {sources.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-neutral-500 font-mono text-sm uppercase">No sources active. Use the builder to add one.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
