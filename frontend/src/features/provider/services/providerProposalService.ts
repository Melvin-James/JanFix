import axiosInstance from "../../../api/axios";
import type {
  Proposal,
  SubmitProposalPayload,
  UpdateProposalPayload,
  ProposalResponse,
  GetProposalResponse,
  WithdrawProposalResponse,
} from "../types/proposalTypes";

export const submitProposal = async (
  issueId: string,
  payload: SubmitProposalPayload
): Promise<ProposalResponse> => {
  const response = await axiosInstance.post<ProposalResponse>(
    `/provider/issues/${issueId}/proposals`,
    payload
  );
  return response.data;
};

export const getMyProposal = async (
  issueId: string
): Promise<Proposal | null> => {
  const response = await axiosInstance.get<GetProposalResponse>(
    `/provider/issues/${issueId}/proposals/me`
  );
  return response.data.proposal;
};

export const updateProposal = async (
  issueId: string,
  payload: UpdateProposalPayload
): Promise<ProposalResponse> => {
  const response = await axiosInstance.put<ProposalResponse>(
    `/provider/issues/${issueId}/proposals/me`,
    payload
  );
  return response.data;
};

export const withdrawProposal = async (
  issueId: string
): Promise<WithdrawProposalResponse> => {
  const response = await axiosInstance.delete<WithdrawProposalResponse>(
    `/provider/issues/${issueId}/proposals/me`
  );
  return response.data;
};

