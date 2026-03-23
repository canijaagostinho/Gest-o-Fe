import { cn } from "@/lib/utils";

interface AutoScalingAmountProps {
  amount: number;
  baseSize?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl";
  className?: string;
  showCurrency?: boolean;
  currency?: string;
  decimalSize?: "sm" | "md" | "lg" | "xl";
}

export function AutoScalingAmount({
  amount,
  baseSize = "3xl",
  className,
  showCurrency = true,
  currency = "MZN",
  decimalSize = "sm"
}: AutoScalingAmountProps) {
  const [integerPart, decimalPart] = amount.toFixed(2).split(".");
  const length = integerPart.length;

  // Auto-scaling logic based on length of integer part
  const getScaleClass = () => {
    const sizeMap: Record<string, string[]> = {
      "xl": ["text-xl", "text-lg", "text-base", "text-sm", "text-xs"],
      "2xl": ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm"],
      "3xl": ["text-3xl", "text-2xl", "text-xl", "text-lg", "text-base"],
      "4xl": ["text-4xl", "text-3xl", "text-2xl", "text-xl", "text-lg"],
      "5xl": ["text-5xl", "text-4xl", "text-3xl", "text-2xl", "text-xl"],
      "6xl": ["text-6xl", "text-5xl", "text-4xl", "text-3xl", "text-2xl"],
      "7xl": ["text-7xl", "text-6xl", "text-5xl", "text-4xl", "text-3xl"]
    };

    const sizes = sizeMap[baseSize] || [baseSize];
    
    if (length > 15) return sizes[4] || "text-xs";
    if (length > 12) return sizes[3] || "text-sm";
    if (length > 9) return sizes[2] || "text-base";
    if (length > 6) return sizes[1] || "text-lg";
    
    return sizes[0];
  };

  const getDecimalScaleClass = () => {
    if (length > 12) return "text-[10px]";
    if (length > 9) return "text-xs";
    if (length > 6) return "text-sm";
    return "text-lg";
  };

  const getCurrencyScaleClass = () => {
    if (length > 12) return "text-[10px]";
    if (length > 9) return "text-xs";
    if (length > 6) return "text-base";
    return "text-xl";
  };

  return (
    <div className={cn("flex items-baseline gap-2 min-w-0 transition-all duration-500 ease-in-out", className)}>
      {showCurrency && (
        <span className={cn(
            "font-black tracking-tighter shrink-0 opacity-70",
            getCurrencyScaleClass()
        )}>
          {currency}
        </span>
      )}
      <div className="flex items-baseline overflow-visible">
        <span className={cn("font-black tracking-tighter shrink-0", getScaleClass())}>
          {Number(integerPart).toLocaleString('pt-MZ')}
        </span>
        <span className={cn("font-black ml-1 shrink-0 opacity-50", getDecimalScaleClass())}>
          ,{decimalPart}
        </span>
      </div>
    </div>
  );
}
