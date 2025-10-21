'use client';

interface OptionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  variant: 'primary' | 'secondary';
  onClick?: () => void;
}

export default function OptionCard({ title, subtitle, icon, variant, onClick }: OptionCardProps) {
  const baseClasses = "group relative overflow-hidden rounded-2xl p-4 lg:p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl";
  
  const variantClasses = {
    primary: "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25",
    secondary: "bg-white border border-gray-200 text-gray-700 shadow-lg hover:shadow-xl"
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {/* Background decoration for primary variant */}
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
      
      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Icon */}
        <div className={`text-4xl lg:text-6xl mb-4 lg:mb-6 transition-transform duration-300 group-hover:scale-110 ${
          variant === 'primary' ? 'filter drop-shadow-lg' : ''
        }`}>
          {icon}
        </div>
        
        {/* Title */}
        <h3 className={`text-lg lg:text-2xl font-bold mb-2 lg:mb-3 ${
          variant === 'primary' ? 'text-white' : 'text-gray-800'
        }`}>
          {title}
        </h3>
        
        {/* Subtitle */}
        <p className={`text-sm lg:text-lg ${
          variant === 'primary' ? 'text-blue-100' : 'text-gray-600'
        }`}>
          {subtitle}
        </p>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
    </div>
  );
}



