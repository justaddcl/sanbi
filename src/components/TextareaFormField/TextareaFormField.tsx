import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@components/ui/form";
import { Textarea } from "@components/ui/textarea";
import { useFormContext } from "react-hook-form";

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
        <FormItem className="">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
