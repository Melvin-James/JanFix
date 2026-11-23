import axiosInstance from "../../../api/axios";
import type {
  CreateDonationIntentRequest,
  CreateDonationIntentResponse,
  RetryDonationResponse,
  IssueDonationsResponse,
  DonationStatusResponse,
} from "../types/donationTypes";

export const createDonationIntent = async (
  data: CreateDonationIntentRequest
): Promise<CreateDonationIntentResponse> => {
  const response = await axiosInstance.post<{ data: CreateDonationIntentResponse }>(
    "/donations/create-intent",
    data
  );
  return response.data.data;
};

export const retryDonationPayment = async (
  donationId: string
): Promise<RetryDonationResponse> => {
  const response = await axiosInstance.post<{ data: RetryDonationResponse }>(
    `/donations/${donationId}/retry`
  );
  return response.data.data;
};

export const getIssueDonations = async (
  issueId: string,
  page = 1,
  pageSize = 10
): Promise<IssueDonationsResponse> => {
  const response = await axiosInstance.get<{ data: IssueDonationsResponse }>(
    `/donations/issues/${issueId}`,
    { params: { page, pageSize } }
  );
  return response.data.data;
};

export const getDonationStatus = async (
  donationId: string
): Promise<DonationStatusResponse> => {
  const response = await axiosInstance.get<{ data: DonationStatusResponse }>(
    `/donations/${donationId}/status`
  );
  return response.data.data;
};
