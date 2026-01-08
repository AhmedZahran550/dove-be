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
    },
    FALLBACK_LANGUAGE: 'ar',
  };
};
