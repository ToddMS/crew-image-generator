/// <reference types="vite/client" />

import { ReactElement } from 'react';

declare global {
  namespace JSX {
    interface Element extends ReactElement<unknown, string | React.JSXElementConstructor<unknown>> {
      // Adding explicit members to avoid empty interface warning
      type?: string;
    }
  }
}
