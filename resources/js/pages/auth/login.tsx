import { Form, Head } from '@inertiajs/react';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';

export default function Login() {
    return (
        <AuthLayout
            title="Welcome"
            description="Sign in to your SABIMS account"
        >
            <Head title="Login - SABIMS" />

            <Form {...store.form()} className="space-y-5">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 dark:text-slate-200 font-medium">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className="h-11 pl-10 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500/20 transition-shadow"
                                        placeholder="sample@example.com"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-200 font-medium">
                                        Password
                                    </Label>
                                    <TextLink href="#" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                        Forgot password?
                                    </TextLink>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        className="h-11 pl-10 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500/20 transition-shadow"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox id="remember" name="remember" className="rounded border-slate-300 dark:border-slate-600" />
                            <label
                                htmlFor="remember"
                                className="text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none"
                            >
                                Remember me
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="h-12 w-full rounded-lg bg-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all duration-200 active:scale-[0.99]"
                            disabled={processing}
                        >
                            {processing ? (
                                <Spinner className="mr-2 h-5 w-5" />
                            ) : (
                                <ShieldCheck className="mr-2 h-5 w-5" />
                            )}
                            Log in
                        </Button>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-1">
                            Don&apos;t have an account?{' '}
                            <TextLink href={register()} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                Register
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}