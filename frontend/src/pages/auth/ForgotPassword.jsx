import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Link,
  Alert,
  Spinner,
  InputGroup,
  Flex,
  PinInput,
} from "@chakra-ui/react";
import { LuMail, LuCrown, LuArrowLeft } from "react-icons/lu";
import { MdRefresh, MdTimer } from "react-icons/md";
import { Link as RouterLink } from "react-router-dom";
import ChessBackground from "../../components/ChessBackground";
import ThemeToggle from "../../components/ThemeToggle";
import { useColorMode } from "../../components/ui/color-mode";
import authService from "../../services/auth";

const ForgotPassword = () => {
  const { colorMode } = useColorMode();
  const [step, setStep] = useState("email"); // "email", "pin", "reset"
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState(["", "", "", "", "", ""]); // Initialize as array
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Countdown timer effect
  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Auto-dismiss alerts after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Add resend PIN function
  const handleResendPin = async () => {
    setResendLoading(true);
    setCountdown(60); // Immediately start countdown to prevent spam
    setError(""); // Clear any existing errors
    setSuccess(""); // Clear any existing success messages

    try {
      await authService.requestPublicForgotPasswordCode(email);
      setSuccess("A new 6-digit PIN has been sent to your email address.");
    } catch (error) {
      setError(error.message || "Failed to resend PIN");
      // Reset countdown if there was an error
      setCountdown(0);
    } finally {
      setResendLoading(false);
    }
  };

  const isDark = colorMode === "dark";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "newPassword") setNewPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
    if (error) setError("");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear any existing errors
    setSuccess(""); // Clear any existing success messages

    try {
      await authService.requestPublicForgotPasswordCode(email);
      setSuccess("A 6-digit PIN has been sent to your email address.");
      setStep("pin");
      setCountdown(60); // 1 minute countdown
    } catch (error) {
      setError(error.message || "Failed to send reset PIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    const pinString = pin.join("");
    if (pinString.length !== 6) {
      setError("Please enter the complete 6-digit PIN");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Verify the PIN with the backend
      await authService.verifyPublicForgotPasswordCode(email, pinString);
      setSuccess("PIN verified successfully. Please set your new password.");
      setStep("reset");
    } catch (error) {
      setError(error.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const pinString = pin.join("");
      await authService.resetPublicPasswordWithCode(email, pinString, newPassword);
      setSuccess(
        "Password reset successfully! You can now login with your new password."
      );
      setCountdown(0); // Clear countdown
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (error) {
      setError(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "email":
        return (
          <>
            <VStack gap={{ base: 3, md: 4 }} textAlign="center">
              <Text
                fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
                fontWeight="bold"
                color={isDark ? "white" : "black"}
              >
                Forgot Password?
              </Text>
              <Text
                color={isDark ? "gray.300" : "gray.600"}
                fontSize={{ base: "sm", md: "lg" }}
                px={{ base: 2, md: 0 }}
              >
                Enter your email address and we'll send you a 6-digit PIN to
                reset your password.
              </Text>
            </VStack>

            <form onSubmit={handleEmailSubmit}>
              <VStack gap={{ base: 4, md: 6 }}>
                <Box w="full">
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={isDark ? "gray.200" : "gray.700"}
                    mb={3}
                  >
                    Email Address
                  </Text>
                  <InputGroup
                    endElement={
                      <LuMail
                        size={20}
                        color={isDark ? "gray.400" : "gray.500"}
                      />
                    }
                  >
                    <Input
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleInputChange}
                      required
                      autoComplete="email"
                      size={{ base: "md", md: "lg" }}
                      borderRadius="lg"
                      bg={isDark ? "gray.800" : "white"}
                      border="2px solid"
                      borderColor={isDark ? "gray.600" : "gray.200"}
                      color={isDark ? "white" : "black"}
                      _placeholder={{ color: isDark ? "gray.400" : "gray.500" }}
                      _hover={{ borderColor: "#0d9488" }}
                      _focus={{
                        borderColor: "#0d9488",
                        boxShadow: "0 0 0 1px #0d9488",
                      }}
                    />
                  </InputGroup>
                </Box>

                <Button
                  type="submit"
                  size={{ base: "md", md: "lg" }}
                  w="full"
                  bg="#0d9488"
                  color="white"
                  borderRadius="lg"
                  _hover={{
                    bg: "#0f766e",
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <HStack>
                      <Spinner size="sm" />
                      <Text fontSize={{ base: "sm", md: "md" }}>
                        Sending PIN...
                      </Text>
                    </HStack>
                  ) : (
                    <Text fontSize={{ base: "sm", md: "md" }}>
                      Send Reset PIN
                    </Text>
                  )}
                </Button>
              </VStack>
            </form>
          </>
        );

      case "pin":
        return (
          <>
            <VStack gap={{ base: 3, md: 4 }} textAlign="center">
              <Text
                fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
                fontWeight="bold"
                color={isDark ? "white" : "black"}
              >
                Enter PIN
              </Text>
              <Text
                color={isDark ? "gray.300" : "gray.600"}
                fontSize={{ base: "sm", md: "lg" }}
                px={{ base: 2, md: 0 }}
              >
                We've sent a 6-digit PIN to{" "}
                <Text as="span" fontWeight="bold">
                  {email}
                </Text>
                . Enter it below to continue.
              </Text>
            </VStack>

            <form onSubmit={handlePinSubmit}>
              <VStack gap={{ base: 4, md: 6 }}>
                <Box w="full" textAlign="center">
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={isDark ? "gray.200" : "gray.700"}
                    mb={4}
                  >
                    6-Digit PIN
                  </Text>
                  <Flex justify="center">
                    <PinInput.Root
                      value={pin}
                      onValueChange={(details) => setPin(details.value)}
                      size={{ base: "md", md: "lg" }}
                      otp
                    >
                      <PinInput.HiddenInput />
                      <PinInput.Control>
                        <HStack gap={{ base: 2, md: 3 }}>
                          {Array.from({ length: 6 }).map((_, index) => (
                            <PinInput.Input
                              key={index}
                              index={index}
                              bg={isDark ? "gray.800" : "white"}
                              border="2px solid"
                              borderColor={isDark ? "gray.600" : "gray.200"}
                              color={isDark ? "white" : "black"}
                              _hover={{ borderColor: "#0d9488" }}
                              _focus={{
                                borderColor: "#0d9488",
                                boxShadow: "0 0 0 1px #0d9488",
                              }}
                              width={{ base: "2.5rem", md: "3rem" }}
                              height={{ base: "2.5rem", md: "3rem" }}
                              fontSize={{ base: "md", md: "lg" }}
                            />
                          ))}
                        </HStack>
                      </PinInput.Control>
                    </PinInput.Root>
                  </Flex>
                </Box>

                <Button
                  type="submit"
                  size={{ base: "md", md: "lg" }}
                  w="full"
                  bg="#0d9488"
                  color="white"
                  borderRadius="lg"
                  _hover={{
                    bg: "#0f766e",
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <HStack>
                      <Spinner size="sm" />
                      <Text fontSize={{ base: "sm", md: "md" }}>
                        Verifying PIN...
                      </Text>
                    </HStack>
                  ) : (
                    <Text fontSize={{ base: "sm", md: "md" }}>Verify PIN</Text>
                  )}
                </Button>

                <Text
                  color={isDark ? "gray.400" : "gray.600"}
                  fontSize="sm"
                  textAlign="center"
                >
                  Didn't receive the code?{" "}
                  {countdown > 0 || resendLoading ? (
                    <Text as="span" color="#0d9488" fontWeight="medium">
                      {resendLoading ? (
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
                          Wait {countdown}s before resending
                        </>
                      )}
                    </Text>
                  ) : (
                    <Button
                      variant="link"
                      size="sm"
                      color="#0d9488"
                      onClick={handleResendPin}
                      leftIcon={<MdRefresh />}
                      p="0"
                      h="auto"
                      minW="auto"
                      disabled={isLoading || resendLoading}
                      _hover={{ textDecoration: "underline" }}
                    >
                      Send Again
                    </Button>
                  )}
                </Text>
              </VStack>
            </form>
          </>
        );

      case "reset":
        return (
          <>
            <VStack gap={{ base: 3, md: 4 }} textAlign="center">
              <Text
                fontSize={{ base: "xl", sm: "2xl", md: "3xl" }}
                fontWeight="bold"
                color={isDark ? "white" : "black"}
              >
                Set New Password
              </Text>
              <Text
                color={isDark ? "gray.300" : "gray.600"}
                fontSize={{ base: "sm", md: "lg" }}
                px={{ base: 2, md: 0 }}
              >
                Enter your new password below.
              </Text>
            </VStack>

            <form onSubmit={handlePasswordReset}>
              <VStack gap={{ base: 4, md: 6 }}>
                <Box w="full">
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={isDark ? "gray.200" : "gray.700"}
                    mb={3}
                  >
                    New Password
                  </Text>
                  <Input
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={handleInputChange}
                    required
                    autoComplete="new-password"
                    size={{ base: "md", md: "lg" }}
                    borderRadius="lg"
                    bg={isDark ? "gray.800" : "white"}
                    border="2px solid"
                    borderColor={isDark ? "gray.600" : "gray.200"}
                    color={isDark ? "white" : "black"}
                    _placeholder={{ color: isDark ? "gray.400" : "gray.500" }}
                    _hover={{ borderColor: "#0d9488" }}
                    _focus={{
                      borderColor: "#0d9488",
                      boxShadow: "0 0 0 1px #0d9488",
                    }}
                  />
                </Box>

                <Box w="full">
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={isDark ? "gray.200" : "gray.700"}
                    mb={3}
                  >
                    Confirm New Password
                  </Text>
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={handleInputChange}
                    required
                    autoComplete="new-password"
                    size={{ base: "md", md: "lg" }}
                    borderRadius="lg"
                    bg={isDark ? "gray.800" : "white"}
                    border="2px solid"
                    borderColor={isDark ? "gray.600" : "gray.200"}
                    color={isDark ? "white" : "black"}
                    _placeholder={{ color: isDark ? "gray.400" : "gray.500" }}
                    _hover={{ borderColor: "#0d9488" }}
                    _focus={{
                      borderColor: "#0d9488",
                      boxShadow: "0 0 0 1px #0d9488",
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  size={{ base: "md", md: "lg" }}
                  w="full"
                  bg="#0d9488"
                  color="white"
                  borderRadius="lg"
                  _hover={{
                    bg: "#0f766e",
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  transition="all 0.2s"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <HStack>
                      <Spinner size="sm" />
                      <Text fontSize={{ base: "sm", md: "md" }}>
                        Resetting Password...
                      </Text>
                    </HStack>
                  ) : (
                    <Text fontSize={{ base: "sm", md: "md" }}>
                      Reset Password
                    </Text>
                  )}
                </Button>
              </VStack>
            </form>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      minH="100vh"
      bg={isDark ? "#000" : "#fff"}
      position="relative"
      color={isDark ? "#fff" : "#000"}
    >
      <ChessBackground />

      {/* Theme Toggle */}
      <Box
        position="absolute"
        top={{ base: 3, md: 4 }}
        right={{ base: 3, md: 4 }}
        zIndex="10"
      >
        <ThemeToggle />
      </Box>

      <Flex
        minH="100vh"
        align="center"
        justify="center"
        w="full"
        position="relative"
        zIndex="2"
        px={{ base: 4, md: 0 }}
        py={{ base: 6, md: 0 }}
      >
        <Box w="full" maxW={{ base: "sm", md: "md" }} p={{ base: 6, md: 10 }}>
          <VStack gap={{ base: 6, md: 8 }} align="stretch">
            {/* Header */}
            <VStack gap={{ base: 3, md: 4 }} textAlign="center">
              <Flex align="center" justify="center" gap={{ base: 2, md: 3 }}>
                <LuCrown size={32} color="#0d9488" />
                <Text
                  fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
                  fontWeight="bold"
                  color={isDark ? "white" : "black"}
                >
                  Chess Academy
                </Text>
              </Flex>
            </VStack>

            {error && (
              <Alert.Root
                status="error"
                borderRadius="lg"
                bg={isDark ? "red.900" : "red.50"}
              >
                <Alert.Indicator />
                <Alert.Title
                  color={isDark ? "red.200" : "red.800"}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  {error}
                </Alert.Title>
              </Alert.Root>
            )}

            {success && (
              <Alert.Root
                status="success"
                borderRadius="lg"
                bg={isDark ? "green.900" : "green.50"}
              >
                <Alert.Indicator />
                <Alert.Title
                  color={isDark ? "green.200" : "green.800"}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  {success}
                </Alert.Title>
              </Alert.Root>
            )}

            {renderStepContent()}

            {/* Back to Login Link */}
            <Box textAlign="center">
              <Link
                as={RouterLink}
                to="/login"
                color="#0d9488"
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="medium"
                _hover={{ textDecoration: "underline" }}
              >
                <HStack justify="center" gap={2}>
                  <LuArrowLeft size={16} />
                  <Text>Back to Sign In</Text>
                </HStack>
              </Link>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default ForgotPassword;
