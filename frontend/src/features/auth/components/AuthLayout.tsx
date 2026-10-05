import type { ReactNode } from "react";

export interface AuthLayoutProps {
    title: string;
    subtitle: string;
    heroImage?: string;
    children: ReactNode;
}

export function AuthLayout({
    title,
    subtitle,
    heroImage,
    children,
}: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left visual branding */}
            <div className="hidden md:flex md:w-1/2 relative">
                <img
                    src={heroImage}
                    alt="City visual"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="relative mt-auto p-10 text-white z-10">
                    <h2 className="text-3xl font-bold tracking-tight">JanFix</h2>
                    <p className="mt-2 max-w-sm text-sm text-white/90">
                        Empowering citizens to build a better tomorrow through transparent
                        civic action and community maintenance.
                    </p>
                </div>
            </div>

            {/* Right form content */}
            <div className="flex w-full md:w-1/2 items-center justify-center px-6 py-10">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

                    <div className="mt-6">
                        {children}
                    </div>

                    <footer className="mt-6 flex justify-center gap-5 text-xs text-slate-500">
                        <a href="#" className="hover:text-slate-700 transition">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-700 transition">Terms of Service</a>
                        <a href="#" className="hover:text-slate-700 transition">Community Guidelines</a>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
