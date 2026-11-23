import assert from "node:assert/strict";
import path from "node:path";
import mongoose, { Types } from "mongoose";
import dotenv from "dotenv";
import type Stripe from "stripe";

dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
dotenv.config();

import { IssueStatus } from "../domain/enums/IssueStatus.js";
import { IssueVisibility } from "../domain/enums/IssueVisibility.js";
import { ProposalFundingType } from "../domain/enums/ProposalFundingType.js";
import { DonationStatus } from "../domain/enums/DonationStatus.js";
import { PaymentProvider } from "../domain/enums/PaymentProvider.js";
import { Role } from "../domain/enums/Role.js";
import { AuthProvider } from "../domain/enums/AuthProvider.js";
import { AccountStatus } from "../domain/enums/AccountStatus.js";

import { IssueModel } from "../infrastructure/models/IssueModel.js";
import { UserModel } from "../infrastructure/models/UserModel.js";
import { CategoryModel } from "../infrastructure/models/CategoryModel.js";
import { DonationModel } from "../infrastructure/models/DonationModel.js";

import { IssueRepository } from "../infrastructure/repositories/IssueRepository.js";
import { UserRepository } from "../infrastructure/repositories/UserRepository.js";
import { DonationRepository } from "../infrastructure/repositories/DonationRepository.js";
import { StripeService, type CreatePaymentIntentParams } from "../infrastructure/services/StripeService.js";

import { CreateDonationPaymentIntentUseCase } from "../application/use-cases/donation/CreateDonationPaymentIntentUseCase.js";
import { HandleStripeWebhookUseCase } from "../application/use-cases/donation/HandleStripeWebhookUseCase.js";
import { GetIssueDonationsUseCase } from "../application/use-cases/donation/GetIssueDonationsUseCase.js";
import { GetDonationStatusUseCase } from "../application/use-cases/donation/GetDonationStatusUseCase.js";
import { RetryDonationPaymentUseCase } from "../application/use-cases/donation/RetryDonationPaymentUseCase.js";

class TestStripeService extends StripeService {
  private eventMap = new Map<string, Stripe.Event>();
  private paymentIntentsMap = new Map<string, Stripe.PaymentIntent>();

