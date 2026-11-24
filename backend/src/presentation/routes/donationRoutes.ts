import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.ts";
import validate from "../middlewares/validate.ts";
import { createDonationIntentSchema } from "../../application/dto/donation/CreateDonationIntentDTO.ts";
import { DonationRepository } from "../../infrastructure/repositories/DonationRepository.ts";
import { IssueRepository } from "../../infrastructure/repositories/IssueRepository.ts";
import { UserRepository } from "../../infrastructure/repositories/UserRepository.ts";
import { StripeService } from "../../infrastructure/services/StripeService.ts";
import { CreateDonationPaymentIntentUseCase } from "../../application/use-cases/donation/CreateDonationPaymentIntentUseCase.ts";
import { HandleStripeWebhookUseCase } from "../../application/use-cases/donation/HandleStripeWebhookUseCase.ts";
import { GetIssueDonationsUseCase } from "../../application/use-cases/donation/GetIssueDonationsUseCase.ts";
import { GetDonationStatusUseCase } from "../../application/use-cases/donation/GetDonationStatusUseCase.ts";
import { RetryDonationPaymentUseCase } from "../../application/use-cases/donation/RetryDonationPaymentUseCase.ts";
import { DonationController } from "../controllers/donation/DonationController.ts";
import { ApiEndpoints } from "../../shared/constants/apiEndpoints.ts";

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
router.post(
  ApiEndpoints.DONATIONS.CREATE_INTENT,
  authenticate,
  validate(createDonationIntentSchema),
  donationController.createPaymentIntent
);

// Public route: Get donations for an issue
router.get(ApiEndpoints.DONATIONS.ISSUE_DONATIONS, donationController.getIssueDonations);

// Authenticated route: Get single donation status
router.get(ApiEndpoints.DONATIONS.STATUS, authenticate, donationController.getDonationStatus);

// Authenticated route: Retry donation payment
router.post(ApiEndpoints.DONATIONS.RETRY, authenticate, donationController.retryPayment);

export default router;
