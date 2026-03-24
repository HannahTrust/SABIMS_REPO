import { Gavel } from "lucide-react";

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen">
            {/* Left Side: Visual/Branding (Hidden on mobile) */}
            <div className="relative hidden w-0 flex-1 bg-blue-900 lg:block">
                <div className="absolute inset-0 h-full w-full bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="relative z-10 flex h-full flex-col items-center justify-center px-12 text-white">
                    <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                        <Gavel size={40} className="text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-bold">SABIMS Portal</h2>
                    <p className="mt-4 text-center text-lg text-blue-100 max-w-md">
                        "Empowering the Sangguniang Bayan with efficient data management and legislative transparency."
                    </p>
                </div>
                <div className="absolute bottom-8 left-8 right-8 flex justify-between text-xs text-blue-300">
                    <span>Republic of the Philippines</span>
                    <span>v2.0.4</span>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:flex-none lg:px-20 xl:px-24 bg-white dark:bg-[#0a0a0a]">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
                        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}