  override async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    const id = `pi_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const clientSecret = `${id}_secret_${Date.now()}`;

    const pi: Stripe.PaymentIntent = {
      id,
      object: "payment_intent",
      amount: params.amountPaise,
      currency: params.currency || "inr",
      status: "requires_payment_method",
      client_secret: clientSecret,
      metadata: params.metadata,
      created: Math.floor(Date.now() / 1000),
      livemode: false,
    } as unknown as Stripe.PaymentIntent;

    this.paymentIntentsMap.set(id, pi);
    return pi;
  }

  override async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    if (this.paymentIntentsMap.has(paymentIntentId)) {
      return this.paymentIntentsMap.get(paymentIntentId)!;
    }
    return {
      id: paymentIntentId,
      object: "payment_intent",
      amount: 10000,
      currency: "inr",
      status: "requires_payment_method",
      client_secret: `${paymentIntentId}_secret`,
      metadata: {},
      created: Math.floor(Date.now() / 1000),
      livemode: false,
    } as unknown as Stripe.PaymentIntent;
  }

  setPaymentIntentStatus(paymentIntentId: string, status: Stripe.PaymentIntent.Status) {
    const existing = this.paymentIntentsMap.get(paymentIntentId);
    if (existing) {
      existing.status = status;
    }
  }

  registerMockEvent(signature: string, event: Stripe.Event) {
    this.eventMap.set(signature, event);
  }

  override constructWebhookEvent(payload: Buffer | string, signature: string): Stripe.Event {
    if (this.eventMap.has(signature)) {
      return this.eventMap.get(signature)!;
    }
    try {
      const parsed = typeof payload === "string" ? JSON.parse(payload) : JSON.parse(payload.toString("utf8"));
      return parsed as Stripe.Event;
    } catch {
      return {
        id: `evt_test_${Date.now()}`,
        type: signature,
        data: { object: {} },
      } as unknown as Stripe.Event;
    }
  }
}

async function runStripeDonationTests() {
  console.log("=== JanFix Stripe Donation Lifecycle, Retries & Atomic Webhook Test ===");

  const mongoUri = process.env.MONGO_URI;
  assert(mongoUri, "MONGO_URI must be provided in .env");

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB.");

  await CategoryModel.init();
  await UserModel.init();
  await IssueModel.init();
  await DonationModel.init();

  const issueRepository = new IssueRepository();
  const userRepository = new UserRepository();
  const donationRepository = new DonationRepository();
  const stripeService = new TestStripeService();

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

  const retryDonationPaymentUseCase = new RetryDonationPaymentUseCase(
    donationRepository,
    issueRepository,
    stripeService
  );

  const getIssueDonationsUseCase = new GetIssueDonationsUseCase(donationRepository);
  const getDonationStatusUseCase = new GetDonationStatusUseCase(donationRepository);

  const createdUserIds: Types.ObjectId[] = [];
  const createdIssueIds: Types.ObjectId[] = [];
  const createdCategoryIds: Types.ObjectId[] = [];
  const createdDonationIds: Types.ObjectId[] = [];

  try {
    // -------------------------------------------------------------
    // Setup Mock Category & Users
    // -------------------------------------------------------------
    const categoryId = new Types.ObjectId();
    createdCategoryIds.push(categoryId);
    await CategoryModel.create({
      _id: categoryId,
      name: `Donation Civic Category ${Date.now()}`,
      description: "Test civic category description for donations",
      isActive: true,
    });

    const donor1Id = new Types.ObjectId();
    createdUserIds.push(donor1Id);
    await UserModel.create({
      _id: donor1Id,
      fullName: "Aarav Sharma",
      email: `donor1-${Date.now()}@example.com`,
      roles: [Role.USER],
      activeMode: "USER",
      isVerified: true,
      authProvider: AuthProvider.LOCAL,
      accountStatus: AccountStatus.ACTIVE,
    });

    const donor2Id = new Types.ObjectId();
    createdUserIds.push(donor2Id);
    await UserModel.create({
      _id: donor2Id,
      fullName: "Priya Patel",
      email: `donor2-${Date.now()}@example.com`,
      roles: [Role.USER],
      activeMode: "USER",
      isVerified: true,
      authProvider: AuthProvider.LOCAL,
      accountStatus: AccountStatus.ACTIVE,
    });

    // -------------------------------------------------------------
    // Setup Eligible Public Issue in FUNDRAISING status
    // -------------------------------------------------------------
    const issue1Id = new Types.ObjectId();
    createdIssueIds.push(issue1Id);
    const mockSelectedProposalId = new Types.ObjectId();

    await IssueModel.create({
      _id: issue1Id,
      createdBy: donor1Id,
      title: "Pothole repair and drainage restoration near Central Park",
      description: "Severe road damage causing waterlogging during monsoons.",
      category: categoryId,
      visibility: IssueVisibility.PUBLIC,
      status: IssueStatus.FUNDRAISING,
      location: {
        address: "MG Road, Sector 4",
        coordinates: { latitude: 12.9716, longitude: 77.5946 },
      },
      selectedProposalId: mockSelectedProposalId,
      proposalSelectedAt: new Date(),
      fundingSnapshot: {
        fundingType: ProposalFundingType.COMMUNITY_FUNDING,
        providerBudgetPaise: 950000,
        platformFeeRatePercent: 5,
        platformFeePaise: 50000,
        fundingTargetPaise: 1000000, // ₹10,000 Total Goal
        amountRaisedPaise: 0,
        selectedProposalId: mockSelectedProposalId,
        selectedAt: new Date(),
      },
    });

    console.log("✓ Test setup completed: Created Category, Users, and Fundraising Issue.");

    // -------------------------------------------------------------
    // Test 1: Validation Checks in CreateDonationPaymentIntentUseCase
    // -------------------------------------------------------------
    console.log("\n[Test 1] CreateDonationPaymentIntent validation rules");

    await assert.rejects(
      createPaymentIntentUseCase.execute(donor1Id.toString(), {
        issueId: issue1Id.toString(),
        amountPaise: 50,
      }),
      /Minimum donation amount is ₹1.00/,
      "Must reject donation amount less than 100 paise"
    );
    console.log("  ✓ Sub-rupee amount (< 100 paise) rejected with 400 Bad Request");

    // -------------------------------------------------------------
    // Test 2: Successful Donation Intent Creation (₹500 / 50,000 paise)
    // -------------------------------------------------------------
    console.log("\n[Test 2] Successful Donation PaymentIntent Creation (No clientSecret in DB)");
    const intentResult1 = await createPaymentIntentUseCase.execute(donor1Id.toString(), {
      issueId: issue1Id.toString(),
      amountPaise: 50000,
      isAnonymous: false,
      message: "Happy to support our neighborhood road repair!",
    });

    assert(intentResult1.donationId);
    assert(intentResult1.paymentIntentId);
    assert(intentResult1.clientSecret);
    createdDonationIds.push(new Types.ObjectId(intentResult1.donationId));

    // Verify DB record does NOT have stripeClientSecret
    const donationDoc1 = (await DonationModel.findById(intentResult1.donationId))?.toObject() as any;
    assert(donationDoc1, "Donation record must exist in MongoDB");
    assert.equal(donationDoc1.status, DonationStatus.PENDING);
    assert.equal(donationDoc1.stripePaymentIntentId, intentResult1.paymentIntentId);
    assert.equal(donationDoc1.stripeClientSecret, undefined, "stripeClientSecret MUST NOT be persisted in MongoDB");
    console.log("  ✓ Pending donation record created; stripeClientSecret is omitted from database persistence");

    // -------------------------------------------------------------
    // Test 3: Webhook Strict Validation Defenses
    // -------------------------------------------------------------
    console.log("\n[Test 3] Webhook Strict Payload Validation");

    // 3.1 Mismatched amount
    const mismatchedAmountEvent: Stripe.Event = {
      id: `evt_mismatch_amt_${Date.now()}`,
      object: "event",
      type: "payment_intent.succeeded",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: intentResult1.paymentIntentId,
          object: "payment_intent",
          amount: 999999, // tampered amount
          currency: "inr",
          status: "succeeded",
          metadata: {
            donationId: intentResult1.donationId,
            issueId: issue1Id.toString(),
          },
        } as unknown as Stripe.PaymentIntent,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      api_version: "2025-02-24.acacia",
    };
    stripeService.registerMockEvent("sig_mismatch_amt", mismatchedAmountEvent);
    await handleWebhookUseCase.execute(Buffer.from(JSON.stringify(mismatchedAmountEvent)), "sig_mismatch_amt");

    const checkDocAfterMismatch = await DonationModel.findById(intentResult1.donationId);
    assert.equal(checkDocAfterMismatch?.status, DonationStatus.PENDING, "Mismatched amount must not complete donation");
    console.log("  ✓ Webhook with mismatched amount was rejected without altering donation status");

    // 3.2 Mismatched issueId metadata
    const mismatchedIssueEvent: Stripe.Event = {
      id: `evt_mismatch_issue_${Date.now()}`,
      object: "event",
      type: "payment_intent.succeeded",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: intentResult1.paymentIntentId,
          object: "payment_intent",
          amount: 50000,
          currency: "inr",
          status: "succeeded",
          metadata: {
            donationId: intentResult1.donationId,
            issueId: new Types.ObjectId().toString(), // mismatched issue
          },
        } as unknown as Stripe.PaymentIntent,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      api_version: "2025-02-24.acacia",
    };
    stripeService.registerMockEvent("sig_mismatch_issue", mismatchedIssueEvent);
    await handleWebhookUseCase.execute(Buffer.from(JSON.stringify(mismatchedIssueEvent)), "sig_mismatch_issue");

    const checkDocAfterIssueMismatch = await DonationModel.findById(intentResult1.donationId);
    assert.equal(checkDocAfterIssueMismatch?.status, DonationStatus.PENDING, "Mismatched metadata must not complete donation");
    console.log("  ✓ Webhook with mismatched metadata was rejected without altering donation status");

    // -------------------------------------------------------------
    // Test 4: Webhook payment_intent.succeeded & Atomic Funding Update
    // -------------------------------------------------------------
    console.log("\n[Test 4] Atomic Webhook Processing with Transaction");
    const validSuccessEvent: Stripe.Event = {
      id: `evt_succ_${Date.now()}`,
      object: "event",
      type: "payment_intent.succeeded",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: intentResult1.paymentIntentId,
          object: "payment_intent",
          amount: 50000,
          currency: "inr",
          status: "succeeded",
          created: Math.floor(Date.now() / 1000),
          metadata: {
            donationId: intentResult1.donationId,
            issueId: issue1Id.toString(),
          },
        } as unknown as Stripe.PaymentIntent,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      api_version: "2025-02-24.acacia",
    };
    stripeService.registerMockEvent("sig_valid_success_1", validSuccessEvent);

    await handleWebhookUseCase.execute(Buffer.from(JSON.stringify(validSuccessEvent)), "sig_valid_success_1");

    const updatedDonation1 = await DonationModel.findById(intentResult1.donationId);
    assert.equal(updatedDonation1?.status, DonationStatus.SUCCEEDED);
    assert(updatedDonation1?.paidAt);

    const issueAfterDonation1 = await IssueModel.findById(issue1Id);
    assert.equal(issueAfterDonation1?.fundingSnapshot?.amountRaisedPaise, 50000);
    console.log("  ✓ Donation updated to SUCCEEDED and issue funding atomically incremented by 50,000 paise");

    // -------------------------------------------------------------
    // Test 5: Webhook Idempotency (Duplicate Delivery)
    // -------------------------------------------------------------
    console.log("\n[Test 5] Webhook Duplicate Delivery Idempotency");
    await handleWebhookUseCase.execute(Buffer.from(JSON.stringify(validSuccessEvent)), "sig_valid_success_1");

    const issueAfterDup = await IssueModel.findById(issue1Id);
    assert.equal(
      issueAfterDup?.fundingSnapshot?.amountRaisedPaise,
      50000,
      "Duplicate webhook must not increment funding a second time"
    );
    console.log("  ✓ Duplicate webhook event handled idempotently; issue funding was not re-incremented");

    // -------------------------------------------------------------
    // Test 6: Payment Retry Flow (RetryDonationPaymentUseCase)
    // -------------------------------------------------------------
    console.log("\n[Test 6] Secure Payment Retry Flow");

    // 6.1 Create a new donation for donor 1 that will fail/require retry
    const retryTestIntent = await createPaymentIntentUseCase.execute(donor1Id.toString(), {
      issueId: issue1Id.toString(),
      amountPaise: 75000, // ₹750
      isAnonymous: false,
    });
    createdDonationIds.push(new Types.ObjectId(retryTestIntent.donationId));

    // 6.2 Ownership check: Donor 2 cannot retry Donor 1's donation
    await assert.rejects(
      retryDonationPaymentUseCase.execute(retryTestIntent.donationId, donor2Id.toString()),
      /You are not authorized to retry this donation/,
      "Must reject unauthorized user attempting to retry another user's donation"
    );
    console.log("  ✓ Cross-user retry blocked with 403 Forbidden");

    // 6.3 Retry with requires_payment_method: Reuses existing PaymentIntent & returns client secret
    stripeService.setPaymentIntentStatus(retryTestIntent.paymentIntentId, "requires_payment_method");
    const retryResult1 = await retryDonationPaymentUseCase.execute(
      retryTestIntent.donationId,
      donor1Id.toString()
    );
    assert.equal(retryResult1.status, "READY_FOR_PAYMENT");
    assert.equal(retryResult1.paymentIntentId, retryTestIntent.paymentIntentId, "Must reuse existing PaymentIntent");
    assert(retryResult1.clientSecret);
    console.log("  ✓ requires_payment_method reuses existing PaymentIntent without creating duplicate");

    // 6.4 Retry with canceled status: Creates replacement PaymentIntent & associates with donation
    stripeService.setPaymentIntentStatus(retryTestIntent.paymentIntentId, "canceled");
    const retryResult2 = await retryDonationPaymentUseCase.execute(
      retryTestIntent.donationId,
      donor1Id.toString()
    );
    assert.equal(retryResult2.status, "READY_FOR_PAYMENT");
    assert.notEqual(
      retryResult2.paymentIntentId,
      retryTestIntent.paymentIntentId,
      "Must generate replacement PaymentIntent ID when previous was canceled"
    );
    assert(retryResult2.clientSecret);

    // Verify donation record in DB now points to replacement PaymentIntent
    const updatedDocAfterReplace = await DonationModel.findById(retryTestIntent.donationId);
    assert.equal(updatedDocAfterReplace?.stripePaymentIntentId, retryResult2.paymentIntentId);
    console.log("  ✓ Canceled status creates replacement PaymentIntent and updates stripePaymentIntentId on existing donation");

    // 6.5 Stale event defense: Ensure old canceled PaymentIntent webhook CANNOT complete donation
    const oldCanceledEvent: Stripe.Event = {
      id: `evt_old_canceled_${Date.now()}`,
      object: "event",
      type: "payment_intent.succeeded",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: retryTestIntent.paymentIntentId, // OLD ID!
          object: "payment_intent",
          amount: 75000,
          currency: "inr",
          status: "succeeded",
          metadata: {
            donationId: retryTestIntent.donationId,
            issueId: issue1Id.toString(),
          },
        } as unknown as Stripe.PaymentIntent,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      api_version: "2025-02-24.acacia",
    };
    stripeService.registerMockEvent("sig_old_canceled", oldCanceledEvent);
    await handleWebhookUseCase.execute(Buffer.from(JSON.stringify(oldCanceledEvent)), "sig_old_canceled");

    const checkDocAfterOldEvent = await DonationModel.findById(retryTestIntent.donationId);
    assert.equal(
      checkDocAfterOldEvent?.status,
      DonationStatus.PENDING,
      "Old replaced PaymentIntent must not transition donation to SUCCEEDED"
    );
    console.log("  ✓ Stale webhook from replaced PaymentIntent correctly rejected");

    // 6.6 Valid webhook for new replacement PaymentIntent completes donation
    const newReplacementEvent: Stripe.Event = {
      id: `evt_new_rep_${Date.now()}`,
      object: "event",
      type: "payment_intent.succeeded",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: retryResult2.paymentIntentId!,
          object: "payment_intent",
          amount: 75000,
          currency: "inr",
          status: "succeeded",
          metadata: {
            donationId: retryTestIntent.donationId,
            issueId: issue1Id.toString(),
          },
        } as unknown as Stripe.PaymentIntent,
      },
      livemode: false,
      pending_webhooks: 0,
      request: null,
      api_version: "2025-02-24.acacia",
    };
    stripeService.registerMockEvent("sig_new_rep", newReplacementEvent);
    await handleWebhookUseCase.execute(Buffer.from(JSON.stringify(newReplacementEvent)), "sig_new_rep");

    const checkDocAfterNewRep = await DonationModel.findById(retryTestIntent.donationId);
    assert.equal(checkDocAfterNewRep?.status, DonationStatus.SUCCEEDED);

    const issueAfterRetryDonation = await IssueModel.findById(issue1Id);
    assert.equal(
      issueAfterRetryDonation?.fundingSnapshot?.amountRaisedPaise,
      125000, // 50,000 + 75,000 = 125,000
      "amountRaisedPaise must include retried donation"
    );
    console.log("  ✓ Replacement PaymentIntent completed donation and incremented total funding to 125,000 paise");

    // 6.7 Retry already succeeded donation returns ALREADY_SUCCEEDED without creating another PI
    const retryResultSucceeded = await retryDonationPaymentUseCase.execute(
      retryTestIntent.donationId,
      donor1Id.toString()
    );
    assert.equal(retryResultSucceeded.status, "ALREADY_SUCCEEDED");
    console.log("  ✓ Retrying already succeeded donation returns ALREADY_SUCCEEDED");

    // -------------------------------------------------------------
    // Test 7: Public Contributors Query & Anonymization
    // -------------------------------------------------------------
    console.log("\n[Test 7] Public Contributors Query");
    const contributorsData = await getIssueDonationsUseCase.execute(issue1Id.toString(), 1, 10);
    assert.equal(contributorsData.totalDonors, 2);
    assert.equal(contributorsData.totalAmountRaisedPaise, 125000);
    console.log("  ✓ Public contributors listing verified");

    console.log("\n=======================================================");
    console.log("🎉 ALL STRIPE DONATION LIFECYCLE TESTS PASSED PERFECTLY!");
    console.log("=======================================================\n");
  } finally {
    console.log("Cleaning up test records from database...");
    if (createdDonationIds.length > 0) {
      await DonationModel.deleteMany({ _id: { $in: createdDonationIds } });
    }
    if (createdIssueIds.length > 0) {
      await IssueModel.deleteMany({ _id: { $in: createdIssueIds } });
    }
    if (createdUserIds.length > 0) {
      await UserModel.deleteMany({ _id: { $in: createdUserIds } });
    }
    if (createdCategoryIds.length > 0) {
      await CategoryModel.deleteMany({ _id: { $in: createdCategoryIds } });
    }

    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
}

runStripeDonationTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
