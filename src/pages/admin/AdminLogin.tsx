import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { loginSchema, type LoginFormValues } from "../../lib/validation";
import { useAuth } from "../../hooks/useAuth";
import { Field, inputClass } from "../../components/Field";
import { Spinner } from "../../components/ui";
import { useToast } from "../../components/Toast";

export function AdminLogin() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password);
      toast("Welcome back, admin.", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Login failed", "error");
    }
  };

  return (
    <div className="grid-noise flex min-h-[70vh] items-center justify-center px-5 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass w-full max-w-md rounded-[20px] p-8"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-white/[0.04]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold">Admin Access</h1>
          <p className="mt-1 text-sm text-white/50">Sign in to manage the marketplace.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="Email" error={errors.email?.message}>
            <input {...register("email")} className={inputClass} placeholder="*******" />
          </Field>
          <Field label="Password" error={errors.password?.message}>
            <input
              type="password"
              {...register("password")}
              className={inputClass}
              placeholder="••••••••"
            />
          </Field>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {isSubmitting ? <Spinner className="text-black" /> : null}
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}
