type AuthTokenProvider = () => Promise<string | null | undefined> | string | null | undefined;

let authTokenProvider: AuthTokenProvider | null = null;

export const setAuthTokenProvider = (provider: AuthTokenProvider | null) => {
  authTokenProvider = provider;
};

export const getAuthToken = async (): Promise<string | null> => {
  if (!authTokenProvider) {
    return null;
  }

  const token = await authTokenProvider();
  return token ?? null;
};