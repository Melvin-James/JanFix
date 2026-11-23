import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { DonationRepository } from "../../infrastructure/repositories/DonationRepository.js";
import { IssueRepository } from "../../infrastructure/repositories/IssueRepository.js";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.js";
import { StripeService } from "../../infrastructure/services/StripeService.js";
import { CreateDonationPaymentIntentUseCase } from "../../application/use-cases/donation/CreateDonationPaymentIntentUseCase.js";
import { HandleStripeWebhookUseCase } from "../../application/use-cases/donation/HandleStripeWebhookUseCase.js";
import { GetIssueDonationsUseCase } from "../../application/use-cases/donation/GetIssueDonationsUseCase.js";
import { GetDonationStatusUseCase } from "../../application/use-cases/donation/GetDonationStatusUseCase.js";
import { RetryDonationPaymentUseCase } from "../../application/use-cases/donation/RetryDonationPaymentUseCase.js";
import { DonationController } from "../controllers/donation/DonationController.js";
import { ApiEndpoints } from "../../shared/constants/apiEndpoints.js";

// Instantiations for DI
const donationRepository = new DonationRepository();
const issueRepository = new IssueRepository();
const userRepository = new UserRepository();
const stripeService = new StripeService();

const createPaymentIntentUseCase = new CreateDonationPaymentIntentUseCase(
  issueRepository,
  userRepository,
  donationRepository,
  stripeService
);

const handleWebhookUseCase = new HandleStripeWebhookUseCase(
  donationRepository,
  issueRepository,
  stripeService
);

const getIssueDonationsUseCase = new GetIssueDonationsUseCase(donationRepository);

const getDonationStatusUseCase = new GetDonationStatusUseCase(donationRepository);

const retryDonationPaymentUseCase = new RetryDonationPaymentUseCase(
  donationRepository,
  issueRepository,
  stripeService
);

export const donationController = new DonationController(
  createPaymentIntentUseCase,
  handleWebhookUseCase,
  getIssueDonationsUseCase,
  getDonationStatusUseCase,
  retryDonationPaymentUseCase
);

const router = Router();

// Authenticated route: Create Stripe PaymentIntent
router.post(ApiEndpoints.DONATIONS.CREATE_INTENT, authenticate, donationController.createPaymentIntent);

// Public route: Get donations for an issue
router.get(ApiEndpoints.DONATIONS.ISSUE_DONATIONS, donationController.getIssueDonations);

// Authenticated route: Get single donation status
router.get(ApiEndpoints.DONATIONS.STATUS, authenticate, donationController.getDonationStatus);

// Authenticated route: Retry donation payment
router.post(ApiEndpoints.DONATIONS.RETRY, authenticate, donationController.retryPayment);

export default router;
