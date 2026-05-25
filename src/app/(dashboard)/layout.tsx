import Sidebar from "@/components/Sidebar";
import MobileSidebar from "@/components/MobileSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh)]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar trigger — add in header if needed */}
      <div className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 md:hidden">
          <MobileSidebar />
          <span className="font-medium text-sm">DocVault</span>
        </div>
        {children}
      </div>
    </div>
  );
}
