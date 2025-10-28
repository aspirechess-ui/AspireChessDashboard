import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Input,
  Field,
  Alert,
  Separator,
  PinInput,
  InputGroup,
  IconButton,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { useColorMode } from "../../components/ui/color-mode";
import {
  MdMail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdSend,
  MdCheck,
  MdInfo,
  MdCheckCircle,
  MdRefresh,
  MdAccessTime,
  MdTimer,
} from "react-icons/md";
import authService from "../../services/auth";

const AccountSettings = () => {
  const { colorMode } = useColorMode();
  const [alert, setAlert] = useState(null); // For success/error alerts

  // Custom alert function
  const showNotification = (title, description, status) => {
    setAlert({
      type: status,
      title,
      description,
    });
    setTimeout(
      () => setAlert(null),
      status === "error" ? 5000 : status === "info" ? 3000 : 4000
    );
  };

  // Email Change State
  const [emailData, setEmailData] = useState({
    newEmail: "",
  });
  const [emailVerificationCode, setEmailVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [emailStep, setEmailStep] = useState("input"); // input, verify, confirmed, success
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResendLoading, setEmailResendLoading] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [emailAlert, setEmailAlert] = useState(null);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Forgot Password State
  const [forgotPasswordData, setForgotPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [forgotPasswordVerificationCode, setForgotPasswordVerificationCode] =
    useState(["", "", "", "", "", ""]);
  const [forgotPasswordStep, setForgotPasswordStep] = useState("input"); // input, verify, confirmed, reset
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordResendLoading, setForgotPasswordResendLoading] =
    useState(false);
  const [forgotPasswordCountdown, setForgotPasswordCountdown] = useState(0);
  const [forgotPasswordAlert, setForgotPasswordAlert] = useState(null);
  const [showForgotPasswords, setShowForgotPasswords] = useState({
    new: false,
    confirm: false,
  });

  // Custom alert function for section-specific alerts
  const showEmailNotification = (title, description, status) => {
    setEmailAlert({ type: status, title, description });
    setTimeout(
      () => setEmailAlert(null),
      status === "error" ? 5000 : status === "info" ? 3000 : 4000
    );
  };

  const showForgotPasswordNotification = (title, description, status) => {
    setForgotPasswordAlert({ type: status, title, description });
    setTimeout(
      () => setForgotPasswordAlert(null),
      status === "error" ? 5000 : status === "info" ? 3000 : 4000
    );
  };

  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (emailCountdown > 0) {
      interval = setInterval(() => {
        setEmailCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailCountdown]);

  useEffect(() => {
    let interval;
    if (forgotPasswordCountdown > 0) {
      interval = setInterval(() => {
        setForgotPasswordCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [forgotPasswordCountdown]);

  // Email Change Functions
  const handleEmailChange = async () => {
    if (!emailData.newEmail.trim()) {
      showEmailNotification(
        "Error",
        "Please enter a new email address",
        "error"
      );
      return;
    }

    setEmailLoading(true);
    showEmailNotification(
      "Sending Email...",
      "Please wait while we send the verification code to your new email address. This may take a few moments.",
      "info"
    );

    try {
      await authService.requestEmailChange(emailData.newEmail);
      setEmailStep("verify");
      setEmailCountdown(60); // 1 minute countdown
      showEmailNotification(
        "Verification Code Sent",
        "Please check your new email for the verification code. It may take a few minutes to arrive.",
        "success"
      );
    } catch (error) {
      showEmailNotification(
        "Error",
        error.message || "Failed to send verification code",
        "error"
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleEmailResend = async () => {
    setEmailResendLoading(true);
    setEmailCountdown(60); // Immediately start countdown to prevent spam
    showEmailNotification(
      "Resending Code...",
      "Please wait while we resend the verification code.",
      "info"
    );

    try {
      await authService.requestEmailChange(emailData.newEmail);
      showEmailNotification(
        "Code Resent",
        "A new verification code has been sent to your email address.",
        "success"
      );
    } catch (error) {
      showEmailNotification(
        "Error",
        error.message || "Failed to resend verification code",
        "error"
      );
      // Reset countdown if there was an error
      setEmailCountdown(0);
    } finally {
      setEmailResendLoading(false);
    }
  };

  const handleEmailVerification = async () => {
    const codeString = emailVerificationCode.join("");
    if (!codeString.trim()) {
      showEmailNotification(
        "Error",
        "Please enter the verification code",
        "error"
      );
      return;
    }

    setEmailLoading(true);
    try {
      // Just validate the format and move to confirmed step
      // The actual verification will happen in the confirmation step
      setEmailStep("confirmed");
      showEmailNotification(
        "Ready to Apply Changes",
        "Click 'Apply Changes' to complete the email update.",
        "success"
      );
    } catch (error) {
      showEmailNotification(
        "Error",
        error.message || "Invalid verification code",
        "error"
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleForgotPasswordVerification = async () => {
    const codeString = forgotPasswordVerificationCode.join("");
    if (!codeString.trim()) {
      showForgotPasswordNotification(
        "Error",
        "Please enter the verification code",
        "error"
      );
      return;
    }

    setForgotPasswordLoading(true);
    try {
      // Verify the PIN without resetting password
      await authService.verifyForgotPasswordCode(codeString);

      // If verification is successful, move to reset step
      setForgotPasswordStep("reset");
      showForgotPasswordNotification(
        "PIN Verified Successfully",
        "Your verification code is correct. Please set your new password.",
        "success"
      );
    } catch (error) {
      showForgotPasswordNotification(
        "Error",
        error.message || "Invalid verification code",
        "error"
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleEmailChangeConfirm = async () => {
    setEmailLoading(true);
    try {
      // Apply the email change - this does the actual verification and update
      const codeString = emailVerificationCode.join("");
      const response = await authService.verifyEmailChange(codeString);
      
      // Refresh user data to get updated email
      await authService.verifyToken();
      
      setEmailStep("success");
      showEmailNotification(
        "Email Updated Successfully",
        `Your email address has been updated to ${response.newEmail || emailData.newEmail}`,
        "success"
      );

      // Reset form after success
      setTimeout(() => {
        setEmailData({ newEmail: "" });
        setEmailVerificationCode(["", "", "", "", "", ""]);
        setEmailStep("input");
        setEmailCountdown(0);
      }, 3000);
    } catch (error) {
      showEmailNotification(
        "Error",
        error.message || "Failed to update email address",
        "error"
      );
    } finally {
      setEmailLoading(false);
    }
  };

  // Password Change Functions
  const handlePasswordChange = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      showNotification("Error", "Please fill in all password fields", "error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification("Error", "New passwords do not match", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showNotification(
        "Error",
        "New password must be at least 6 characters long",
        "error"
      );
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      showNotification(
        "Password Updated",
        "Your password has been changed successfully",
        "success"
      );

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      showNotification(
        "Error",
        error.message || "Failed to change password",
        "error"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Forgot Password Functions
  const handleForgotPasswordRequest = async () => {
    setForgotPasswordLoading(true);
    showForgotPasswordNotification(
      "Sending Reset Code...",
      "Please wait while we send the password reset code to your email address. This may take a few moments.",
      "info"
    );

    try {
      await authService.requestForgotPasswordCode();
      setForgotPasswordStep("verify");
      setForgotPasswordCountdown(60); // 1 minute countdown
      showForgotPasswordNotification(
        "Reset Code Sent",
        "Please check your email for the password reset code. It may take a few minutes to arrive.",
        "success"
      );
    } catch (error) {
      showForgotPasswordNotification(
        "Error",
        error.message || "Failed to send reset code",
        "error"
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleForgotPasswordResend = async () => {
    setForgotPasswordResendLoading(true);
    setForgotPasswordCountdown(60); // Immediately start countdown to prevent spam
    showForgotPasswordNotification(
      "Resending Reset Code...",
      "Please wait while we resend the password reset code.",
      "info"
    );

    try {
      await authService.requestForgotPasswordCode();
      showForgotPasswordNotification(
        "Code Resent",
        "A new password reset code has been sent to your email address.",
        "success"
      );
    } catch (error) {
      showForgotPasswordNotification(
        "Error",
        error.message || "Failed to resend reset code",
        "error"
      );
      // Reset countdown if there was an error
      setForgotPasswordCountdown(0);
    } finally {
      setForgotPasswordResendLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const codeString = forgotPasswordVerificationCode.join("");
    if (
      !codeString ||
      !forgotPasswordData.newPassword ||
      !forgotPasswordData.confirmPassword
    ) {
      showForgotPasswordNotification(
        "Error",
        "Please fill in all fields",
        "error"
      );
      return;
    }

    if (forgotPasswordData.newPassword !== forgotPasswordData.confirmPassword) {
      showForgotPasswordNotification(
        "Error",
        "Passwords do not match",
        "error"
      );
      return;
    }

    if (forgotPasswordData.newPassword.length < 6) {
      showForgotPasswordNotification(
        "Error",
        "Password must be at least 6 characters long",
        "error"
      );
      return;
    }

    setForgotPasswordLoading(true);
    try {
      await authService.resetPasswordWithCode(
        codeString,
        forgotPasswordData.newPassword
      );

      showForgotPasswordNotification(
        "Password Reset Successful",
        "Your password has been reset successfully",
        "success"
      );

      // Reset form
      setForgotPasswordData({
        newPassword: "",
        confirmPassword: "",
      });
      setForgotPasswordVerificationCode(["", "", "", "", "", ""]);
      setForgotPasswordStep("input");
      setForgotPasswordCountdown(0);
    } catch (error) {
      showForgotPasswordNotification(
        "Error",
        error.message || "Failed to reset password",
        "error"
      );
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <Box
      p={{ base: "4", md: "6" }}
      maxW="4xl"
      mx="auto"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
    >
      <VStack spacing="8" align="stretch">
        {/* Header */}
        <Box>
          <Heading
            size="lg"
            mb="2"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Account Settings
          </Heading>
          <Text
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
            fontSize="md"
          >
            Manage your account security and login credentials
          </Text>
        </Box>

        {/* Success/Error Alert */}
        {alert && (
          <Alert.Root
            status={alert.type}
            rounded="md"
            bg={
              alert.type === "success"
                ? colorMode === "dark"
                  ? "green.900"
                  : "green.50"
                : alert.type === "info"
                ? colorMode === "dark"
                  ? "blue.900"
                  : "blue.50"
                : colorMode === "dark"
                ? "red.900"
                : "red.50"
            }
            borderColor={
              alert.type === "success"
                ? colorMode === "dark"
                  ? "green.700"
                  : "green.200"
                : alert.type === "info"
                ? colorMode === "dark"
                  ? "blue.700"
                  : "blue.200"
                : colorMode === "dark"
                ? "red.700"
                : "red.200"
            }
          >
            <Alert.Indicator />
            <Box>
              <Alert.Title
                color={
                  alert.type === "success"
                    ? colorMode === "dark"
                      ? "green.200"
                      : "green.800"
                    : alert.type === "info"
                    ? colorMode === "dark"
                      ? "blue.200"
                      : "blue.800"
                    : colorMode === "dark"
                    ? "red.200"
                    : "red.800"
                }
                fontSize="sm"
                fontWeight="semibold"
              >
                {alert.title}
              </Alert.Title>
              {alert.description && (
                <Alert.Description
                  color={
                    alert.type === "success"
                      ? colorMode === "dark"
                        ? "green.300"
                        : "green.700"
                      : alert.type === "info"
                      ? colorMode === "dark"
                        ? "blue.300"
                        : "blue.700"
                      : colorMode === "dark"
                      ? "red.300"
                      : "red.700"
                  }
                  fontSize="sm"
                  mt="1"
                >
                  {alert.description}
                </Alert.Description>
              )}
            </Box>
          </Alert.Root>
        )}

        {/* Change Password Section */}
        <Box>
          <HStack mb="6">
            <MdLock size="20" color="#0d9488" />
            <Heading
              size="md"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Change Password
            </Heading>
          </HStack>

          <form>
            {/* Hidden username field for accessibility */}
            <input
              type="text"
              name="username"
              autoComplete="username"
              style={{ display: "none" }}
              readOnly
              value=""
            />
            <VStack spacing="6" align="stretch">
              <Field.Root>
                <Field.Label
                  color={colorMode === "dark" ? "gray.200" : "gray.700"}
                >
                  Current Password
                </Field.Label>
                <InputGroup
                  endElement={
                    <IconButton
                      variant="ghost"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                      size="sm"
                      color={colorMode === "dark" ? "white" : "gray.600"}
                    >
                      {showPasswords.current ? (
                        <MdVisibilityOff />
                      ) : (
                        <MdVisibility />
                      )}
                    </IconButton>
                  }
                >
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter current password"
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                    autoComplete="current-password"
                  />
                </InputGroup>
              </Field.Root>

              <Field.Root>
                <Field.Label
                  color={colorMode === "dark" ? "gray.200" : "gray.700"}
                >
                  New Password
                </Field.Label>
                <InputGroup
                  endElement={
                    <IconButton
                      variant="ghost"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                      size="sm"
                      color={colorMode === "dark" ? "white" : "gray.600"}
                    >
                      {showPasswords.new ? (
                        <MdVisibilityOff />
                      ) : (
                        <MdVisibility />
                      )}
                    </IconButton>
                  }
                >
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter new password"
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                    autoComplete="new-password"
                  />
                </InputGroup>
              </Field.Root>

              <Field.Root>
                <Field.Label
                  color={colorMode === "dark" ? "gray.200" : "gray.700"}
                >
                  Confirm New Password
                </Field.Label>
                <InputGroup
                  endElement={
                    <IconButton
                      variant="ghost"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                      size="sm"
                      color={colorMode === "dark" ? "white" : "gray.600"}
                    >
                      {showPasswords.confirm ? (
                        <MdVisibilityOff />
                      ) : (
                        <MdVisibility />
                      )}
                    </IconButton>
                  }
                >
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm new password"
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                    autoComplete="new-password"
                  />
                </InputGroup>
              </Field.Root>

              <Flex justify="flex-end">
                <Button
                  leftIcon={
                    passwordLoading ? (
                      <Spinner size="sm" color="white" />
                    ) : (
                      <MdLock />
                    )
                  }
                  colorScheme="teal"
                  bg="#0d9488"
                  _hover={{ bg: "#0f766e" }}
                  onClick={handlePasswordChange}
                  size="md"
                  type="button"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </Flex>
            </VStack>
          </form>
        </Box>

        <Separator />

        {/* Change Email Section */}
        <Box>
          <HStack mb="4">
            <MdMail size="20" color="#0d9488" />
            <Heading
              size="md"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Change Email Address
            </Heading>
          </HStack>

          {/* Section-specific Alert */}
          {emailAlert && (
            <Alert.Root
              status={emailAlert.type}
              rounded="md"
              mb="6"
              bg={
                emailAlert.type === "success"
                  ? colorMode === "dark"
                    ? "green.900"
                    : "green.50"
                  : emailAlert.type === "info"
                  ? colorMode === "dark"
                    ? "blue.900"
                    : "blue.50"
                  : colorMode === "dark"
                  ? "red.900"
                  : "red.50"
              }
              borderColor={
                emailAlert.type === "success"
                  ? colorMode === "dark"
                    ? "green.700"
                    : "green.200"
                  : emailAlert.type === "info"
                  ? colorMode === "dark"
                    ? "blue.700"
                    : "blue.200"
                  : colorMode === "dark"
                  ? "red.700"
                  : "red.200"
              }
            >
              <Alert.Indicator />
              <Box>
                <Alert.Title
                  color={
                    emailAlert.type === "success"
                      ? colorMode === "dark"
                        ? "green.200"
                        : "green.800"
                      : emailAlert.type === "info"
                      ? colorMode === "dark"
                        ? "blue.200"
                        : "blue.800"
                      : colorMode === "dark"
                      ? "red.200"
                      : "red.800"
                  }
                  fontSize="sm"
                  fontWeight="semibold"
                >
                  {emailAlert.title}
                </Alert.Title>
                {emailAlert.description && (
                  <Alert.Description
                    color={
                      emailAlert.type === "success"
                        ? colorMode === "dark"
                          ? "green.300"
                          : "green.700"
                        : emailAlert.type === "info"
                        ? colorMode === "dark"
                          ? "blue.300"
                          : "blue.700"
                        : colorMode === "dark"
                        ? "red.300"
                        : "red.700"
                    }
                    fontSize="sm"
                    mt="1"
                  >
                    {emailAlert.description}
                  </Alert.Description>
                )}
              </Box>
            </Alert.Root>
          )}

          <VStack spacing="6" align="stretch">
            {emailStep === "input" && (
              <>
                <Field.Root>
                  <Field.Label
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                  >
                    New Email Address
                  </Field.Label>
                  <Input
                    type="email"
                    value={emailData.newEmail}
                    onChange={(e) =>
                      setEmailData({ ...emailData, newEmail: e.target.value })
                    }
                    placeholder="Enter new email address"
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                    autoComplete="email"
                  />
                </Field.Root>
                <Flex justify="flex-end">
                  <Button
                    leftIcon={
                      emailLoading ? (
                        <Spinner size="sm" color="white" />
                      ) : (
                        <MdSend />
                      )
                    }
                    colorScheme="teal"
                    bg="#0d9488"
                    _hover={{ bg: "#0f766e" }}
                    onClick={handleEmailChange}
                    size="md"
                    disabled={emailLoading || emailResendLoading}
                  >
                    {emailLoading
                      ? "Sending verification code..."
                      : "Send Verification Code"}
                  </Button>
                </Flex>
              </>
            )}

            {emailStep === "verify" && (
              <>
                <Field.Root>
                  <Field.Label
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                  >
                    Verification Code
                  </Field.Label>
                  <PinInput.Root
                    value={emailVerificationCode}
                    onValueChange={(details) =>
                      setEmailVerificationCode(details.value)
                    }
                    otp
                  >
                    <PinInput.HiddenInput />
                    <PinInput.Control>
                      <HStack>
                        <PinInput.Input index={0} />
                        <PinInput.Input index={1} />
                        <PinInput.Input index={2} />
                        <PinInput.Input index={3} />
                        <PinInput.Input index={4} />
                        <PinInput.Input index={5} />
                      </HStack>
                    </PinInput.Control>
                  </PinInput.Root>
                </Field.Root>

                <Text
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  fontSize="sm"
                  textAlign="center"
                >
                  Didn't receive the code?{" "}
                  {emailCountdown > 0 || emailResendLoading ? (
                    <Text as="span" color="#0d9488" fontWeight="medium">
                      {emailResendLoading ? (
                        <>
                          <Spinner
                            size="xs"
                            color="#0d9488"
                            style={{ display: "inline", marginRight: "4px" }}
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <MdTimer
                            style={{ display: "inline", marginRight: "4px" }}
                          />
                          Wait {emailCountdown}s before resending
                        </>
                      )}
                    </Text>
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      color="#0d9488"
                      onClick={handleEmailResend}
                      isLoading={emailResendLoading}
                      loadingText="Resending..."
                      leftIcon={<MdRefresh />}
                      p="0"
                      h="auto"
                      minW="auto"
                      disabled={emailLoading || emailResendLoading}
                    >
                      Send Again
                    </Button>
                  )}
                </Text>

                <Flex justify="flex-end" gap="3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailStep("input");
                      setEmailVerificationCode(["", "", "", "", "", ""]);
                      setEmailCountdown(0);
                    }}
                    size="md"
                  >
                    Back
                  </Button>
                  <Button
                    leftIcon={
                      emailLoading ? (
                        <Spinner size="sm" color="white" />
                      ) : (
                        <MdCheck />
                      )
                    }
                    colorScheme="teal"
                    bg="#0d9488"
                    _hover={{ bg: "#0f766e" }}
                    onClick={handleEmailVerification}
                    size="md"
                    disabled={emailLoading || emailResendLoading}
                  >
                    {emailLoading ? "Verifying code..." : "Verify PIN"}
                  </Button>
                </Flex>
              </>
            )}

            {emailStep === "confirmed" && (
              <>
                <Alert.Root status="success">
                  <Alert.Indicator>
                    <MdCheckCircle />
                  </Alert.Indicator>
                  <Alert.Content>
                    <Alert.Title>PIN Verified Successfully</Alert.Title>
                    <Alert.Description>
                      Your verification code is correct. Your email will be
                      changed to{" "}
                      <Text as="span" fontWeight="bold">
                        {emailData.newEmail}
                      </Text>
                      . Click "Apply Changes" to complete the update.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>

                <Flex justify="flex-end" gap="3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailStep("verify");
                    }}
                    size="md"
                  >
                    Back
                  </Button>
                  <Button
                    leftIcon={
                      emailLoading ? (
                        <Spinner size="sm" color="white" />
                      ) : (
                        <MdCheck />
                      )
                    }
                    colorScheme="teal"
                    bg="#0d9488"
                    _hover={{ bg: "#0f766e" }}
                    onClick={handleEmailChangeConfirm}
                    size="md"
                    disabled={emailLoading}
                  >
                    {emailLoading ? "Applying changes..." : "Apply Changes"}
                  </Button>
                </Flex>
              </>
            )}

            {emailStep === "success" && (
              <Alert.Root status="success">
                <Alert.Indicator>
                  <MdCheckCircle />
                </Alert.Indicator>
                <Alert.Content>
                  <Alert.Description>
                    Your email address has been successfully updated to{" "}
                    {emailData.newEmail}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}
          </VStack>
        </Box>

        <Separator />

        {/* Reset Password via Email Section */}
        <Box>
          <HStack mb="4">
            <MdMail size="20" color="#0d9488" />
            <Heading
              size="md"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Reset Password via Email
            </Heading>
          </HStack>

          {/* Section-specific Alert */}
          {forgotPasswordAlert && (
            <Alert.Root
              status={forgotPasswordAlert.type}
              rounded="md"
              mb="6"
              bg={
                forgotPasswordAlert.type === "success"
                  ? colorMode === "dark"
                    ? "green.900"
                    : "green.50"
                  : forgotPasswordAlert.type === "info"
                  ? colorMode === "dark"
                    ? "blue.900"
                    : "blue.50"
                  : colorMode === "dark"
                  ? "red.900"
                  : "red.50"
              }
              borderColor={
                forgotPasswordAlert.type === "success"
                  ? colorMode === "dark"
                    ? "green.700"
                    : "green.200"
                  : forgotPasswordAlert.type === "info"
                  ? colorMode === "dark"
                    ? "blue.700"
                    : "blue.200"
                  : colorMode === "dark"
                  ? "red.700"
                  : "red.200"
              }
            >
              <Alert.Indicator />
              <Box>
                <Alert.Title
                  color={
                    forgotPasswordAlert.type === "success"
                      ? colorMode === "dark"
                        ? "green.200"
                        : "green.800"
                      : forgotPasswordAlert.type === "info"
                      ? colorMode === "dark"
                        ? "blue.200"
                        : "blue.800"
                      : colorMode === "dark"
                      ? "red.200"
                      : "red.800"
                  }
                  fontSize="sm"
                  fontWeight="semibold"
                >
                  {forgotPasswordAlert.title}
                </Alert.Title>
                {forgotPasswordAlert.description && (
                  <Alert.Description
                    color={
                      forgotPasswordAlert.type === "success"
                        ? colorMode === "dark"
                          ? "green.300"
                          : "green.700"
                        : forgotPasswordAlert.type === "info"
                        ? colorMode === "dark"
                          ? "blue.300"
                          : "blue.700"
                        : colorMode === "dark"
                        ? "red.300"
                        : "red.700"
                    }
                    fontSize="sm"
                    mt="1"
                  >
                    {forgotPasswordAlert.description}
                  </Alert.Description>
                )}
              </Box>
            </Alert.Root>
          )}

          <VStack spacing="6" align="stretch">
            {forgotPasswordStep === "input" && (
              <>
                <Text
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  fontSize="sm"
                >
                  You can reset your current password using the verification code that will be sent to your email address.
                </Text>
                <Flex justify="flex-end">
                  <Button
                    leftIcon={
                      forgotPasswordLoading ? (
                        <Spinner size="sm" color="#0d9488" />
                      ) : (
                        <MdSend />
                      )
                    }
                    variant="outline"
                    borderColor="#0d9488"
                    color="#0d9488"
                    _hover={{ bg: "#0d9488", color: "white" }}
                    onClick={handleForgotPasswordRequest}
                    size="md"
                    disabled={
                      forgotPasswordLoading || forgotPasswordResendLoading
                    }
                  >
                    {forgotPasswordLoading
                      ? "Sending reset code..."
                      : "Send Reset Code"}
                  </Button>
                </Flex>
              </>
            )}

            {forgotPasswordStep === "verify" && (
              <>
                <Field.Root>
                  <Field.Label
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                  >
                    Reset Code
                  </Field.Label>
                  <PinInput.Root
                    value={forgotPasswordVerificationCode}
                    onValueChange={(details) =>
                      setForgotPasswordVerificationCode(details.value)
                    }
                    otp
                  >
                    <PinInput.HiddenInput />
                    <PinInput.Control>
                      <HStack>
                        <PinInput.Input index={0} />
                        <PinInput.Input index={1} />
                        <PinInput.Input index={2} />
                        <PinInput.Input index={3} />
                        <PinInput.Input index={4} />
                        <PinInput.Input index={5} />
                      </HStack>
                    </PinInput.Control>
                  </PinInput.Root>
                </Field.Root>

                <Text
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  fontSize="sm"
                  textAlign="center"
                >
                  Didn't receive the code?{" "}
                  {forgotPasswordCountdown > 0 ||
                  forgotPasswordResendLoading ? (
                    <Text as="span" color="#0d9488" fontWeight="medium">
                      {forgotPasswordResendLoading ? (
                        <>
                          <Spinner
                            size="xs"
                            color="#0d9488"
                            style={{ display: "inline", marginRight: "4px" }}
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <MdTimer
                            style={{ display: "inline", marginRight: "4px" }}
                          />
                          Wait {forgotPasswordCountdown}s before resending
                        </>
                      )}
                    </Text>
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      color="#0d9488"
                      onClick={handleForgotPasswordResend}
                      isLoading={forgotPasswordResendLoading}
                      loadingText="Resending..."
                      leftIcon={<MdRefresh />}
                      p="0"
                      h="auto"
                      minW="auto"
                      disabled={
                        forgotPasswordLoading || forgotPasswordResendLoading
                      }
                    >
                      Send Again
                    </Button>
                  )}
                </Text>

                <Flex justify="flex-end" gap="3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setForgotPasswordStep("input");
                      setForgotPasswordVerificationCode([
                        "",
                        "",
                        "",
                        "",
                        "",
                        "",
                      ]);
                      setForgotPasswordCountdown(0);
                    }}
                    size="md"
                  >
                    Back
                  </Button>
                  <Button
                    leftIcon={
                      forgotPasswordLoading ? (
                        <Spinner size="sm" color="white" />
                      ) : (
                        <MdCheck />
                      )
                    }
                    bg="#0d9488"
                    color="white"
                    _hover={{ bg: "#0f766e" }}
                    onClick={handleForgotPasswordVerification}
                    size="md"
                    disabled={
                      forgotPasswordLoading || forgotPasswordResendLoading
                    }
                  >
                    {forgotPasswordLoading ? "Verifying PIN..." : "Verify PIN"}
                  </Button>
                </Flex>
              </>
            )}

            {forgotPasswordStep === "reset" && (
              <>
                <form>
                  {/* Hidden username field for accessibility */}
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    style={{ display: "none" }}
                    readOnly
                    value=""
                  />
                  <VStack spacing="4" align="stretch">
                    <Field.Root>
                      <Field.Label
                        color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      >
                        New Password
                      </Field.Label>
                      <InputGroup
                        endElement={
                          <IconButton
                            variant="ghost"
                            onClick={() =>
                              setShowForgotPasswords({
                                ...showForgotPasswords,
                                new: !showForgotPasswords.new,
                              })
                            }
                            size="sm"
                            color={colorMode === "dark" ? "white" : "gray.600"}
                          >
                            {showForgotPasswords.new ? (
                              <MdVisibilityOff />
                            ) : (
                              <MdVisibility />
                            )}
                          </IconButton>
                        }
                      >
                        <Input
                          type={showForgotPasswords.new ? "text" : "password"}
                          value={forgotPasswordData.newPassword}
                          onChange={(e) =>
                            setForgotPasswordData({
                              ...forgotPasswordData,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Enter new password"
                          bg={colorMode === "dark" ? "gray.700" : "white"}
                          borderColor={
                            colorMode === "dark" ? "gray.600" : "gray.300"
                          }
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          _placeholder={{
                            color:
                              colorMode === "dark" ? "gray.400" : "gray.500",
                          }}
                          autoComplete="new-password"
                        />
                      </InputGroup>
                    </Field.Root>

                    <Field.Root>
                      <Field.Label
                        color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      >
                        Confirm New Password
                      </Field.Label>
                      <InputGroup
                        endElement={
                          <IconButton
                            variant="ghost"
                            onClick={() =>
                              setShowForgotPasswords({
                                ...showForgotPasswords,
                                confirm: !showForgotPasswords.confirm,
                              })
                            }
                            size="sm"
                            color={colorMode === "dark" ? "white" : "gray.600"}
                          >
                            {showForgotPasswords.confirm ? (
                              <MdVisibilityOff />
                            ) : (
                              <MdVisibility />
                            )}
                          </IconButton>
                        }
                      >
                        <Input
                          type={
                            showForgotPasswords.confirm ? "text" : "password"
                          }
                          value={forgotPasswordData.confirmPassword}
                          onChange={(e) =>
                            setForgotPasswordData({
                              ...forgotPasswordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Confirm new password"
                          bg={colorMode === "dark" ? "gray.700" : "white"}
                          borderColor={
                            colorMode === "dark" ? "gray.600" : "gray.300"
                          }
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          _placeholder={{
                            color:
                              colorMode === "dark" ? "gray.400" : "gray.500",
                          }}
                          autoComplete="new-password"
                        />
                      </InputGroup>
                    </Field.Root>
                  </VStack>
                </form>

                <Flex justify="flex-end" gap="3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setForgotPasswordStep("verify");
                    }}
                    size="md"
                  >
                    Back
                  </Button>
                  <Button
                    leftIcon={
                      forgotPasswordLoading ? (
                        <Spinner size="sm" color="#0d9488" />
                      ) : (
                        <MdCheck />
                      )
                    }
                    variant="outline"
                    borderColor="#0d9488"
                    color="#0d9488"
                    _hover={{ bg: "#0d9488", color: "white" }}
                    onClick={handlePasswordReset}
                    size="md"
                    disabled={
                      forgotPasswordLoading || forgotPasswordResendLoading
                    }
                  >
                    {forgotPasswordLoading
                      ? "Resetting password..."
                      : "Reset Password"}
                  </Button>
                </Flex>
              </>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default AccountSettings;
