import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Search } from "lucide-react"; // ícone de lupa

const searchBoxVariants = cva(
  "flex items-center rounded-md border text-sm focus-within:ring-2 focus-within:ring-offset-2 transition-colors outline-none",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus-within:ring-primary",
        orange: "border-[#FF894E] text-[#FF894E] focus-within:ring-[#FF894E]"
      },
      size: {
        xs: "h-6 px-2 text-xs",   // menor altura
        sm: "h-8 px-2 text-sm",
        default: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base"
      },
      width: {
        default: "w-full",
        small: "w-48",
        medium: "w-64",
        large: "w-96"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "xs",
      width: "medium"
    }
  }
);

export interface SearchBoxProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof searchBoxVariants> {
  icon?: boolean;
}

const SearchBox = React.forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ className, variant, size, width, icon = true, ...props }, ref) => {
    return (
      <div className={cn(searchBoxVariants({ variant, size, width }), className)}>
        {icon && <Search className="mr-2 h-4 w-4 shrink-0" />}
        <input
          ref={ref}
          {...props}
          className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        />
      </div>
    );
  }
);

SearchBox.displayName = "SearchBox";
export { SearchBox, searchBoxVariants };
