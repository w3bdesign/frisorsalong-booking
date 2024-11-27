export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}
