import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  // Fetch logged-in user
  const user = await prisma.user.findUnique({
    where: { id: sessionToken },
  });

  if (!user) {
    redirect("/login");
  }

  // Fetch user's managed businesses (if business model exists)
  let businesses = [];
  try {
    // @ts-ignore - Safely query businesses if relation exists
    businesses = await prisma.business.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    // Fallback if Business table isn't migrated yet
    businesses = [];
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold text-lg">
              L
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LocalLaunch</span>
          </div>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium text-sm"
            >
              <span>📊 Dashboard</span>
            </Link>
            <Link
              href="/editor"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 font-medium text-sm transition"
            >
              <span>🛠️ Website Builder</span>
            </Link>
            <Link
              href="/onboarding"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-900 hover:text-slate-200 font-medium text-sm transition"
            >
              <span>➕ Add Business</span>
            </Link>
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">Signed in as</div>
          <div className="text-sm font-semibold text-slate-200 truncate">{user.email}</div>
          <div className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
            {user.role}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Top Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Overview Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your local business presence and published microsites.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/onboarding"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-4 py-2 rounded-lg shadow transition"
            >
              + Create New Site
            </Link>
          </div>
        </header>

        {/* Analytics / Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Managed Sites</div>
            <div className="text-3xl font-extrabold text-white mt-2">{businesses.length}</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Account Role</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2">{user.role}</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-xl">
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">System Status</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2 flex items-center space-x-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Online</span>
            </div>
          </div>
        </section>

        {/* Business Sites Management Section */}
        <section className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Your Business Websites</h2>
            <span className="text-xs text-slate-400">{businesses.length} Active Listing(s)</span>
          </div>

          {businesses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🏪</div>
              <h3 className="text-base font-semibold text-slate-200">No businesses added yet</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
                Get started by creating your first business microsite or configuring your workspace settings.
              </p>
              <Link
                href="/onboarding"
                className="inline-block mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition"
              >
                Build First Website
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {businesses.map((b: any) => (
                <div key={b.id} className="p-6 flex items-center justify-between hover:bg-slate-900/50 transition">
                  <div>
                    <h3 className="font-semibold text-white text-base">{b.name || "Untitled Business"}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{b.category || "General Business"}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/editor?id=${b.id}`}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded font-medium transition"
                    >
                      Edit Site
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
