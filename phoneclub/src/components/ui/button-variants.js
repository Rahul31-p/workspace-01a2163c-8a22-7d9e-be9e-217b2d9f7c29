import { cva } from 'class-variance-authority'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover',
        secondary: 'bg-surface-container text-foreground hover:bg-surface-high',
        outline: 'border border-border bg-surface text-foreground shadow-sm hover:bg-surface-low',
        ghost: 'text-muted-foreground hover:bg-surface-container hover:text-foreground',
        success: 'bg-success text-success-foreground shadow-sm hover:bg-success-hover',
        warning: 'bg-warning text-warning-foreground shadow-sm hover:bg-warning-hover',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive-hover',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
