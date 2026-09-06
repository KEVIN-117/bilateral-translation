import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RegisterForm } from "@/components/organisms/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6 md:min-h-[calc(100svh-5rem)]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[320px] w-[320px] sm:h-[600px] sm:w-[600px] bg-[#006f87] rounded-full blur-[150px] opacity-20 pointer-events-none animate-pulse" />

      <div className="relative z-20 mb-6 self-start">
        <Link
          href="/"
          className="text-gray-400 hover:text-white flex items-center text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Link>
      </div>

      <RegisterForm />
    </div>
  );
}
