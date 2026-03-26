interface LoadingSpinnerProps {
  size?:  'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
};

const COLOR_CLASSES = {
  blue:  'border-blue-200 border-t-blue-600',
  white: 'border-white/30 border-t-white',
  gray:  'border-gray-200 border-t-gray-500',
};

export default function LoadingSpinner({ size = 'md', color = 'blue' }: LoadingSpinnerProps) {
  return (
    <div
      className={`rounded-full animate-spin ${SIZE_CLASSES[size]} ${COLOR_CLASSES[color]}`}
      role="status"
      aria-label="Loading"
    />
  );
}
