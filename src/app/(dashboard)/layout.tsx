import { Sidebar } from "./_components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main>
        <Sidebar />
        {children}
    </main>
  );
}
