import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, useForm } from "@inertiajs/react";
import AuthCard from "@/Layouts/AuthCard";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <GuestLayout>
            <Head title="Mot de passe oublié" />

            <AuthCard
                title="Mot de passe oublié ?"
                description="Entrez votre adresse e-mail et nous vous enverrons un lien pour réinitialiser votre mot de passe."
            >
                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <InputLabel htmlFor="email" value="Adresse e-mail" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="flex justify-center">
                        <PrimaryButton
                            className="w-full max-w-xs bg-[#0F8AB1] hover:bg-[#0d7494] text-white py-3 rounded-md font-semibold flex justify-center"
                            disabled={processing}
                        >
                            Réinitialiser
                        </PrimaryButton>
                    </div>
                </form>
            </AuthCard>
        </GuestLayout>
    );
}
