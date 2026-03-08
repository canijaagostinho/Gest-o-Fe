import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export function useFormAutoSave(key: string, delay = 3000) {
  const { watch } = useFormContext();
  const values = watch();

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`form-${key}`, JSON.stringify(values));
      // console.log('Form auto-saved')
    }, delay);

    return () => clearTimeout(timer);
  }, [values, key, delay]);
}
