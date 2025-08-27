import nodemailer from 'nodemailer';

export function createTransporter() {
  // Google Workspace SMTP configuration
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.GOOGLE_WORKSPACE_EMAIL,
      pass: process.env.GOOGLE_WORKSPACE_APP_PASSWORD, // App-specific password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Alternative configuration for OAuth2 (more secure)
export function createOAuth2Transporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GOOGLE_WORKSPACE_EMAIL,
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
    },
  });
}