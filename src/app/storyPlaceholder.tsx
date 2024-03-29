export function StoryPlaceholder() {
  return (
    <div className="grid gap-4 lg:grid-cols-8">
      <div className="flex flex-col gap-2 lg:col-span-3">
        <div className="h-4 bg-neutral-900"></div>
        <div className="h-4 bg-neutral-900"></div>
        <div className="h-4 bg-neutral-900"></div>
      </div>
      <div className="lg:col-span-5">
        <div className="h-36 bg-neutral-900"></div>
      </div>
    </div>
  );
}
