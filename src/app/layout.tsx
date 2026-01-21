
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import './globals.css'
import IncomingCallToast from '@/components/IncomingCallToast'
import MobileNav from '@/components/MobileNav'

export const metadata = {
  title: 'Zerotouches (SaaS)',
  description: 'Barber Retention System',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <body className="bg-white min-h-screen text-black font-sans selection:bg-black selection:text-white">
        <div className="flex min-h-screen">
          {user && (
            <>
              <MobileNav user={user} />
              <aside className="w-72 border-r-2 border-amber-400 bg-blue-900/50 flex flex-col sticky top-0 h-screen z-50 overflow-y-auto hidden lg:flex flex-shrink-0">
                {/* BRAND HEADER */}
                <div className="p-8 border-b-2 border-amber-400">
                  <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-white">
                    Zerotouches.
                  </h1>
                  <p className="font-mono text-[10px] text-amber-400 uppercase tracking-widest mt-2">
                    System Online
                  </p>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 p-6 space-y-2">
                  <div className="mb-6 bg-blue-950/50 p-3 rounded border border-amber-400/20 text-center">
                    <p className="text-[10px] font-mono text-amber-400/60 uppercase mb-1">Operating Credits</p>
                    <p className="text-xl font-black text-white tracking-tighter">
                      £{Number(user.tenant.walletBalance || 0).toFixed(2)}
                    </p>
                  </div>

                  <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">Operations</p>
                  {user.tenant.subscriptionStatus === 'ACTIVE' ? (
                    <>
                      <NavLink href="/dashboard">Dashboard</NavLink>
                      <NavLink href="/clients">Clients</NavLink>
                      <NavLink href="/check-in">Check In</NavLink>
                    </>
                  ) : (
                    <div className="opacity-70 group-hover:opacity-100">
                      <NavLink href="/upgrade">Dashboard 🔒</NavLink>
                      <NavLink href="/upgrade">Clients 🔒</NavLink>
                      <NavLink href="/upgrade">Check In 🔒</NavLink>
                    </div>
                  )}


                  <div className="pt-4 mt-4 border-t-2 border-amber-400/20">
                    <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">System</p>
                    <NavLink href="/settings">Settings</NavLink>
                    <NavLink href="/settings/billing">Billing & Plans</NavLink>

                    {user.tenant.subscriptionStatus === 'ACTIVE' ? (
                      <NavLink href="/settings/phone">Concierge Phone</NavLink>
                    ) : (
                      <NavLink href="/upgrade">Concierge Phone 🔒</NavLink>
                    )}

                    <div className="pt-4 pb-2 text-xs font-bold text-amber-500/50 uppercase tracking-widest">Network</div>

                    <NavLink href="/barber/profile">My Profile</NavLink>
                    {user.role === 'OWNER' && (
                      <NavLink href="/shop/profile">Shop Profile</NavLink>
                    )}
                    <NavLink href="/jobs">Job Board</NavLink>
                    <NavLink href="/notifications">Alerts</NavLink>
                    <NavLink href="/assisted">AI Console</NavLink>
                    <NavLink href="/help">Manual</NavLink>
                  </div>

                  {user.role === 'OWNER' && (
                    <div className="pt-4 mt-4 border-t-2 border-amber-400/20">
                      <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">Admin</p>
                      <NavLink href="/admin/sources">Job Sources</NavLink>
                      <NavLink href="/admin/jobs">Job Moderation</NavLink>
                    </div>
                  )}
                  {user.role === 'SUPER_ADMIN' && (
                    <div className="pt-4 mt-4 border-t-2 border-amber-400/20">
                      <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">Master Control</p>
                      <NavLink href="/admin/super">Super Dashboard</NavLink>
                      <NavLink href="/admin/sources">Job Sources</NavLink>
                      <NavLink href="/admin/reports">Content Reports</NavLink>
                      <NavLink href="/admin/jobs">Job Moderation</NavLink>
                    </div>
                  )}
                </nav>

                {/* USER FOOTER */}
                <div className="p-6 border-t-2 border-amber-400 bg-blue-950">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-400 text-blue-950 flex items-center justify-center font-bold tracking-tighter">
                      {user.name?.[0] || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-white">{user.name}</p>
                      <form action={async () => {
                        'use server'
                        const { logout } = await import('./login/actions')
                        await logout()
                      }}>
                        <button className="text-[10px] text-amber-400/70 hover:text-red-400 uppercase tracking-widest font-mono">
                          Disconnect
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </aside>
          )}

              {/* MAIN CONTENT WRAPPER */}
              {/* Flex layout handles spacing strictly now - no magic margins */}
              <main className="flex-1 flex flex-col min-h-screen bg-blue-950 text-amber-400 selection:bg-amber-400 selection:text-blue-950 w-full">
                <div className="lg:hidden p-4 border-b-2 border-amber-400 flex justify-between items-center bg-blue-900 sticky top-0 z-40 text-white">
                  <span className="font-black uppercase tracking-tighter">Zerotouches</span>
                  <span className="text-xs font-mono bg-amber-400 text-blue-950 px-2 py-1 font-bold">MENU</span>
                </div>
                <IncomingCallToast />
                {children}
              </main>
            </div>
      </body>
    </html>
  )
}


function NavLink({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) {
  return (
    <Link href={href} className={`flex items-center px-4 py-3 text-sm font-bold uppercase tracking-wider border-2 border-transparent hover:border-amber-400 hover:bg-amber-400 hover:text-blue-950 transition-all text-amber-400/60 hover:shadow-[4px_4px_0px_0px_#fbbf24] ${className || ''}`}>
      {children}
    </Link>
  )
}
