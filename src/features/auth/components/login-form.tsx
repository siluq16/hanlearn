"use client";
import { useActionState } from "react";
import { LoaderCircle, ArrowRight } from "lucide-react";
import { login } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="Email tài khoản của bạn"
          required
          maxLength={254}
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Mật khẩu
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
          required
          maxLength={128}
          disabled={pending}
        />
      </div>
      {state.error && (
        <p
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm leading-6 text-destructive"
        >
          {state.error}
        </p>
      )}
      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="animate-spin motion-reduce:animate-none" />
            Đang đăng nhập…
          </>
        ) : (
          <>
            Vào không gian học <ArrowRight />
          </>
        )}
      </Button>
    </form>
  );
}
