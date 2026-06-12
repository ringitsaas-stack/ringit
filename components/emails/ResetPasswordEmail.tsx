import React from 'react';

interface ResetPasswordEmailProps {
  fullName: string;
  resetUrl: string;
}

export const ResetPasswordEmail = ({ fullName, resetUrl }: ResetPasswordEmailProps) => {
  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#09090b', padding: '40px', color: '#fafafa' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '24px' }}>
          Ringit<span style={{ color: '#1248de' }}>.ai</span>
        </div>
        <h2 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '16px' }}>Hi {fullName},</h2>
        <p style={{ fontSize: '14px', color: '#a1a1aa', lineHeight: '1.6', marginBottom: '24px' }}>
          We received a request to reset the password associated with your account. Click the button below to specify a new password:
        </p>
        <div style={{ margin: '32px 0' }}>
          <a href={resetUrl} style={{ display: 'inline-block', backgroundColor: '#1248de', color: '#ffffff', fontSize: '14px', fontWeight: 'bold', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', boxShadow: '0 4px 12px rgba(18,72,222,0.3)' }}>
            Reset Password ⚡
          </a>
        </div>
        <hr style={{ border: 'none', borderTop: '1px dashed #27272a', margin: '32px 0' }} />
        <p style={{ fontSize: '11px', color: '#71717a' }}>
          If you did not request this email, you can safely ignore it.
        </p>
      </div>
    </div>
  );
};
