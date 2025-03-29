import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import { Textarea } from "@components/ui/textarea";
import { useFormContext } from "react-hook-form";
import unescapeHTML from "validator/es/lib/unescape";

type TextareaFormFieldProps = {
  name: string;
  label: string;
};

export const TextareaFormField: React.FC<TextareaFormFieldProps> = ({
  name,
  label,
}) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              value={unescapeHTML((field.value as string) ?? "")}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
