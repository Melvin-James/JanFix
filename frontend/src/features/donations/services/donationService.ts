import axiosInstance from "../../../api/axios";
import { ApiEndpoints } from "../../../shared/constants/apiEndpoints";
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
    ApiEndpoints.DONATIONS.CREATE_INTENT,
    data
  );
  return response.data.data;
};

export const retryDonationPayment = async (
  donationId: string
): Promise<RetryDonationResponse> => {
  const response = await axiosInstance.post<{ data: RetryDonationResponse }>(
    ApiEndpoints.DONATIONS.RETRY(donationId)
  );
  return response.data.data;
};

export const getIssueDonations = async (
  issueId: string,
  page = 1,
  pageSize = 10
): Promise<IssueDonationsResponse> => {
  const response = await axiosInstance.get<{ data: IssueDonationsResponse }>(
    ApiEndpoints.DONATIONS.ISSUE_DONATIONS(issueId),
    { params: { page, pageSize } }
  );
  return response.data.data;
};

export const getDonationStatus = async (
  donationId: string
): Promise<DonationStatusResponse> => {
  const response = await axiosInstance.get<{ data: DonationStatusResponse }>(
    ApiEndpoints.DONATIONS.STATUS(donationId)
  );
  return response.data.data;
};
