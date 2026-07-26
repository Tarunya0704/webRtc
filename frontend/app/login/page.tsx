import Logo from "@/components/Logo";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Logo />
          <h1 className="mt-4 text-xl font-semibold text-zoom-gray-900">Log In</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
