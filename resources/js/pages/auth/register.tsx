import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { User, Mail, Lock, UserPlus, ShieldCheck } from 'lucide-react';

const inputClass =
    'h-11 pl-10 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500/20 transition-shadow';
const iconClass = 'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500';

export default function Register() {
    return (
        <AuthLayout
            title="Create account"
            description="Register your SABIMS officer credentials"
        >
            <Head title="Register - SABIMS" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700 dark:text-slate-200 font-medium">
                                    Full name
                                </Label>
                                <div className="relative">
                                    <User className={iconClass} />
                                    <Input
                                        id="name"
                                        name="name"
                                        className={inputClass}
                                        placeholder="Hon. Juan Dela Cruz"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-700 dark:text-slate-200 font-medium">
                                    Email
                                </Label>
                                <div className="relative">
                                    <Mail className={iconClass} />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        className={inputClass}
                                        placeholder="sample@example.com"
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-200 font-medium">
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Lock className={iconClass} />
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            className={inputClass}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className="text-slate-700 dark:text-slate-200 font-medium">
                                        Confirm password
                                    </Label>
                                    <div className="relative">
                                        <ShieldCheck className={iconClass} />
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            name="password_confirmation"
                                            className={inputClass}
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="h-12 w-full rounded-lg bg-blue-600 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all duration-200 active:scale-[0.99]"
                            disabled={processing}
                        >
                            {processing ? (
                                <Spinner className="mr-2 h-5 w-5" />
                            ) : (
                                <UserPlus className="mr-2 h-5 w-5" />
                            )}
                            Register
                        </Button>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-1">
                            Already have an account?{' '}
                            <TextLink href={login()} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                Sign in
                            </TextLink>
                        </p>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}