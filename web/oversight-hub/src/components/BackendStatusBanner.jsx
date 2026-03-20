/**
 * BackendStatusBanner.jsx
 *
 * Shows a single, non-intrusive banner when the backend is unreachable.
 * Automatically dismisses when the backend comes back online.
 * Prevents the flood of individual error alerts during hot-reload restarts.
 */

import React, { useState, useEffect } from 'react';
import { serviceStatus } from '@/lib/serviceStatus';

const BackendStatusBanner = () => {
  const [offline, setOffline] = useState(serviceStatus.offline);

  useEffect(() => {
    const unsub = serviceStatus.subscribe(({ offline: isOffline }) => {
      setOffline(isOffline);
    });
    return unsub;
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: '#b45309',
        color: '#fff',
        textAlign: 'center',
        padding: '8px 16px',
        fontSize: '14px',
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}
    >
      ⚠️ Backend unreachable — retrying automatically&hellip;
    </div>
  );
};

export default BackendStatusBanner;
