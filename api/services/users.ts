import { apiClient } from "../client";

export interface PushTokenRegistrationPayload {
  pushToken: string;
  clerkUserId: string;
}

export interface RegisterPushTokenParams {
  pushToken: string;
  clerkUserId: string;
}

export const usersService = {
  registerPushToken: async ({
    pushToken,
    clerkUserId,
  }: RegisterPushTokenParams): Promise<void> => {
    await apiClient.post<void>(
      "/api/v1/notifications/push-token",
      { pushToken, clerkUserId } satisfies PushTokenRegistrationPayload,
    );
  },
};