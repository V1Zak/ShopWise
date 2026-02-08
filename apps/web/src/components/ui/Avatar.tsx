interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' };

export function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  if (imageUrl) {
    return <img src={imageUrl} alt={name} className={`rounded-full object-cover ${sizeMap[size]}`} />;
  }

  return (
    <div className={`rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-background-dark font-bold ${sizeMap[size]}`}>
      {initials}
    </div>
  );
}
