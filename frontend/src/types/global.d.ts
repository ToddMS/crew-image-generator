// Google OAuth types
interface GoogleAccounts {
  id: {
    initialize: (config: {
      client_id: string;
      callback: (response: { credential: string }) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
      use_fedcm_for_prompt?: boolean;
      ux_mode?: string;
    }) => void;
    renderButton: (
      element: HTMLElement,
      config: {
        theme?: string;
        size?: string;
        type?: string;
        text?: string;
        shape?: string;
        logo_alignment?: string;
        width?: string | number;
        locale?: string;
      }
    ) => void;
  };
}

interface Google {
  accounts: GoogleAccounts;
}

declare global {
  interface Window {
    google?: Google;
  }
}

export {};