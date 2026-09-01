interface ProviderInfoRowProps {

    label: string;

    value?: React.ReactNode;
}

function ProviderInfoRow({

    label,

    value,

}: ProviderInfoRowProps) {

    return (

        <div
            className="
                flex
                justify-between
                border-b
                border-slate-200
                py-4
            "
        >

            <span
                className="
                    text-sm
                    font-medium
                    text-slate-600
                "
            >

                {label}

            </span>

            <span
                className="
                    text-sm
                    text-slate-900
                "
            >

                {value || "-"}

            </span>

        </div>
    );
}

export default ProviderInfoRow;