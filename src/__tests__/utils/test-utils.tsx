/**
 * Custom test utilities for React Native Testing Library
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';

// Add providers here as needed (e.g., Navigation, Theme, etc.)
interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return <>{children}</>;
};

/**
 * Custom render function that wraps components with necessary providers
 */
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from React Native Testing Library
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };
