export function OneColumnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center">
      <div className="grid grid-rows-[4rem_1fr] grid-cols-1 w-full max-w-4xl h-screen gap-8 px-2">
        {children}
      </div>
    </div>
  );
}
