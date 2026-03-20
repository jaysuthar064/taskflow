export const hasPasswordLogin = (user) =>
    user?.passwordConfigured === true ||
    (user?.passwordConfigured !== false && !user?.googleId);

export const getLoginMethods = (user) => ({
    password: hasPasswordLogin(user),
    google: Boolean(user?.googleId)
});

export const serializeUser = (user) => ({
    id: user?._id?.toString?.() || "",
    name: user?.name || "",
    email: user?.email || "",
    loginMethods: getLoginMethods(user),
    security: {
        twoFactorEnabled: Boolean(user?.twoFactorEnabled)
    }
});
