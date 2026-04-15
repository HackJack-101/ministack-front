import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { usePageTitle } from "../../hooks/usePageTitle";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  usePageTitle();
  return (
    <div className="min-h-screen bg-surface-base">
      <TopBar />
      <Sidebar />
      <main className="ml-12 pt-12 min-h-screen overflow-auto">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};
