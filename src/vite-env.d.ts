/// <reference types="vite/client" />

import { ReactElement } from 'react';

declare global {
  namespace JSX {
    interface Element extends ReactElement<any, any> {}
  }
}
