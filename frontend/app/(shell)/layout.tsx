import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

/** The signed-in application frame. The welcome page sits outside it. */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
