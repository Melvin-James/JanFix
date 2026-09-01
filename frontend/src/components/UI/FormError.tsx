interface FormErrorProps {

  message?: string;
}

function FormError({
  message,
}: FormErrorProps) {

  return (

    <p className="mt-1 min-h-[18px] text-xs text-red-500 leading-[18px]">

      {message ?? "\u00A0"}

    </p>
  );
}

export default FormError;