import React from "react";
import {
  Card,
  SimpleGrid,
  VStack,
  Text,
  Input,
  Textarea,
  Select,
  createListCollection,
  HStack,
} from "@chakra-ui/react";
import {
  LuUser,
  LuMail,
  LuPhone,
  LuMapPin,
  LuCalendar,
  LuGraduationCap,
  LuUserCheck,
} from "react-icons/lu";
import { useColorMode } from "../../components/ui/color-mode";
import { Field } from "@chakra-ui/react";

const ProfileSettingsTable = ({
  userRole,
  profileData,
  handleInputChange,
  errors = {},
}) => {
  const { colorMode } = useColorMode();

  // Create gender collection for Select component
  const genderCollection = createListCollection({
    items: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" },
      { label: "Prefer not to say", value: "prefer_not_to_say" },
    ],
  });

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

  return (
    <VStack spacing="6" align="stretch">
      {/* Basic Information */}
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      >
        <Card.Body p="6">
          <VStack spacing="6" align="stretch">
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Basic Information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              <Field.Root invalid={!!errors.firstName}>
                <Field.Label>
                  <HStack>
                    <LuUser
                      color={colorMode === "dark" ? "white" : "gray.500"}
                    />
                    <Text
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      First Name *
                    </Text>
                  </HStack>
                </Field.Label>
                <Input
                  value={profileData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  placeholder="Enter your first name"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  _placeholder={{
                    color: colorMode === "dark" ? "gray.400" : "gray.500",
                  }}
                  _focus={{
                    borderColor: "#0d9488",
                    boxShadow: `0 0 0 1px #0d9488`,
                  }}
                />
                {errors.firstName && (
                  <Field.ErrorText>{errors.firstName}</Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root invalid={!!errors.lastName}>
                <Field.Label>
                  <HStack>
                    <LuUser
                      color={colorMode === "dark" ? "white" : "gray.500"}
                    />
                    <Text
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Last Name *
                    </Text>
                  </HStack>
                </Field.Label>
                <Input
                  value={profileData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  placeholder="Enter your last name"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  _placeholder={{
                    color: colorMode === "dark" ? "gray.400" : "gray.500",
                  }}
                  _focus={{
                    borderColor: "#0d9488",
                    boxShadow: `0 0 0 1px #0d9488`,
                  }}
                />
                {errors.lastName && (
                  <Field.ErrorText>{errors.lastName}</Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root>
                <Field.Label>
                  <HStack>
                    <LuMail
                      color={colorMode === "dark" ? "white" : "gray.500"}
                    />
                    <Text
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Email
                    </Text>
                  </HStack>
                </Field.Label>
                <Input
                  value={profileData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  type="email"
                  disabled
                  {...inputStyles}
                  opacity={0.6}
                />
                <Field.HelperText>
                  Email cannot be changed here
                </Field.HelperText>
              </Field.Root>

              <Field.Root invalid={!!errors.phoneNumber}>
                <Field.Label>
                  <HStack>
                    <LuPhone
                      color={colorMode === "dark" ? "white" : "gray.500"}
                    />
                    <Text
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Phone Number *
                    </Text>
                  </HStack>
                </Field.Label>
                <Input
                  value={profileData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  placeholder="Enter your phone number"
                  type="tel"
                  {...inputStyles}
                />
                {errors.phoneNumber && (
                  <Field.ErrorText>{errors.phoneNumber}</Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root>
                <Field.Label>
                  <HStack>
                    <LuPhone
                      color={colorMode === "dark" ? "white" : "gray.500"}
                    />
                    <Text
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Alternate Phone
                    </Text>
                  </HStack>
                </Field.Label>
                <Input
                  value={profileData.alternatePhoneNumber}
                  onChange={(e) =>
                    handleInputChange("alternatePhoneNumber", e.target.value)
                  }
                  placeholder="Enter alternate phone number"
                  type="tel"
                  {...inputStyles}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                >
                  Gender
                </Field.Label>
                <Select.Root
                  collection={genderCollection}
                  value={profileData.gender ? [profileData.gender] : []}
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
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        _placeholder={{
                          color: colorMode === "dark" ? "gray.400" : "gray.500",
                        }}
                      />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator
                        color={colorMode === "dark" ? "white" : "gray.500"}
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
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          _hover={{
                            bg: colorMode === "dark" ? "gray.600" : "gray.100",
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
              </Field.Root>

              <Field.Root>
                <Field.Label>
                  <HStack>
                    <LuMapPin
                      color={colorMode === "dark" ? "white" : "gray.500"}
                    />
                    <Text
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Nationality
                    </Text>
                  </HStack>
                </Field.Label>
                <Input
                  value={profileData.nationality}
                  onChange={(e) =>
                    handleInputChange("nationality", e.target.value)
                  }
                  placeholder="Enter your nationality"
                  {...inputStyles}
                />
              </Field.Root>
            </SimpleGrid>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Address Information */}
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      >
        <Card.Body p="6">
          <VStack spacing="6" align="stretch">
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Address Information
            </Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              <Field.Root gridColumn={{ base: "1", md: "1 / -1" }}>
                <Field.Label
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                >
                  Street Address
                </Field.Label>
                <Input
                  value={profileData.address.street}
                  onChange={(e) =>
                    handleInputChange("street", e.target.value, "address")
                  }
                  placeholder="Enter your street address"
                  {...inputStyles}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                >
                  City
                </Field.Label>
                <Input
                  value={profileData.address.city}
                  onChange={(e) =>
                    handleInputChange("city", e.target.value, "address")
                  }
                  placeholder="Enter your city"
                  {...inputStyles}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                >
                  State/Province
                </Field.Label>
                <Input
                  value={profileData.address.state}
                  onChange={(e) =>
                    handleInputChange("state", e.target.value, "address")
                  }
                  placeholder="Enter your state/province"
                  {...inputStyles}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                >
                  Country
                </Field.Label>
                <Input
                  value={profileData.address.country}
                  onChange={(e) =>
                    handleInputChange("country", e.target.value, "address")
                  }
                  placeholder="Enter your country"
                  {...inputStyles}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                >
                  ZIP/Postal Code
                </Field.Label>
                <Input
                  value={profileData.address.zipCode}
                  onChange={(e) =>
                    handleInputChange("zipCode", e.target.value, "address")
                  }
                  placeholder="Enter your ZIP/postal code"
                  {...inputStyles}
                />
              </Field.Root>
            </SimpleGrid>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Role-specific sections */}
      {userRole === "student" && (
        <>
          {/* Student Information */}
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Body p="6">
              <VStack spacing="6" align="stretch">
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Student Information
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                  <Field.Root invalid={!!errors.dateOfBirth}>
                    <Field.Label>
                      <HStack>
                        <LuCalendar
                          color={colorMode === "dark" ? "white" : "gray.500"}
                        />
                        <Text
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Date of Birth *
                        </Text>
                      </HStack>
                    </Field.Label>
                    <Input
                      value={profileData.dateOfBirth}
                      onChange={(e) =>
                        handleInputChange("dateOfBirth", e.target.value)
                      }
                      type="date"
                      {...inputStyles}
                    />
                    {errors.dateOfBirth && (
                      <Field.ErrorText>{errors.dateOfBirth}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.parentName}>
                    <Field.Label
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Parent/Guardian Name *
                    </Field.Label>
                    <Input
                      value={profileData.parentName}
                      onChange={(e) =>
                        handleInputChange("parentName", e.target.value)
                      }
                      placeholder="Enter parent/guardian name"
                      {...inputStyles}
                    />
                    {errors.parentName && (
                      <Field.ErrorText>{errors.parentName}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.parentPhoneNumber}>
                    <Field.Label
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Parent Phone Number *
                    </Field.Label>
                    <Input
                      value={profileData.parentPhoneNumber}
                      onChange={(e) =>
                        handleInputChange("parentPhoneNumber", e.target.value)
                      }
                      placeholder="Enter parent phone number"
                      type="tel"
                      {...inputStyles}
                    />
                    {errors.parentPhoneNumber && (
                      <Field.ErrorText>
                        {errors.parentPhoneNumber}
                      </Field.ErrorText>
                    )}
                  </Field.Root>
                </SimpleGrid>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Emergency Contact */}
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Body p="6">
              <VStack spacing="6" align="stretch">
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Emergency Contact
                </Text>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                  <Field.Root>
                    <Field.Label
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Contact Name
                    </Field.Label>
                    <Input
                      value={profileData.emergencyContact.name}
                      onChange={(e) =>
                        handleInputChange(
                          "name",
                          e.target.value,
                          "emergencyContact"
                        )
                      }
                      placeholder="Enter emergency contact name"
                      {...inputStyles}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Relationship
                    </Field.Label>
                    <Input
                      value={profileData.emergencyContact.relationship}
                      onChange={(e) =>
                        handleInputChange(
                          "relationship",
                          e.target.value,
                          "emergencyContact"
                        )
                      }
                      placeholder="Enter relationship"
                      {...inputStyles}
                    />
                  </Field.Root>

                  <Field.Root gridColumn={{ base: "1", md: "1 / -1" }}>
                    <Field.Label
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Phone Number
                    </Field.Label>
                    <Input
                      value={profileData.emergencyContact.phoneNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "phoneNumber",
                          e.target.value,
                          "emergencyContact"
                        )
                      }
                      placeholder="Enter emergency contact phone"
                      type="tel"
                      {...inputStyles}
                    />
                  </Field.Root>
                </SimpleGrid>
              </VStack>
            </Card.Body>
          </Card.Root>
        </>
      )}

      {userRole === "teacher" && (
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <Card.Body p="6">
            <VStack spacing="6" align="stretch">
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Teaching Information
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <Field.Root invalid={!!errors.qualification}>
                  <Field.Label>
                    <HStack>
                      <LuGraduationCap
                        color={colorMode === "dark" ? "white" : "gray.500"}
                      />
                      <Text
                        color={colorMode === "dark" ? "gray.300" : "gray.700"}
                      >
                        Qualification *
                      </Text>
                    </HStack>
                  </Field.Label>
                  <Input
                    value={profileData.qualification}
                    onChange={(e) =>
                      handleInputChange("qualification", e.target.value)
                    }
                    placeholder="Enter your qualification"
                    {...inputStyles}
                  />
                  {errors.qualification && (
                    <Field.ErrorText>{errors.qualification}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.experience}>
                  <Field.Label
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    Experience (Years) *
                  </Field.Label>
                  <Input
                    value={profileData.experience}
                    onChange={(e) =>
                      handleInputChange("experience", e.target.value)
                    }
                    placeholder="Enter years of experience"
                    type="number"
                    min="0"
                    {...inputStyles}
                  />
                  {errors.experience && (
                    <Field.ErrorText>{errors.experience}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root
                  gridColumn={{ base: "1", md: "1 / -1" }}
                  invalid={!!errors.specialization}
                >
                  <Field.Label>
                    <HStack>
                      <LuUserCheck
                        color={colorMode === "dark" ? "white" : "gray.500"}
                      />
                      <Text
                        color={colorMode === "dark" ? "gray.300" : "gray.700"}
                      >
                        Specialization *
                      </Text>
                    </HStack>
                  </Field.Label>
                  <Input
                    value={profileData.specialization}
                    onChange={(e) =>
                      handleInputChange("specialization", e.target.value)
                    }
                    placeholder="Enter your specialization"
                    {...inputStyles}
                  />
                  {errors.specialization && (
                    <Field.ErrorText>{errors.specialization}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root gridColumn={{ base: "1", md: "1 / -1" }}>
                  <Field.Label
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    Bio
                  </Field.Label>
                  <Textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    {...inputStyles}
                  />
                </Field.Root>
              </SimpleGrid>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}

      {userRole === "admin" && (
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <Card.Body p="6">
            <VStack spacing="6" align="stretch">
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Administrative Information
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <Field.Root invalid={!!errors.designation}>
                  <Field.Label
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    Designation *
                  </Field.Label>
                  <Input
                    value={profileData.designation}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                    placeholder="Enter your designation"
                    {...inputStyles}
                  />
                  {errors.designation && (
                    <Field.ErrorText>{errors.designation}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root>
                  <Field.Label
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    Department
                  </Field.Label>
                  <Input
                    value={profileData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    placeholder="Enter your department"
                    {...inputStyles}
                  />
                </Field.Root>
              </SimpleGrid>
            </VStack>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  );
};

export default ProfileSettingsTable;
