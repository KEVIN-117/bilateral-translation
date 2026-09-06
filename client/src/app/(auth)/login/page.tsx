import type { Metadata } from "next";
import { LoginForm } from "@/components/organisms/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | SOCITEC",
  description: "Ingresa a la plataforma de la Sociedad Científica.",
};

export default function LoginPage() {
  return <LoginForm />;
}
