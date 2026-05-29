import { apiClient } from "../client";

export interface PushTokenRegistrationPayload {
  pushToken: string;
  clerkUserId: string;
}

export interface RegisterPushTokenParams {
  accessToken: string;
  pushToken: string;
  clerkUserId: string;
}

export const usersService = {
  registerPushToken: async ({
    accessToken,
    pushToken,
    clerkUserId,
  }: RegisterPushTokenParams): Promise<void> => {
    await apiClient.post<void>(
      "/api/v1/notifications/push-token",
      { pushToken, clerkUserId } satisfies PushTokenRegistrationPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
  },
};