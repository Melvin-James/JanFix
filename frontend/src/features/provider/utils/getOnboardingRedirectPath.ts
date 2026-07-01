export const getOnboardingRedirectPath =
  (status: string) => {

    switch (status) {

      case "STEP_1":
        return "/provider/onboarding/step-1";

      case "STEP_2":
        return "/provider/onboarding/step-2";

      case "STEP_3":
        return "/provider/onboarding/review";

      case "COMPLETED":
        return "/provider/welcome";

      default:
        return "/home";
    }
};