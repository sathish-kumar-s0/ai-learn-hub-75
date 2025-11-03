import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const ProgressBar = ({
  value,
  max = 100,
  showLabel = true,
  label,
  className,
  size = "md",
}: ProgressBarProps) => {
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{label || "Progress"}</span>
          <span className="font-medium">{percentage}%</span>
        </div>
      )}
      <Progress value={percentage} className={sizeClasses[size]} />
    </div>
  );
};
