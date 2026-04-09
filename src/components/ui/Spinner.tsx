import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  label?: string;
}

const sizeMap = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };

export const Spinner = ({ size = "md", color = "text-current", label }: SpinnerProps) => {
  if (label) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={`animate-spin ${sizeMap[size]} ${color}`} />
        <p className="text-sm text-text-muted">{label}</p>
      </div>
    );
  }
  return <Loader2 className={`animate-spin ${sizeMap[size]} ${color}`} />;
};
