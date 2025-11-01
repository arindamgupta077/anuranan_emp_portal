import NavbarSkeleton from '@/components/layout/NavbarSkeleton'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar with all buttons visible */}
      <NavbarSkeleton />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section Skeleton - Compact */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 p-6 shadow-xl animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded"></div>
                  <div className="h-4 bg-white/30 rounded w-28"></div>
                </div>
                <div className="h-8 bg-white/30 rounded w-2/3"></div>
                <div className="h-4 bg-white/30 rounded w-1/2"></div>
              </div>
              <div className="ml-4 h-7 bg-white/30 rounded-full w-24"></div>
            </div>
          </div>

          {/* Stats Grid Skeleton - Modern Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-6 shadow-lg animate-pulse">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-20"></div>
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="w-14 h-14 bg-gray-300 rounded-xl"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 bg-gray-300 rounded w-24"></div>
                    <div className="h-3 bg-gray-300 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-pulse">
            <div className="space-y-6">
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Overview Skeleton */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-8 border border-gray-200 animate-pulse">
            <div className="space-y-6">
              <div>
                <div className="h-8 bg-gray-200 rounded w-56 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-40"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="h-9 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tip Section Skeleton */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200 animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-cyan-300 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-cyan-200 rounded w-40"></div>
                <div className="h-4 bg-cyan-200 rounded w-full"></div>
                <div className="h-4 bg-cyan-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Anuranan - Bengali Recitation Training Institute
          </p>
        </div>
      </footer>
    </div>
  )
}
