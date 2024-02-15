'use client';

import Image from 'next/image';
import { memo } from 'react';

import { navElements } from '@/constants';
import { ActiveElement, NavbarProps } from '@/types/type';

import ActiveUsers from './users/ActiveUsers';

const Navbar = ({ activeElement }: NavbarProps) => {
  // const isActive = (value: string | Array<ActiveElement>) =>
  //   (activeElement && activeElement.value === value) ||
  //   (Array.isArray(value) &&
  //     value.some(val => val?.value === activeElement?.value));

  return (
    <nav className="flex select-none items-center justify-between gap-4 bg-primary-black px-5 text-white">
      <Image src="/assets/logo.png" alt="FigPro Logo" width={45} height={45} />
      <ActiveUsers />
    </nav>
  );
};

export default memo(
  Navbar,
  (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement
);
