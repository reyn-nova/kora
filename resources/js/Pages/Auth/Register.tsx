import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function Register() {
    const [data, setData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [processing, setProcessing] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
    const usernameTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const emailTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (!data.username) {
            setUsernameAvailable(null);
            return;
        }
        clearTimeout(usernameTimer.current);
        usernameTimer.current = setTimeout(() => {
            fetch(`/api/check/username/${encodeURIComponent(data.username)}`)
                .then((res) => res.json())
                .then((result) => setUsernameAvailable(result.available))
                .catch(() => setUsernameAvailable(null));
        }, 500);
        return () => clearTimeout(usernameTimer.current);
    }, [data.username]);

    useEffect(() => {
        if (!data.email) {
            setEmailAvailable(null);
            return;
        }
        clearTimeout(emailTimer.current);
        emailTimer.current = setTimeout(() => {
            fetch(`/api/check/email/${encodeURIComponent(data.email)}`)
                .then((res) => res.json())
                .then((result) => setEmailAvailable(result.available))
                .catch(() => setEmailAvailable(null));
        }, 500);
        return () => clearTimeout(emailTimer.current);
    }, [data.email]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setErrors(result.errors || {});
                return;
            }

            localStorage.setItem('token', result.token);
            router.visit('/home');
        } catch (error) {
            setErrors({ name: 'An error occurred. Please try again.' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="username" value="Username" />

                    <TextInput
                        id="username"
                        name="username"
                        value={data.username}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => {
                            setData({ ...data, username: e.target.value });
                            setErrors({ ...errors, username: undefined });
                        }}
                        required
                    />

                    {usernameAvailable === false && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">Username is already taken.</p>
                    )}
                    {usernameAvailable === true && (
                        <p className="mt-1 text-sm text-green-600 dark:text-green-400">Username is available.</p>
                    )}
                    <InputError message={errors.username ?? ''} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => {
                            setData({ ...data, email: e.target.value });
                            setErrors({ ...errors, email: undefined });
                        }}
                        required
                    />

                    {emailAvailable === false && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">Email is already taken.</p>
                    )}
                    {emailAvailable === true && (
                        <p className="mt-1 text-sm text-green-600 dark:text-green-400">Email is available.</p>
                    )}
                    <InputError message={errors.email ?? ''} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData({ ...data, password: e.target.value })}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData({ ...data, password_confirmation: e.target.value })
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4 flex items-center justify-end">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing || usernameAvailable === false || emailAvailable === false}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
