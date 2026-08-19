import { LogOut } from "lucide-react";
import { logoutAction } from "@/components/layout/logout-action";
import { Button } from "@/components/ui/button";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction} className={className}>
      <Button type="submit" variant="secondary" size="sm">
        <LogOut aria-hidden="true" className="size-3.5" />
        Sign out
      </Button>
    </form>
  );
}
