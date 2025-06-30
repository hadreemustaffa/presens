export default function Loading() {
  return (
    <div className="flex min-h-full w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center">
          <div className="border-primary h-5 w-5 animate-spin rounded-full border-b-2" />
        </div>
      </div>
    </div>
  );
}
