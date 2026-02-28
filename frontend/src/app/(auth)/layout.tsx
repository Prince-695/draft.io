'use client';

import React from 'react';
import { PublicRoute } from '@/components/PublicRoute';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return <PublicRoute>{children}</PublicRoute>;
};

export default Layout;