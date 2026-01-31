
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import './globals.css'
import IncomingCallToast from '@/components/IncomingCallToast'
import MobileNav from '@/components/MobileNav'

// Force deployment refresh - v2.0 - 2026-01-29-17:44
export const metadata = {
  title: 'Zerotouches (SaaS)',
  description: 'Barber Retention System',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  try {
    user = await getCurrentUser()
  } catch (error) {
    console.warn("Layout: Failed to fetch user (possibly build time or db error)", error)
  }

  return (
    <html lang="en">
      <body className="bg-white min-h-screen text-black font-sans selection:bg-black selection:text-white">
        <div className="flex min-h-screen">
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
              {user ? (
                <>
                  <div className="mb-6 bg-blue-950/50 p-3 rounded border border-amber-400/20 text-center">
                    <p className="text-[10px] font-mono text-amber-400/60 uppercase mb-1">Operating Credits</p>
                    <p className="text-xl font-black text-white tracking-tighter">
                      £{Number(user.tenant.walletBalance || 0).toFixed(2)}
                    </p>
                  </div>

                  {/* Master Control - SUPER_ADMIN ONLY */}
                  {user.role === 'SUPER_ADMIN' && (
                    <div className="mb-6 border-b-2 border-red-500/20 pb-4">
                      <p className="font-mono text-xs font-bold uppercase text-red-500 mb-4 tracking-wider pl-2">Master Control</p>
                      <NavLink href="/admin/super" className="text-red-400 hover:text-red-200">Super Dashboard</NavLink>
                      <NavLink href="/admin/sources" className="text-red-400 hover:text-red-200">All Sources</NavLink>
                      <NavLink href="/admin/sources?tab=builder" className="text-red-400 hover:text-red-200">RSS Feed Builder</NavLink>
                      <NavLink href="/admin/sources?tab=scraper" className="text-red-400 hover:text-red-200">Web Scraper Tool</NavLink>
                      <NavLink href="/admin/reports" className="text-red-400 hover:text-red-200">Content Reports</NavLink>
                      <NavLink href="/admin/jobs" className="text-red-400 hover:text-red-200">Job Moderation</NavLink>
                    </div>
                  )}

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
                  {/* Master Control moved to top */}
                </>
              ) : (
                <>
                  <div className="mb-6 p-4 rounded border border-amber-400/20 text-center bg-blue-900/50">
                    <p className="text-sm font-bold text-white mb-2">Barber Retention System</p>
                    <Link href="/login" className="block w-full bg-amber-400 text-blue-950 font-bold py-2 uppercase tracking-wide text-xs rounded hover:bg-white transition-colors">
                      Login / Join
                    </Link>
                  </div>

                  <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">Operations</p>
                  <div className="opacity-70 hover:opacity-100 transition-opacity">
                    <NavLink href="/login">Dashboard 🔒</NavLink>
                    <NavLink href="/login">Clients 🔒</NavLink>
                    <NavLink href="/login">Check In 🔒</NavLink>
                  </div>

                  <div className="pt-4 mt-4 border-t-2 border-amber-400/20">
                    <p className="font-mono text-xs font-bold uppercase text-amber-400/50 mb-4 tracking-wider pl-2">System</p>
                    <NavLink href="/">Job Board</NavLink>
                    <NavLink href="/login">Barber Login</NavLink>
                    <div className="mt-4 opacity-70 hover:opacity-100 transition-opacity">
                      <NavLink href="/login">Concierge Phone 🔒</NavLink>
                      <NavLink href="/login">AI Console 🔒</NavLink>
                    </div>
                  </div>
                </>
              )}
            </nav>

            {/* USER FOOTER */}
            {user && (
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
                      <button className="mt-1 w-full text-left px-3 py-2 border border-red-500/30 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
                        <span>Sign Out</span>
                        <span className="text-sm">→</span>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
            {/* DEBUG: Temporary Role Display */}
            <div className="text-[10px] text-zinc-500 p-2 text-center opacity-50 hover:opacity-100">
              Role: {user?.role || 'Guest'}
            </div>
          </aside>


          {/* MAIN CONTENT WRAPPER */}
          {/* Flex layout handles spacing strictly now - no magic margins */}
          <main className="flex-1 flex flex-col min-h-screen bg-blue-950 text-amber-400 selection:bg-amber-400 selection:text-blue-950 w-full">
            <MobileNav user={user ? {
              name: user.name,
              email: user.email,
              role: user.role,
              image: user.image,
              tenant: {
                name: user.tenant.name,
                walletBalance: Number(user.tenant.walletBalance || 0),
                subscriptionStatus: user.tenant.subscriptionStatus
              }
            } : null} />
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
