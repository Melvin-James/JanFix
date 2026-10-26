import { RejectReasonModal, type RejectReasonModalProps } from "../../../components/UI/RejectReasonModal";

export type RejectApplicationModalProps = RejectReasonModalProps;

export function RejectApplicationModal(props: RejectApplicationModalProps) {
  return (
    <RejectReasonModal
      title="Reject Provider Application"
      subtitle="Provide a reason for rejecting this application."
      placeholder="Explain why this application is being rejected..."
      {...props}
    />
  );
}

export default RejectApplicationModal;
