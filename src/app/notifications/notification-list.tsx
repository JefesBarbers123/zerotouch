'use client'

import { markAsRead, markAllAsRead } from '../actions/notifications'
import { useRouter } from 'next/navigation'

export default function NotificationList({ notifications }: any) {
    const router = useRouter()

    const handleRead = async (id: string, link?: string | null) => {
        await markAsRead(id)
        if (link) {
            router.push(link)
        } else {
            router.refresh()
        }
    }

    const handleMarkAll = async () => {
        await markAllAsRead()
        router.refresh()
    }

    if (!notifications || notifications.length === 0) {
        return (
            <div className="p-12 text-center border-2 border-dashed border-white/10 rounded-none bg-blue-900/20">
                <p className="text-white/50 font-mono uppercase tracking-widest">No new alerts</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={handleMarkAll}
                    className="text-[10px] font-bold uppercase tracking-widest text-amber-400 hover:text-white transition-colors"
                >
                    Mark All Read
                </button>
            </div>

            <div className="grid gap-4">
                {notifications.map((n: any) => (
                    <div
                        key={n.id}
                        onClick={() => handleRead(n.id, n.link)}
                        className={`p-6 border cursor-pointer transition-all group relative ${n.read
                                ? 'bg-blue-900/20 border-white/5 opacity-60 hover:opacity-100'
                                : 'bg-blue-950 border-amber-400/50 hover:bg-blue-900/50'
                            }`}
                    >
                        {!n.read && (
                            <div className="absolute top-4 right-4 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                        )}

                        <div className="flex items-start gap-4">
                            <div className={`mt-1 w-8 h-8 flex items-center justify-center font-black rounded-none ${n.type === 'ALERT' ? 'bg-amber-400 text-blue-950' : 'bg-white text-blue-950'
                                }`}>
                                !
                            </div>
                            <div>
                                <h3 className={`font-black uppercase tracking-wide mb-1 ${n.read ? 'text-white/70' : 'text-white'}`}>
                                    {n.title}
                                </h3>
                                <p className="text-xs font-mono text-white/50 mb-2 leading-relaxed">
                                    {n.message}
                                </p>
                                <span className="text-[10px] uppercase tracking-widest text-white/20">
                                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
