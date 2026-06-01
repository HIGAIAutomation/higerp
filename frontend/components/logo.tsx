import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function HIGLogo({ className = '', size = 32 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="HIG AI Automation LLP"
      width={size}
      height={size}
      className={`rounded-lg object-cover flex-shrink-0 ${className}`}
      style={{ width: 'auto', height: 'auto' }}
      priority
    />
  );
}
