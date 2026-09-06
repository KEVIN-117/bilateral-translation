import type { Metadata } from "next";
import { RegisterForm } from "@/components/organisms/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Crear cuenta | SOCITEC",
  description: "Únete a la Sociedad Científica de Ingeniería de Sistemas.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
