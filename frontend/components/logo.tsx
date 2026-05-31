import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function HIGLogo({ className = '', size = 32 }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
    >
      <rect width="100" height="100" rx="24" fill="#0F172A"/>
      <path d="M30 30H42V70H30V30Z" fill="#2E9EDE"/>
      <path d="M58 30H70V70H58V30Z" fill="#2E9EDE"/>
      <path d="M42 45H58V55H42V45Z" fill="#2E9EDE"/>
    </svg>
  );
}
