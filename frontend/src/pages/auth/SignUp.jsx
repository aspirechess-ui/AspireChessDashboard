import { useState } from "react";
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
  IconButton,
  InputGroup,
  Flex,
  Grid,
} from "@chakra-ui/react";
import {
  LuEye,
  LuEyeOff,
  LuMail,
  LuUser,
  LuPhone,
  LuCalendar,
  LuCrown,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ChessBackground from "../../components/ChessBackground";
import ThemeToggle from "../../components/ThemeToggle";
import { useColorMode } from "../../components/ui/color-mode";
import {
  StepsRoot,
  StepsList,
  StepsItem,
  StepsIndicator,
  StepsTitle,
  StepsSeparator,
} from "../../components/ui/steps";
import { apiService } from "../../services/api.js";

const SignUp = () => {
  const { colorMode } = useColorMode();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    dateOfBirth: "",
    parentName: "",
    parentPhoneNumber: "",
    signupCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const isDark = colorMode === "dark";

  const steps = [
    { title: "Basic Info", description: "Personal details" },
    { title: "Account", description: "Login credentials" },
    { title: "Guardian", description: "Parent information" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.firstName && formData.lastName && formData.signupCode;
      case 1:
        return (
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword &&
          formData.password.length >= 6
        );
      case 2:
        return (
          formData.phoneNumber &&
          formData.dateOfBirth &&
          formData.parentName &&
          formData.parentPhoneNumber
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      setError("");
    } else {
      if (currentStep === 1 && formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
      } else if (currentStep === 1 && formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
      } else {
        setError("Please fill in all required fields");
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await apiService.post("/auth/register", formData);

      if (data.success !== false) {
        setSuccess("Account created successfully! Please login.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        console.error("Registration error:", data);
        setError(
          data.message || data.errors?.[0]?.msg || "Registration failed"
        );
      }
    } catch (error) {
      console.error("Network error:", error);
      setError(
        error.message || error.response?.data?.message || "Network error. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <VStack gap={{ base: 4, md: 5 }}>
            <Box w="full">
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={isDark ? "gray.200" : "gray.700"}
                mb={3}
              >
                Signup Code
              </Text>
              <Input
                name="signupCode"
                type="text"
                placeholder="Enter signup code"
                value={formData.signupCode}
                onChange={handleInputChange}
                required
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

            <Grid
              templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
              gap={4}
              w="full"
            >
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? "gray.200" : "gray.700"}
                  mb={3}
                >
                  First Name
                </Text>
                <InputGroup
                  endElement={
                    <LuUser
                      size={20}
                      color={isDark ? "gray.400" : "gray.500"}
                    />
                  }
                >
                  <Input
                    name="firstName"
                    type="text"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    autoComplete="given-name"
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

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? "gray.200" : "gray.700"}
                  mb={3}
                >
                  Last Name
                </Text>
                <Input
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  autoComplete="family-name"
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
            </Grid>
          </VStack>
        );

      case 1:
        return (
          <VStack gap={{ base: 4, md: 5 }}>
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
                  <LuMail size={20} color={isDark ? "gray.400" : "gray.500"} />
                }
              >
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
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

            <Grid
              templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
              gap={4}
              w="full"
            >
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? "gray.200" : "gray.700"}
                  mb={3}
                >
                  Password
                </Text>
                <InputGroup
                  endElement={
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      color={isDark ? "gray.400" : "gray.500"}
                      _hover={{ color: "#0d9488" }}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <LuEyeOff size={20} />
                      ) : (
                        <LuEye size={20} />
                      )}
                    </IconButton>
                  }
                >
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
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
                </InputGroup>
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? "gray.200" : "gray.700"}
                  mb={3}
                >
                  Confirm Password
                </Text>
                <InputGroup
                  endElement={
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      color={isDark ? "gray.400" : "gray.500"}
                      _hover={{ color: "#0d9488" }}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <LuEyeOff size={20} />
                      ) : (
                        <LuEye size={20} />
                      )}
                    </IconButton>
                  }
                >
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
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
                </InputGroup>
              </Box>
            </Grid>
          </VStack>
        );

      case 2:
        return (
          <VStack gap={{ base: 4, md: 5 }}>
            <Grid
              templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
              gap={4}
              w="full"
            >
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? "gray.200" : "gray.700"}
                  mb={3}
                >
                  Phone Number
                </Text>
                <InputGroup
                  endElement={
                    <LuPhone
                      size={20}
                      color={isDark ? "gray.400" : "gray.500"}
                    />
                  }
                >
                  <Input
                    name="phoneNumber"
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    autoComplete="tel"
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

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? "gray.200" : "gray.700"}
                  mb={3}
                >
                  Date of Birth
                </Text>
                <InputGroup
                  endElement={
                    <LuCalendar
                      size={20}
                      color={isDark ? "gray.400" : "gray.500"}
                    />
                  }
                >
                  <Input
                    name="dateOfBirth"
                    type="date"
                    placeholder="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    autoComplete="bday"
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
            </Grid>

            <Grid
              templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
              gap={4}
              w="full"
            >
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? "gray.200" : "gray.700"}
                  mb={3}
                >
                  Parent/Guardian Name
                </Text>
                <Input
                  name="parentName"
                  type="text"
                  placeholder="Parent/Guardian Name"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  required
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

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={isDark ? "gray.200" : "gray.700"}
                  mb={3}
                >
                  Parent Phone Number
                </Text>
                <Input
                  name="parentPhoneNumber"
                  type="tel"
                  placeholder="Parent Phone Number"
                  value={formData.parentPhoneNumber}
                  onChange={handleInputChange}
                  required
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
            </Grid>
          </VStack>
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
        <Box w="full" maxW={{ base: "lg", md: "2xl" }} p={{ base: 6, md: 10 }}>
          <VStack gap={{ base: 6, md: 8 }} align="stretch">
            {/* Header */}
            <VStack gap={{ base: 3, md: 4 }} textAlign="center">
              <Flex align="center" justify="center" gap={{ base: 2, md: 3 }}>
                <LuCrown size={32} color="#0d9488" />
                <Text
                  fontSize={{ base: "xl", sm: "2xl", md: "4xl" }}
                  fontWeight="bold"
                  color={isDark ? "white" : "black"}
                >
                  Join Chess Academy
                </Text>
              </Flex>
              <Text
                color={isDark ? "gray.300" : "gray.600"}
                fontSize={{ base: "sm", md: "lg" }}
                px={{ base: 2, md: 0 }}
              >
                Create your student account to get started
              </Text>
            </VStack>

            {/* Steps */}
            <Box display={{ base: "none", sm: "block" }}>
              <StepsRoot
                step={currentStep}
                count={steps.length}
                colorPalette="teal"
                size={{ base: "sm", md: "lg" }}
              >
                <StepsList>
                  {steps.map((step, index) => (
                    <StepsItem key={index} index={index}>
                      <StepsIndicator />
                      <StepsTitle
                        color={isDark ? "white" : "black"}
                        fontSize={{ base: "sm", md: "md" }}
                        fontWeight="medium"
                      >
                        {step.title}
                      </StepsTitle>
                      <StepsSeparator />
                    </StepsItem>
                  ))}
                </StepsList>
              </StepsRoot>
            </Box>

            {/* Mobile Step Indicator */}
            <Box display={{ base: "block", sm: "none" }} textAlign="center">
              <Text fontSize="sm" color={isDark ? "gray.300" : "gray.600"}>
                Step {currentStep + 1} of {steps.length}:{" "}
                {steps[currentStep].title}
              </Text>
            </Box>

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

            {/* Step Content */}
            <Box>{renderStepContent()}</Box>

            {/* Navigation Buttons */}
            <HStack justify="space-between">
              <Button
                onClick={handlePrev}
                disabled={currentStep === 0}
                variant="outline"
                size={{ base: "sm", md: "md" }}
                borderColor={isDark ? "gray.600" : "gray.300"}
                color={isDark ? "gray.200" : "gray.700"}
                _hover={{
                  borderColor: "#0d9488",
                  color: "#0d9488",
                }}
                leftIcon={<LuChevronLeft size={16} />}
              >
                <Text fontSize={{ base: "sm", md: "md" }}>Previous</Text>
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  size={{ base: "sm", md: "md" }}
                  bg="#0d9488"
                  color="white"
                  _hover={{ bg: "#0f766e" }}
                  rightIcon={<LuChevronRight size={16} />}
                >
                  <Text fontSize={{ base: "sm", md: "md" }}>Next</Text>
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  size={{ base: "sm", md: "md" }}
                  bg="#0d9488"
                  color="white"
                  _hover={{ bg: "#0f766e" }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <HStack>
                      <Spinner size="sm" />
                      <Text fontSize={{ base: "sm", md: "md" }}>
                        Creating...
                      </Text>
                    </HStack>
                  ) : (
                    <Text fontSize={{ base: "sm", md: "md" }}>
                      Create Account
                    </Text>
                  )}
                </Button>
              )}
            </HStack>

            {/* Footer Link */}
            <Box textAlign="center">
              <HStack justify="center">
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  color={isDark ? "gray.300" : "gray.600"}
                >
                  Already have an account?
                </Text>
                <Link
                  as={RouterLink}
                  to="/login"
                  color="#0d9488"
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="medium"
                  _hover={{ textDecoration: "underline" }}
                >
                  Sign in
                </Link>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default SignUp;
