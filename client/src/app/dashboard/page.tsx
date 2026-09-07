export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-bold font-heading text-2xl text-white sm:text-3xl">
          Bienvenido al <span className="text-gradient">Dashboard</span>
        </h1>
        <p className="text-gray-400 mt-2">
          Desde aquí puedes gestionar tus artículos, ver estadísticas y
          administrar tu cuenta.
        </p>
      </div>

      <div className="grid auto-rows-min gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="text-gray-500 font-medium">Estadística 1</span>
        </div>
        <div className="aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="text-gray-500 font-medium">Estadística 2</span>
        </div>
        <div className="aspect-video rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="text-gray-500 font-medium">Estadística 3</span>
        </div>
      </div>

      <div className="min-h-[50vh] flex-1 rounded-xl bg-white/5 border border-white/10 mt-4 flex items-center justify-center">
        <span className="text-gray-500 font-medium">Panel Principal</span>
      </div>
    </div>
  );
}
