'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/styles/animatedSubmitButton.css';

type Props = {
  children?: React.ReactNode;
  className?: string;
  href?: string;
};

const AnimatedSubmitButton = ({
  children = 'Navigate',
  className = '',
  href = '/notes',
}: Props) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = () => {
    if (!isNavigating && href) {
      setIsNavigating(true);
      router.push(href);
    }
  };

  return (
    <div
      className={`submitBtn ${className}`}
      onClick={handleClick}
      style={
        isNavigating
          ? {
              backgroundColor: '#0f172a',
              color: '#ffffff',
            }
          : undefined
      }
    >
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      {isNavigating ? (
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
      ) : (
        children
      )}
    </div>
  );
};

export default AnimatedSubmitButton;
