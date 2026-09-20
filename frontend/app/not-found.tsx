import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">We couldn&apos;t find that page</h1>
        <p className="text-sm text-muted-foreground">
          The project or page you were after doesn&apos;t exist in this demo.
        </p>
        <Button asChild>
          <Link href="/">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
