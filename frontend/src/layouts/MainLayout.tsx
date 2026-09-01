import type { ReactNode } from "react";

import MainNavbar from "../components/layout/MainNavbar";
import MainFooter from "../components/layout/MainFooter";

interface MainLayoutProps {

    children: ReactNode;

}

function MainLayout({
    children,
}: MainLayoutProps) {

    return (

        <div className="
            min-h-screen
            bg-slate-50
            text-slate-900
        ">

            <MainNavbar />

            <main>
                {children}
            </main>

            <MainFooter />

        </div>
    );
}

export default MainLayout;