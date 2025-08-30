import { NavLink, Outlet } from "react-router-dom";
import { MadeWithLasy } from "./made-with-lasy";
import { cn } from "@/lib/utils";

const Layout = () => {
  const getLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "py-2 px-4 rounded-md transition-colors text-lg",
      isActive ? "bg-red-600 text-white" : "text-gray-400 hover:bg-gray-700"
    );

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="p-4">
        <nav className="flex justify-center items-center gap-4 bg-gray-800 p-2 rounded-lg">
          <NavLink to="/predictions" className={getLinkClass}>
            Predições
          </NavLink>
          <NavLink to="/history" className={getLinkClass}>
            Histórico
          </NavLink>
          <NavLink to="/tutorial" className={getLinkClass}>
            Tutorial
          </NavLink>
        </nav>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <Outlet />
      </main>
      <MadeWithLasy />
    </div>
  );
};

export default Layout;