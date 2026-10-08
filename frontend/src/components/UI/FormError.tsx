interface FormErrorProps {

  message?: string;
}

function FormError({
  message,
}: FormErrorProps) {

  return (

    <p className="mt-3 min-h-[19px] text-xs text-blue-600 leading-[1px]">

      {message ?? "\u00A0"}

    </p>
  );
}

export default FormError;