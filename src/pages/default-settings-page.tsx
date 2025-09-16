export function DefaultSettingsPage() {
  return (
    <div className="grid grid-rows-[4rem_1fr] grid-cols-[200px_1fr] w-full max-w-4xl h-screen">
      <div className="flex col-span-2 bg-blue-400 p-4">{/* Top bar */}</div>
      <div className="flex flex-col gap-4 bg-green-400 p-4">
        {/* Side bar */}
      </div>
      <div className="flex flex-col gap-4 bg-green-300 overflow-y-auto p-4">
        {/* Content */}
      </div>
    </div>
  );
}
