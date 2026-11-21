import axiosInstance from "../../../api/axios";
import type {
  GetNotificationsResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
} from "../types/notificationTypes";

export const getNotifications = async (
  page: number = 1,
  pageSize: number = 10
): Promise<GetNotificationsResponse["data"]> => {
  const response = await axiosInstance.get<GetNotificationsResponse>(
    `/notifications?page=${page}&pageSize=${pageSize}`
  );
  return response.data.data;
};

export const markNotificationAsRead = async (
  id: string
): Promise<MarkAsReadResponse["data"]> => {
  const response = await axiosInstance.patch<MarkAsReadResponse>(
    `/notifications/${id}/read`
  );
  return response.data.data;
};

export const markAllNotificationsAsRead = async (): Promise<
  MarkAllAsReadResponse["data"]
> => {
  const response = await axiosInstance.patch<MarkAllAsReadResponse>(
    "/notifications/read-all"
  );
  return response.data.data;
};

