import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    FileText,
    CalendarDays,
    BarChart3,
    Users,
    Lock,
    Smartphone,
    Clock,
    ShieldCheck,
    RefreshCw,
    Target,
    Eye,
    Zap,
    Check,
    Building2,
    Facebook,
    Twitter,
    Instagram,
    ArrowRight,
} from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <Head title="SABIMS - Sangguniang Bayan Information Management System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700|poppins:500,600,700"
                    rel="stylesheet"
                />
            </Head>
            
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                {/* Navigation */}
                <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                    scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
                }`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 md:h-20">
                            {/* Logo */}
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="font-bold text-lg text-slate-800 dark:text-white">SABIMS</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Sangguniang Bayan IMS</p>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <div className="flex items-center space-x-4">
                                <a href="#features" className="hidden md:block text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
                                <a href="#about" className="hidden md:block text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">About</a>
                                <a href="#contact" className="hidden md:block text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
                                
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:scale-105"
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 font-medium transition-colors"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all hover:shadow-lg hover:scale-105"
                                            >
                                                Register
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-24 md:pt-32 lg:pt-40 pb-16 md:pb-24 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-600">
                                <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                                    Sangguniang Bayan Information Management System
                                </div>
                                
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white leading-tight">
                                    Streamline Your Local
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800"> Legislative Process</span>
                                </h1>
                                
                                <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg">
                                    SABIMS provides a comprehensive digital solution for managing ordinances, resolutions, sessions, and legislative documents efficiently and securely.
                                </p>
                                
                                <div className="flex flex-wrap gap-4">
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all hover:shadow-2xl hover:scale-105 text-lg"
                                    >
                                        Get Started
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <a
                                        href="#features"
                                        className="inline-flex items-center gap-2 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-xl font-medium hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-lg"
                                    >
                                        Learn More
                                    </a>
                                </div>
                                
                                <div className="flex items-center gap-8 pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-slate-800 dark:text-white">24/7</div>
                                            <div className="text-sm text-slate-500">Access</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-slate-800 dark:text-white">100%</div>
                                            <div className="text-sm text-slate-500">Secure</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                            <RefreshCw className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-slate-800 dark:text-white">Real-time</div>
                                            <div className="text-sm text-slate-500">Updates</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Dashboard preview card - animated */}
                            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl blur-3xl opacity-25 animate-pulse" style={{ animationDuration: '3s' }}></div>
                                <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-700 overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10">
                                    {/* Mini header */}
                                    <div className="flex items-center gap-2 mb-4 opacity-90">
                                        <div className="w-2 h-2 rounded-full bg-red-400" />
                                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                                        <div className="w-2 h-2 rounded-full bg-green-400" />
                                        <span className="ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">Dashboard preview</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        {[
                                            { Icon: FileText, from: 'from-blue-50', to: 'to-blue-100', dark: 'dark:from-blue-900/20 dark:to-blue-800/20', iconCl: 'text-blue-600 dark:text-blue-400', delay: '0ms' },
                                            { Icon: CalendarDays, from: 'from-emerald-50', to: 'to-emerald-100', dark: 'dark:from-emerald-900/20 dark:to-emerald-800/20', iconCl: 'text-emerald-600 dark:text-emerald-400', delay: '100ms' },
                                            { Icon: BarChart3, from: 'from-amber-50', to: 'to-amber-100', dark: 'dark:from-amber-900/20 dark:to-amber-800/20', iconCl: 'text-amber-600 dark:text-amber-400', delay: '200ms' },
                                            { Icon: Users, from: 'from-violet-50', to: 'to-violet-100', dark: 'dark:from-violet-900/20 dark:to-violet-800/20', iconCl: 'text-violet-600 dark:text-violet-400', delay: '300ms' },
                                        ].map(({ Icon, from, to, dark, iconCl, delay }, i) => (
                                            <div
                                                key={i}
                                                className={`h-20 bg-gradient-to-br ${from} ${to} ${dark} rounded-xl flex items-center justify-center animate-in fade-in zoom-in-95 duration-500 border border-white/50 dark:border-slate-600/30`}
                                                style={{ animationDelay: delay, animationFillMode: 'both' }}
                                            >
                                                <Icon className={`w-8 h-8 ${iconCl}`} strokeWidth={1.5} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        {[0.75, 1, 0.85].map((w, i) => (
                                            <div
                                                key={i}
                                                className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md animate-pulse"
                                                style={{ width: `${w * 100}%`, animationDelay: `${400 + i * 100}ms`, animationDuration: '1.5s' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-white dark:bg-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-4">
                                Comprehensive Features for Modern Governance
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                                Everything you need to manage legislative documents, track sessions, and streamline workflows
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { Icon: FileText, title: "Document Management", description: "Centralized repository for ordinances, resolutions, and legislative documents with version control", color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30" },
                                { Icon: CalendarDays, title: "Session Management", description: "Schedule and manage regular and special sessions with automated agenda generation", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30" },
                                { Icon: BarChart3, title: "Real-time Tracking", description: "Monitor document status, approvals, and legislative progress in real-time", color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30" },
                                { Icon: Users, title: "Member Directory", description: "Complete profile management for Sangguniang Bayan members and officials", color: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30" },
                                { Icon: Lock, title: "Secure Access", description: "Role-based access control ensuring proper document handling and confidentiality", color: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30" },
                                { Icon: Smartphone, title: "Mobile Responsive", description: "Access the system anytime, anywhere on any device", color: "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30" },
                            ].map((feature, index) => {
                                const Icon = feature.Icon;
                                return (
                                <div key={index} className="group p-6 bg-slate-50 dark:bg-slate-700/30 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{feature.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                            {[
                                { number: "100+", label: "LGUs Using SABIMS" },
                                { number: "50K+", label: "Documents Processed" },
                                { number: "99.9%", label: "Uptime Rate" },
                                { number: "24/7", label: "Support Available" }
                            ].map((stat, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="text-4xl font-bold">{stat.number}</div>
                                    <div className="text-blue-100">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="py-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-6">
                                    About Sangguniang Bayan Information Management System
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-4">
                                    SABIMS is a comprehensive digital solution designed specifically for Sangguniang Bayan offices to modernize and streamline legislative operations. Built with modern technology and deep understanding of local governance requirements.
                                </p>
                                <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                                    Our system helps local legislative bodies transition from traditional paper-based processes to an efficient, secure, and accessible digital platform.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        "Automated document tracking and management",
                                        "Secure cloud-based infrastructure",
                                        "Compliant with local government standards",
                                        "Dedicated support and training"
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                                                <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                                            </span>
                                            <span className="text-slate-700 dark:text-slate-200">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl blur-3xl opacity-20"></div>
                                <div className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600/50">
                                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                                <Target className="w-6 h-6" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-white">Mission</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">Digitize and streamline legislative processes</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600/50">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                <Eye className="w-6 h-6" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-white">Vision</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">Modern, efficient, and transparent governance</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-100 dark:border-slate-600/50">
                                            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                                <Zap className="w-6 h-6" strokeWidth={1.5} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-white">Goal</div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">Empower LGUs with cutting-edge technology</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                    <div className="max-w-4xl mx-auto text-center px-4">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Ready to Transform Your Legislative Management?
                        </h2>
                        <p className="text-xl text-slate-300 mb-8">
                            Join hundreds of LGUs already using SABIMS to streamline their operations
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href={register()}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all hover:shadow-2xl hover:scale-105 text-lg"
                            >
                                Get Started Now
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <a
                                href="#contact"
                                className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-xl font-medium transition-all text-lg"
                            >
                                Contact Sales
                            </a>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer id="contact" className="bg-white dark:bg-slate-800 py-12">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-white">SABIMS</span>
                                </div>
                                <p className="text-sm text-slate-500">Modernizing local governance through technology</p>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Quick Links</h4>
                                <ul className="space-y-2 text-sm text-slate-500">
                                    <li><a href="#features" className="hover:text-blue-600">Features</a></li>
                                    <li><a href="#about" className="hover:text-blue-600">About</a></li>
                                    <li><a href="#contact" className="hover:text-blue-600">Contact</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4">Contact</h4>
                                <ul className="space-y-2 text-sm text-slate-500">
                                    <li>info@sabims.gov.ph</li>
                                    <li>(02) 1234-5678</li>
                                    <li>Manila, Philippines</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-4 text-slate-800 dark:text-white">Follow Us</h4>
                                <div className="flex gap-3">
                                    <a href="#" className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
                                    <a href="#" className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
                                    <a href="#" className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500">
                            © 2024 Sangguniang Bayan Information Management System. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}