import Navbar from "@/components/Navbar";
import ScheduleForm from "@/components/ScheduleForm";

export default function SchedulePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-12 sm:px-6">
        <h1 className="mb-6 text-xl font-semibold text-zoom-gray-900">Schedule a Meeting</h1>
        <ScheduleForm />
      </main>
    </div>
  );
}
