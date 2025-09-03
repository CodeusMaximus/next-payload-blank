// app/(app)/dashboard/DashboardShell.tsx
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-slate-950">
      {/* content container */}
      <div className="mx-auto w-full max-w-[1600px] px-5 sm:px-6 lg:px-10 py-8">
        {/* stronger default type + more line height */}
        <div className="text-slate-100 leading-8 tracking-wide text-[15px] sm:text-base">
          {children}
        </div>
      </div>
    </div>
  )
}
