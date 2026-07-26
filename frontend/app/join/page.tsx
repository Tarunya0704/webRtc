import Navbar from "@/components/Navbar";
import JoinForm from "@/components/JoinForm";

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-12 sm:px-6">
        <h1 className="mb-6 text-xl font-semibold text-zoom-gray-900">Join a Meeting</h1>
        <JoinForm />
      </main>
    </div>
  );
}
