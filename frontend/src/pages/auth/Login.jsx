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
  Select,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import {
  LuEye,
  LuEyeOff,
  LuMail,
  LuCrown,
  LuUserCheck,
  LuUsers,
  LuGraduationCap,
} from "react-icons/lu";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ChessBackground from "../../components/ChessBackground";
import ThemeToggle from "../../components/ThemeToggle";
import { useColorMode } from "../../components/ui/color-mode";

const Login = () => {
  const { colorMode } = useColorMode();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
  });

  // Role options for the select
  const roleOptions = createListCollection({
    items: [
      { label: "Admin", value: "admin", icon: LuUserCheck },
      { label: "Teacher", value: "teacher", icon: LuUsers },
      { label: "Student", value: "student", icon: LuGraduationCap },
    ],
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isDark = colorMode === "dark";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleRoleChange = (details) => {
    setFormData((prev) => ({
      ...prev,
      role: details.value[0] || "",
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate role selection
    if (!formData.role) {
      setError("Please select your role");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          expectedRole: formData.role, // Send expected role for validation
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on role
        switch (data.user.role) {
          case "admin":
            navigate("/admin/manage-users");
            break;
          case "teacher":
            navigate("/teacher/classes");
            break;
          case "student":
            navigate("/student/classes");
            break;
          default:
            navigate("/");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
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
              <Text
                color={isDark ? "gray.300" : "gray.600"}
                fontSize={{ base: "sm", md: "lg" }}
                px={{ base: 2, md: 0 }}
              >
                Master the game, one move at a time
              </Text>
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

            <form onSubmit={handleSubmit}>
              <VStack gap={{ base: 4, md: 6 }}>
                {/* Role Selection */}
                <Box w="full">
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={isDark ? "gray.200" : "gray.700"}
                    mb={3}
                  >
                    Select Your Role
                  </Text>
                  <Select.Root
                    collection={roleOptions}
                    value={formData.role ? [formData.role] : []}
                    onValueChange={handleRoleChange}
                    size={{ base: "md", md: "lg" }}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger
                        borderRadius="lg"
                        bg={isDark ? "gray.800" : "white"}
                        border="2px solid"
                        borderColor={isDark ? "gray.600" : "gray.200"}
                        color={isDark ? "white" : "black"}
                        _hover={{ borderColor: "#0d9488" }}
                        _focus={{
                          borderColor: "#0d9488",
                          boxShadow: "0 0 0 1px #0d9488",
                        }}
                        h={{ base: "10", md: "12" }}
                      >
                        <Select.ValueText
                          placeholder="Choose your role"
                          color={isDark ? "white" : "black"}
                          _placeholder={{
                            color: isDark ? "gray.400" : "gray.500",
                          }}
                        />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content
                          bg={isDark ? "gray.800" : "white"}
                          borderColor={isDark ? "gray.600" : "gray.200"}
                          color={isDark ? "white" : "black"}
                        >
                          {roleOptions.items.map((role) => {
                            const Icon = role.icon;
                            return (
                              <Select.Item
                                item={role}
                                key={role.value}
                                _hover={{ bg: isDark ? "gray.700" : "gray.50" }}
                                color={isDark ? "white" : "black"}
                              >
                                <HStack>
                                  <Icon size="16" />
                                  <Text color={isDark ? "white" : "black"}>
                                    {role.label}
                                  </Text>
                                </HStack>
                                <Select.ItemIndicator />
                              </Select.Item>
                            );
                          })}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Box>

                {/* Email Input */}
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

                {/* Password Input */}
                <Box w="full">
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
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="current-password"
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

                {/* Submit Button */}
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
                        Signing in...
                      </Text>
                    </HStack>
                  ) : (
                    <Text fontSize={{ base: "sm", md: "md" }}>Sign In</Text>
                  )}
                </Button>
              </VStack>
            </form>

            {/* Footer Links */}
            <VStack gap={{ base: 3, md: 4 }}>
              <Link
                as={RouterLink}
                to="/forgot-password"
                color="#0d9488"
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="medium"
                _hover={{ textDecoration: "underline" }}
              >
                Forgot your password?
              </Link>

              <HStack>
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  color={isDark ? "gray.300" : "gray.600"}
                >
                  Don't have an account?
                </Text>
                <Link
                  as={RouterLink}
                  to="/signup"
                  color="#0d9488"
                  fontSize={{ base: "sm", md: "md" }}
                  fontWeight="medium"
                  _hover={{ textDecoration: "underline" }}
                >
                  Join the Academy
                </Link>
              </HStack>
            </VStack>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default Login;
