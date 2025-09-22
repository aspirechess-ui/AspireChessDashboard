import React, { useState } from "react";
import {
  Dialog,
  Button,
  Text,
  VStack,
  HStack,
  Portal,
  Input,
  Textarea,
  SimpleGrid,
  Box,
  Badge,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { Field } from "../../../components/ui/field";
import {
  LuUser,
  LuUserCheck,
  LuShield,
  LuPlus,
  LuX,
  LuEye,
  LuEyeOff,
  LuMail,
  LuPhone,
  LuMapPin,
  LuGraduationCap,
} from "react-icons/lu";
import { useColorMode } from "../../../components/ui/color-mode";

const CreateUserCard = ({ isOpen, onClose, onSubmit }) => {
  const { colorMode } = useColorMode();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Basic user data
    email: "",
    password: "",
    role: "teacher", // Default to teacher since admin can only create admin/teacher

    // User details
    firstName: "",
    lastName: "",
    phoneNumber: "",
    alternatePhoneNumber: "",
    gender: "",
    nationality: "",

    // Address
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",

    // Role-specific fields
    // For teachers
    qualification: "",
    experience: "",
    specialization: "",
    bio: "",

    // For admins
    designation: "",
    department: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Role-specific validations
    if (formData.role === "teacher") {
      if (!formData.qualification.trim())
        newErrors.qualification = "Qualification is required for teachers";
      if (!formData.specialization.trim())
        newErrors.specialization = "Specialization is required for teachers";
    }

    if (formData.role === "admin") {
      if (!formData.designation.trim())
        newErrors.designation = "Designation is required for admins";
      if (!formData.department.trim())
        newErrors.department = "Department is required for admins";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Prepare data for submission based on backend API structure
      const userData = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        // Role-specific fields
        ...(formData.role === "teacher" && {
          qualification: formData.qualification.trim(),
          experience: formData.experience
            ? parseInt(formData.experience)
            : undefined,
          specialization: formData.specialization.trim(),
          bio: formData.bio.trim() || undefined,
        }),
        ...(formData.role === "admin" && {
          designation: formData.designation.trim(),
          department: formData.department.trim(),
        }),
        // Optional fields
        ...(formData.alternatePhoneNumber.trim() && {
          alternatePhoneNumber: formData.alternatePhoneNumber.trim(),
        }),
        ...(formData.gender && { gender: formData.gender }),
        ...(formData.nationality.trim() && {
          nationality: formData.nationality.trim(),
        }),
        // Address fields
        ...(formData.street.trim() && { street: formData.street.trim() }),
        ...(formData.city.trim() && { city: formData.city.trim() }),
        ...(formData.state.trim() && { state: formData.state.trim() }),
        ...(formData.country.trim() && { country: formData.country.trim() }),
        ...(formData.zipCode.trim() && { zipCode: formData.zipCode.trim() }),
        // Set role
        role: formData.role,
      };

      console.log("CreateUserCard submitting data:", userData);
      await onSubmit(userData);
      handleClose();
    } catch (error) {
      console.error("Error creating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: "",
      password: "",
      role: "teacher",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      alternatePhoneNumber: "",
      gender: "",
      nationality: "",
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      qualification: "",
      experience: "",
      specialization: "",
      bio: "",
      designation: "",
      department: "",
    });
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <LuShield />;
      case "teacher":
        return <LuUserCheck />;
      default:
        return <LuUser />;
    }
  };

  // Common input styling for consistent dark/light mode appearance
  const inputStyles = {
    color: colorMode === "dark" ? "white" : "gray.900",
    bg: colorMode === "dark" ? "gray.700" : "white",
    borderColor: colorMode === "dark" ? "gray.600" : "gray.300",
    _placeholder: {
      color: colorMode === "dark" ? "gray.400" : "gray.500",
    },
    _focus: {
      borderColor: "#0d9488",
      boxShadow: `0 0 0 1px #0d9488`,
    },
    _hover: {
      borderColor: colorMode === "dark" ? "gray.500" : "gray.400",
    },
  };

  // Create gender collection for Select component
  const genderCollection = createListCollection({
    items: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" },
      { label: "Prefer not to say", value: "prefer_not_to_say" },
    ],
  });

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "red";
      case "teacher":
        return "blue";
      default:
        return "gray";
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => !open && handleClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            maxW={{ base: "95vw", md: "4xl" }}
            maxH={{ base: "90vh", md: "85vh" }}
            mx="4"
            overflow="hidden"
          >
            <Dialog.Header
              pb="4"
              borderBottomWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack justify="space-between" align="center">
                <HStack spacing="3">
                  <Box
                    p="2"
                    bg={colorMode === "dark" ? "teal.900" : "teal.50"}
                    rounded="md"
                    color={colorMode === "dark" ? "teal.300" : "teal.600"}
                  >
                    <LuPlus />
                  </Box>
                  <VStack align="start" spacing="1">
                    <Dialog.Title
                      fontSize="lg"
                      fontWeight="semibold"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      Create New User
                    </Dialog.Title>
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    >
                      Add a new admin or teacher account
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                  onClick={handleClose}
                >
                  <LuX />
                </Button>
              </HStack>
            </Dialog.Header>

            <Dialog.Body py="6" overflowY="auto">
              <VStack spacing="6" align="stretch">
                {/* Role Selection */}
                <Box>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    mb="3"
                  >
                    Account Type
                  </Text>
                  <HStack spacing="3">
                    <Button
                      variant={
                        formData.role === "teacher" ? "solid" : "outline"
                      }
                      colorPalette="blue"
                      onClick={() => handleInputChange("role", "teacher")}
                      leftIcon={<LuUserCheck />}
                      size="sm"
                    >
                      Teacher
                    </Button>
                    <Button
                      variant={formData.role === "admin" ? "solid" : "outline"}
                      colorPalette="red"
                      onClick={() => handleInputChange("role", "admin")}
                      leftIcon={<LuShield />}
                      size="sm"
                    >
                      Admin
                    </Button>
                  </HStack>
                  <Badge
                    colorPalette={getRoleColor(formData.role)}
                    variant="subtle"
                    size="sm"
                    mt="2"
                  >
                    <HStack spacing="1">
                      {getRoleIcon(formData.role)}
                      <Text fontSize="xs" textTransform="capitalize">
                        {formData.role} Account
                      </Text>
                    </HStack>
                  </Badge>
                </Box>

                {/* Basic Information */}
                <Box>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    mb="4"
                  >
                    Basic Information
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                    <Field
                      label={
                        <HStack>
                          <LuMail
                            color={colorMode === "dark" ? "white" : "gray.500"}
                          />
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Email Address *
                          </Text>
                        </HStack>
                      }
                      errorText={errors.email}
                      invalid={!!errors.email}
                    >
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        {...inputStyles}
                      />
                    </Field>

                    <Field
                      label={
                        <Text
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Password *
                        </Text>
                      }
                      errorText={errors.password}
                      invalid={!!errors.password}
                    >
                      <Box position="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={formData.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          {...inputStyles}
                          pr="12"
                          autoComplete="new-password"
                          name="user-password"
                        />
                        <Button
                          position="absolute"
                          right="2"
                          top="50%"
                          transform="translateY(-50%)"
                          size="xs"
                          variant="ghost"
                          onClick={() => setShowPassword(!showPassword)}
                          color={colorMode === "dark" ? "gray.400" : "gray.500"}
                        >
                          {showPassword ? <LuEyeOff /> : <LuEye />}
                        </Button>
                      </Box>
                    </Field>

                    <Field
                      label={
                        <HStack>
                          <LuUser
                            color={colorMode === "dark" ? "white" : "gray.500"}
                          />
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            First Name *
                          </Text>
                        </HStack>
                      }
                      errorText={errors.firstName}
                      invalid={!!errors.firstName}
                    >
                      <Input
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        {...inputStyles}
                      />
                    </Field>

                    <Field
                      label={
                        <HStack>
                          <LuUser
                            color={colorMode === "dark" ? "white" : "gray.500"}
                          />
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Last Name *
                          </Text>
                        </HStack>
                      }
                      errorText={errors.lastName}
                      invalid={!!errors.lastName}
                    >
                      <Input
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        {...inputStyles}
                      />
                    </Field>

                    <Field
                      label={
                        <HStack>
                          <LuPhone
                            color={colorMode === "dark" ? "white" : "gray.500"}
                          />
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Phone Number *
                          </Text>
                        </HStack>
                      }
                      errorText={errors.phoneNumber}
                      invalid={!!errors.phoneNumber}
                    >
                      <Input
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        {...inputStyles}
                      />
                    </Field>

                    <Field
                      label={
                        <HStack>
                          <LuPhone
                            color={colorMode === "dark" ? "white" : "gray.500"}
                          />
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Alternate Phone
                          </Text>
                        </HStack>
                      }
                    >
                      <Input
                        type="tel"
                        placeholder="+1234567890"
                        value={formData.alternatePhoneNumber}
                        onChange={(e) =>
                          handleInputChange(
                            "alternatePhoneNumber",
                            e.target.value
                          )
                        }
                        {...inputStyles}
                      />
                    </Field>

                    <Field
                      label={
                        <Text
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Gender
                        </Text>
                      }
                    >
                      <Select.Root
                        collection={genderCollection}
                        value={formData.gender ? [formData.gender] : []}
                        onValueChange={({ value }) =>
                          handleInputChange("gender", value[0])
                        }
                      >
                        <Select.HiddenSelect />
                        <Select.Control>
                          <Select.Trigger
                            bg={colorMode === "dark" ? "gray.700" : "white"}
                            borderColor={
                              colorMode === "dark" ? "gray.600" : "gray.300"
                            }
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            _hover={{
                              borderColor:
                                colorMode === "dark" ? "gray.500" : "gray.400",
                            }}
                            _focus={{
                              borderColor: "#0d9488",
                              boxShadow: `0 0 0 1px #0d9488`,
                            }}
                          >
                            <Select.ValueText
                              placeholder="Select gender"
                              color={
                                colorMode === "dark" ? "white" : "gray.900"
                              }
                              _placeholder={{
                                color:
                                  colorMode === "dark"
                                    ? "gray.400"
                                    : "gray.500",
                              }}
                            />
                          </Select.Trigger>
                          <Select.IndicatorGroup>
                            <Select.Indicator
                              color={
                                colorMode === "dark" ? "white" : "gray.500"
                              }
                            />
                          </Select.IndicatorGroup>
                        </Select.Control>
                        <Select.Positioner>
                          <Select.Content
                            bg={colorMode === "dark" ? "gray.700" : "white"}
                            borderColor={
                              colorMode === "dark" ? "gray.600" : "gray.300"
                            }
                            shadow="lg"
                          >
                            {genderCollection.items.map((item) => (
                              <Select.Item
                                item={item}
                                key={item.value}
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                                _hover={{
                                  bg:
                                    colorMode === "dark"
                                      ? "gray.600"
                                      : "gray.100",
                                }}
                                _selected={{
                                  bg: "#0d9488",
                                  color: "white",
                                }}
                              >
                                {item.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Select.Root>
                    </Field>

                    <Field
                      label={
                        <HStack>
                          <LuMapPin
                            color={colorMode === "dark" ? "white" : "gray.500"}
                          />
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Nationality
                          </Text>
                        </HStack>
                      }
                    >
                      <Input
                        placeholder="e.g., American, Indian"
                        value={formData.nationality}
                        onChange={(e) =>
                          handleInputChange("nationality", e.target.value)
                        }
                        {...inputStyles}
                      />
                    </Field>
                  </SimpleGrid>
                </Box>

                {/* Address Information */}
                <Box>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    mb="4"
                  >
                    Address Information
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                    <Field
                      label={
                        <HStack>
                          <LuMapPin
                            color={colorMode === "dark" ? "white" : "gray.500"}
                          />
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Street Address
                          </Text>
                        </HStack>
                      }
                    >
                      <Input
                        placeholder="123 Main Street"
                        value={formData.street}
                        onChange={(e) =>
                          handleInputChange("street", e.target.value)
                        }
                        {...inputStyles}
                      />
                    </Field>

                    <Field
                      label={
                        <Text
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          City
                        </Text>
                      }
                    >
                      <Input
                        placeholder="New York"
                        value={formData.city}
                        onChange={(e) =>
                          handleInputChange("city", e.target.value)
                        }
                        {...inputStyles}
                      />
                    </Field>

                    <Field
                      label={
                        <Text
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          State/Province
                        </Text>
                      }
                    >
                      <Input
                        placeholder="NY"
                        value={formData.state}
                        onChange={(e) =>
                          handleInputChange("state", e.target.value)
                        }
                        {...inputStyles}
                      />
                    </Field>

                    <Field
                      label={
                        <Text
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Country
                        </Text>
                      }
                    >
                      <Input
                        placeholder="United States"
                        value={formData.country}
                        onChange={(e) =>
                          handleInputChange("country", e.target.value)
                        }
                        {...inputStyles}
                      />
                    </Field>

                    <Field
                      label={
                        <Text
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          ZIP/Postal Code
                        </Text>
                      }
                    >
                      <Input
                        placeholder="10001"
                        value={formData.zipCode}
                        onChange={(e) =>
                          handleInputChange("zipCode", e.target.value)
                        }
                        {...inputStyles}
                      />
                    </Field>
                  </SimpleGrid>
                </Box>

                {/* Role-specific Information */}
                {formData.role === "teacher" && (
                  <Box>
                    <Text
                      fontSize="md"
                      fontWeight="semibold"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      mb="4"
                    >
                      Teaching Information
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                      <Field
                        label={
                          <HStack>
                            <LuGraduationCap
                              color={
                                colorMode === "dark" ? "white" : "gray.500"
                              }
                            />
                            <Text
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                            >
                              Qualification *
                            </Text>
                          </HStack>
                        }
                        errorText={errors.qualification}
                        invalid={!!errors.qualification}
                      >
                        <Input
                          placeholder="e.g., Master's in Education"
                          value={formData.qualification}
                          onChange={(e) =>
                            handleInputChange("qualification", e.target.value)
                          }
                          {...inputStyles}
                        />
                      </Field>

                      <Field
                        label={
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Experience (Years)
                          </Text>
                        }
                      >
                        <Input
                          type="number"
                          placeholder="5"
                          value={formData.experience}
                          onChange={(e) =>
                            handleInputChange("experience", e.target.value)
                          }
                          {...inputStyles}
                        />
                      </Field>

                      <Field
                        label={
                          <HStack>
                            <LuUserCheck
                              color={
                                colorMode === "dark" ? "white" : "gray.500"
                              }
                            />
                            <Text
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                            >
                              Specialization *
                            </Text>
                          </HStack>
                        }
                        errorText={errors.specialization}
                        invalid={!!errors.specialization}
                      >
                        <Input
                          placeholder="e.g., Beginner Training, Advanced Tactics"
                          value={formData.specialization}
                          onChange={(e) =>
                            handleInputChange("specialization", e.target.value)
                          }
                          {...inputStyles}
                        />
                      </Field>
                    </SimpleGrid>

                    <Field
                      label={
                        <Text
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Bio
                        </Text>
                      }
                      mt="4"
                    >
                      <Textarea
                        placeholder="Brief description about teaching experience and approach..."
                        value={formData.bio}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        {...inputStyles}
                        rows={3}
                      />
                    </Field>
                  </Box>
                )}

                {formData.role === "admin" && (
                  <Box>
                    <Text
                      fontSize="md"
                      fontWeight="semibold"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      mb="4"
                    >
                      Administrative Information
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                      <Field
                        label={
                          <HStack>
                            <LuShield
                              color={
                                colorMode === "dark" ? "white" : "gray.500"
                              }
                            />
                            <Text
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                            >
                              Designation *
                            </Text>
                          </HStack>
                        }
                        errorText={errors.designation}
                        invalid={!!errors.designation}
                      >
                        <Input
                          placeholder="e.g., Principal, Vice Principal"
                          value={formData.designation}
                          onChange={(e) =>
                            handleInputChange("designation", e.target.value)
                          }
                          {...inputStyles}
                        />
                      </Field>

                      <Field
                        label={
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Department *
                          </Text>
                        }
                        errorText={errors.department}
                        invalid={!!errors.department}
                      >
                        <Input
                          placeholder="e.g., Administration, Academic"
                          value={formData.department}
                          onChange={(e) =>
                            handleInputChange("department", e.target.value)
                          }
                          {...inputStyles}
                        />
                      </Field>
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              pt="4"
              borderTopWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack
                spacing="3"
                w="full"
                justify="end"
                flexDirection={{ base: "column-reverse", sm: "row" }}
              >
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  w={{ base: "full", sm: "auto" }}
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                >
                  Cancel
                </Button>
                <Button
                  colorPalette="teal"
                  onClick={handleSubmit}
                  loading={isLoading}
                  loadingText="Creating..."
                  w={{ base: "full", sm: "auto" }}
                  leftIcon={<LuPlus />}
                >
                  Create {formData.role === "admin" ? "Admin" : "Teacher"}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CreateUserCard;
