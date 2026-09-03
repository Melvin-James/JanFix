import {
    useWatch,
    type Control,
    type UseFormRegister,
    type UseFormSetValue,
    type FieldErrors,
} from "react-hook-form";

import type { ProviderStep2FormData } from "../validations/providerStep2Schema";

interface WebsiteLinksFieldProps {
    control: Control<ProviderStep2FormData>;
    register: UseFormRegister<ProviderStep2FormData>;
    setValue: UseFormSetValue<ProviderStep2FormData>;
    errors: FieldErrors<ProviderStep2FormData>;
}

function getPlatform(url: string) {
    const value = url.toLowerCase();

    if (value.includes("instagram.com")) return "Instagram";
    if (value.includes("x.com") || value.includes("twitter.com")) return "X";
    if (value.includes("facebook.com")) return "Facebook";
    if (value.includes("linkedin.com")) return "LinkedIn";
    if (value.includes("youtube.com")) return "YouTube";
    if (value.includes("github.com")) return "Github";

    return "Website";
}

function getPlatformIcon(platform: string) {
    switch (platform) {
        case "Instagram":
            return "◎";

        case "X":
            return "𝕏";

        case "Facebook":
            return "f";

        case "LinkedIn":
            return "in";

        case "YouTube":
            return "▶";

        case "Github":
            return "⌘";

        default:
            return "🌐";
    }
}

function WebsiteLinksField({
    control,
    register,
    setValue,
    errors,
}: WebsiteLinksFieldProps) {

    const websiteLinks =
        useWatch({
            control,
            name: "websiteLinks",
        }) ?? [];

    const addLink = () => {
        if (websiteLinks.length >= 5) return;

        setValue(
            "websiteLinks",
            [...websiteLinks, ""],
            {
                shouldDirty: true,
            }
        );
    };

    const removeLink = (index: number) => {
        const updatedLinks = [...websiteLinks];

        updatedLinks.splice(index, 1);

        setValue(
            "websiteLinks",
            updatedLinks,
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        );
    };

    return (
        <div className="space-y-3">

            <div>
                <label className="block text-sm font-medium text-slate-700">
                    Website / Social Links
                </label>

                <p className="mt-1 text-sm text-slate-500">
                    Add your social media, portfolio,
                    website, or other relevant links.
                </p>
            </div>

            {websiteLinks.map((url, index) => {

                const platform =
                    getPlatform(url || "");

                const icon =
                    getPlatformIcon(platform);

                return (
                    <div
                        key={index}
                        className="flex items-start gap-2"
                    >

                        <div className="flex-1">

                            <div className="relative">

                                <input
                                    type="text"
                                    placeholder="https://..."
                                    {...register(
                                        `websiteLinks.${index}`
                                    )}
                                    className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-slate-300
                                        px-4
                                        py-3
                                        pr-12
                                        text-sm
                                        outline-none
                                        focus:border-blue-500
                                    "
                                />

                                <span
                                    title={platform}
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-lg
                                    "
                                >
                                    {icon}
                                </span>

                            </div>

                            {errors.websiteLinks?.[index]?.message && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.websiteLinks[index]?.message}
                                </p>
                            )}

                        </div>

                        <button
                            type="button"
                            onClick={() => removeLink(index)}
                            className="
                                pt-3
                                text-sm
                                text-red-500
                                hover:text-red-700
                            "
                        >
                            Remove
                        </button>

                    </div>
                );
            })}

            {websiteLinks.length < 5 && (
                <button
                    type="button"
                    onClick={addLink}
                    className="
                        text-sm
                        font-medium
                        text-blue-600
                        hover:text-blue-700
                    "
                >
                    + Add another link
                </button>
            )}

            <p className="text-xs text-slate-400">
                {websiteLinks.length}/5 links
            </p>

        </div>
    );
}

export default WebsiteLinksField;