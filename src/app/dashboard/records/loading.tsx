'use client';

export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-4 px-4">
      <div className="flex items-center gap-4 py-4">
        <div className="flex h-9 w-full items-center justify-between">
          <div className="bg-muted h-full w-full max-w-md rounded-md"></div>
          <div className="bg-muted h-full w-32 rounded-md"></div>
        </div>
      </div>

      <div className="bg-muted h-[55dvh] w-full rounded-md"></div>

      <div className="flex items-center justify-between">
        <div className="bg-muted h-8 w-40 max-w-md rounded-md"></div>
        <div className="bg-muted h-8 w-32 rounded-md"></div>
      </div>
    </div>
  );
}
