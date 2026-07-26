import Navbar from "@/components/Navbar";

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-zoom-gray-900">Join a Meeting</h1>
        <p className="mt-2 text-sm text-zoom-gray-600">
          The join flow (Meeting ID or invite link, display name entry) is coming in the
          next phase.
        </p>
      </main>
    </div>
  );
}
