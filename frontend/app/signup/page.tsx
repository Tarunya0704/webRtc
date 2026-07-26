import Logo from "@/components/Logo";
import SignupForm from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Logo />
          <h1 className="mt-4 text-xl font-semibold text-zoom-gray-900">Create your account</h1>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
