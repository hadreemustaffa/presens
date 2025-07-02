'use client';

export default function Loading() {
  return (
    <div className="flex h-full animate-pulse flex-col gap-4 px-4">
      <div className="bg-muted h-8 w-75 rounded-md"></div>
      <div className="flex h-full flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 @2xl/main:grid-cols-2 @5xl/main:grid-cols-4">
          <div className="bg-muted h-32 rounded-md"></div>
          <div className="bg-muted h-32 rounded-md"></div>
          <div className="bg-muted h-32 rounded-md"></div>
          <div className="bg-muted h-32 rounded-md"></div>
        </div>

        <div className="grid h-full grid-cols-1 gap-4 @[840px]/main:grid-cols-2 @[1400px]/main:grid-cols-4">
          <div className="bg-muted col-span-full h-80 rounded-md @[840px]/main:col-span-2 @[1248px]/main:h-auto"></div>

          <div className="bg-muted h-80 rounded-md @[840px]/main:h-auto"></div>

          <div className="flex flex-col gap-4">
            <div className="bg-muted h-32 w-full rounded-md"></div>
            <div className="bg-muted h-80 w-full rounded-md @[1248px]/main:h-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
