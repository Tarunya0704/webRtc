import Navbar from "@/components/Navbar";

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-zoom-gray-900">Schedule a Meeting</h1>
        <p className="mt-2 text-sm text-zoom-gray-600">
          The scheduling form (title, description, date &amp; time, duration) is coming
          soon.
        </p>
      </main>
    </div>
  );
}
