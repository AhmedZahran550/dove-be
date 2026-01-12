export const baseConfig = () => {
  return {
    NODE_ENV: process.env.NODE_ENV,
    port: parseInt(process.env.PORT || '5000', 10),
    jwt: {
      accessToken: {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
      },
      refreshToken: {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      },
      resetToken: {
        secret: process.env.JWT_RESET_SECRET,
        expiresIn: process.env.JWT_RESET_EXPIRES_IN,
      },
      verificationToken: {
        secret:
          process.env.JWT_VERIFICATION_SECRET || process.env.JWT_ACCESS_SECRET,
        expiresIn: '24h',
      },
      invitationToken: {
        secret:
          process.env.JWT_INVITATION_SECRET || process.env.JWT_ACCESS_SECRET,
        expiresIn: '7d',
      },
    },
    FALLBACK_LANGUAGE: 'ar',
  };
};
