import React, { useState } from "react";
import {
  Dialog,
  Button,
  Text,
  VStack,
  HStack,
  Portal,
  Avatar,
  Badge,
  SimpleGrid,
  Box,
  Separator,
  Image,
} from "@chakra-ui/react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaGraduationCap,
  FaUserTie,
  FaUserShield,
  FaTimes,
  FaMapMarkerAlt,
  FaIdCard,
} from "react-icons/fa";
import { useColorMode } from "./ui/color-mode";

const ViewUserCard = ({ isOpen, onClose, user }) => {
  const { colorMode } = useColorMode();
  const [showExpandedImage, setShowExpandedImage] = useState(false);

  if (!user) return null;

  const getAssignedBatch = () => {
    // Try different possible locations for batch information
    if (user.assignedBatch) {
      // If assignedBatch is an object with batchName
      if (
        typeof user.assignedBatch === "object" &&
        user.assignedBatch.batchName
      ) {
        return user.assignedBatch.batchName;
      }
      // If assignedBatch is a string
      if (typeof user.assignedBatch === "string") {
        return user.assignedBatch;
      }
    }

    // Check for batchName directly on user
    if (user.batchName) {
      return user.batchName;
    }

    // Check userDetails for batch info
    if (user.userDetails?.assignedBatch) {
      if (
        typeof user.userDetails.assignedBatch === "object" &&
        user.userDetails.assignedBatch.batchName
      ) {
        return user.userDetails.assignedBatch.batchName;
      }
      if (typeof user.userDetails.assignedBatch === "string") {
        return user.userDetails.assignedBatch;
      }
    }

    if (user.userDetails?.batchName) {
      return user.userDetails.batchName;
    }

    return "Not assigned";
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <FaUserShield />;
      case "teacher":
        return <FaUserTie />;
      case "student":
        return <FaGraduationCap />;
      default:
        return <FaUser />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "red";
      case "teacher":
        return "blue";
      case "student":
        return "green";
      default:
        return "gray";
    }
  };

  const InfoItem = ({ icon, label, value, fullWidth = false }) => {
    if (!value) return null;

    return (
      <Box
        gridColumn={fullWidth ? "1 / -1" : "auto"}
        p="3"
        bg={colorMode === "dark" ? "gray.700" : "gray.50"}
        rounded="md"
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
      >
        <HStack spacing="3" align="start">
          <Box
            color={colorMode === "dark" ? "teal.300" : "teal.600"}
            fontSize="sm"
            mt="1"
          >
            {icon}
          </Box>
          <VStack align="start" spacing="1" flex="1" minW="0">
            <Text
              fontSize="xs"
              fontWeight="medium"
              color={colorMode === "dark" ? "gray.400" : "gray.500"}
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {label}
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "white" : "gray.900"}
              wordBreak="break-word"
            >
              {value}
            </Text>
          </VStack>
        </HStack>
      </Box>
    );
  };

  return (
    <>
      <Dialog.Root
        open={isOpen}
        onOpenChange={({ open }) => !open && onClose()}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              bg={colorMode === "dark" ? "gray.800" : "white"}
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              maxW={{ base: "95vw", md: "2xl" }}
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
                  <Dialog.Title
                    fontSize="lg"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    User Profile
                  </Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    >
                      <FaTimes />
                    </Button>
                  </Dialog.CloseTrigger>
                </HStack>
              </Dialog.Header>

              <Dialog.Body py="6" overflowY="auto">
                <VStack spacing="6" align="stretch">
                  {/* Profile Header */}
                  <VStack spacing="4" align="center">
                    <Box
                      position="relative"
                      cursor="pointer"
                      onClick={() => setShowExpandedImage(true)}
                      _hover={{
                        transform: "scale(1.05)",
                      }}
                      transition="all 0.2s"
                      title="Click to view full size"
                    >
                      <Avatar.Root size="2xl">
                        {user.userDetails?.profileImageUrl ||
                        user.profileImageUrl ? (
                          <Avatar.Image
                            src={
                              user.userDetails?.profileImageUrl ||
                              user.profileImageUrl
                            }
                            alt={`${
                              user.userDetails?.firstName || user.firstName
                            } ${user.userDetails?.lastName || user.lastName}`}
                          />
                        ) : null}
                        <Avatar.Fallback
                          name={`${
                            user.userDetails?.firstName || user.firstName
                          } ${user.userDetails?.lastName || user.lastName}`}
                          bg={colorMode === "dark" ? "gray.600" : "gray.200"}
                          color={colorMode === "dark" ? "white" : "gray.700"}
                        >
                          {`${
                            (
                              user.userDetails?.firstName || user.firstName
                            )?.charAt(0) || ""
                          }${
                            (
                              user.userDetails?.lastName || user.lastName
                            )?.charAt(0) || ""
                          }`.toUpperCase() ||
                            user.email?.charAt(0).toUpperCase() ||
                            "U"}
                        </Avatar.Fallback>
                      </Avatar.Root>
                    </Box>

                    <VStack spacing="2" align="center">
                      <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        textAlign="center"
                      >
                        {user.userDetails?.firstName || user.firstName}{" "}
                        {user.userDetails?.lastName || user.lastName}
                      </Text>
                      <Badge
                        colorPalette={getRoleColor(user.role || "student")}
                        variant="subtle"
                        size="sm"
                      >
                        <HStack spacing="1">
                          {getRoleIcon(user.role || "student")}
                          <Text fontSize="sm" textTransform="capitalize">
                            {user.role || "Student"}
                          </Text>
                        </HStack>
                      </Badge>
                      <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.400" : "gray.500"}
                      >
                        Joined{" "}
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : user.enrolledAt
                          ? new Date(user.enrolledAt).toLocaleDateString()
                          : "Unknown Date"}
                      </Text>
                    </VStack>
                  </VStack>

                  <Separator />

                  {/* Basic Information */}
                  <VStack spacing="4" align="stretch">
                    <Text
                      fontSize="md"
                      fontWeight="semibold"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      Basic Information
                    </Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                      <InfoItem
                        icon={<FaEnvelope />}
                        label="Email"
                        value={user.email}
                      />
                      <InfoItem
                        icon={<FaPhone />}
                        label="Phone Number"
                        value={
                          user.userDetails?.phoneNumber || user.phoneNumber
                        }
                      />
                      <InfoItem
                        icon={<FaPhone />}
                        label="Alternate Phone"
                        value={user.userDetails?.alternatePhoneNumber}
                      />
                      <InfoItem
                        icon={<FaCalendarAlt />}
                        label="Date of Birth"
                        value={
                          user.userDetails?.dateOfBirth || user.dateOfBirth
                            ? new Date(
                                user.userDetails?.dateOfBirth ||
                                  user.dateOfBirth
                              ).toLocaleDateString()
                            : null
                        }
                      />
                      <InfoItem
                        icon={<FaUser />}
                        label="Gender"
                        value={
                          user.userDetails?.gender || user.gender
                            ? (user.userDetails?.gender || user.gender)
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())
                            : null
                        }
                      />
                      <InfoItem
                        icon={<FaUser />}
                        label="Nationality"
                        value={user.userDetails?.nationality}
                      />
                    </SimpleGrid>
                  </VStack>

                  {/* Address Information */}
                  {user.userDetails?.address &&
                    (user.userDetails.address.street ||
                      user.userDetails.address.city ||
                      user.userDetails.address.state ||
                      user.userDetails.address.country ||
                      user.userDetails.address.zipCode) && (
                      <>
                        <Separator />
                        <VStack spacing="4" align="stretch">
                          <Text
                            fontSize="md"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            Address Information
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                            <InfoItem
                              icon={<FaMapMarkerAlt />}
                              label="Street Address"
                              value={user.userDetails.address.street}
                            />
                            <InfoItem
                              icon={<FaMapMarkerAlt />}
                              label="City"
                              value={user.userDetails.address.city}
                            />
                            <InfoItem
                              icon={<FaMapMarkerAlt />}
                              label="State"
                              value={user.userDetails.address.state}
                            />
                            <InfoItem
                              icon={<FaMapMarkerAlt />}
                              label="Country"
                              value={user.userDetails.address.country}
                            />
                            <InfoItem
                              icon={<FaIdCard />}
                              label="ZIP Code"
                              value={user.userDetails.address.zipCode}
                            />
                          </SimpleGrid>
                        </VStack>
                      </>
                    )}

                  {/* Emergency Contact Information */}
                  {user.userDetails?.emergencyContact &&
                    (user.userDetails.emergencyContact.name ||
                      user.userDetails.emergencyContact.relationship ||
                      user.userDetails.emergencyContact.phoneNumber) && (
                      <>
                        <Separator />
                        <VStack spacing="4" align="stretch">
                          <Text
                            fontSize="md"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            Emergency Contact
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                            <InfoItem
                              icon={<FaUser />}
                              label="Contact Name"
                              value={user.userDetails.emergencyContact.name}
                            />
                            <InfoItem
                              icon={<FaUser />}
                              label="Relationship"
                              value={
                                user.userDetails.emergencyContact.relationship
                              }
                            />
                            <InfoItem
                              icon={<FaPhone />}
                              label="Contact Phone"
                              value={
                                user.userDetails.emergencyContact.phoneNumber
                              }
                            />
                          </SimpleGrid>
                        </VStack>
                      </>
                    )}

                  {/* Teacher Information */}
                  {user.role === "teacher" &&
                    (user.userDetails?.qualification ||
                      user.userDetails?.experience ||
                      user.userDetails?.specialization ||
                      user.userDetails?.bio) && (
                      <>
                        <Separator />
                        <VStack spacing="4" align="stretch">
                          <Text
                            fontSize="md"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            Teacher Information
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                            <InfoItem
                              icon={<FaGraduationCap />}
                              label="Qualification"
                              value={user.userDetails?.qualification}
                            />
                            <InfoItem
                              icon={<FaUserTie />}
                              label="Experience"
                              value={
                                user.userDetails?.experience
                                  ? `${user.userDetails.experience} years`
                                  : null
                              }
                            />
                            <InfoItem
                              icon={<FaGraduationCap />}
                              label="Specialization"
                              value={user.userDetails?.specialization}
                            />
                            <InfoItem
                              icon={<FaUser />}
                              label="Bio"
                              value={user.userDetails?.bio}
                              fullWidth={true}
                            />
                          </SimpleGrid>
                        </VStack>
                      </>
                    )}

                  {/* Admin Information */}
                  {user.role === "admin" &&
                    (user.userDetails?.designation ||
                      user.userDetails?.department) && (
                      <>
                        <Separator />
                        <VStack spacing="4" align="stretch">
                          <Text
                            fontSize="md"
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            Administrative Information
                          </Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                            <InfoItem
                              icon={<FaUserShield />}
                              label="Designation"
                              value={user.userDetails?.designation}
                            />
                            <InfoItem
                              icon={<FaUserShield />}
                              label="Department"
                              value={user.userDetails?.department}
                            />
                          </SimpleGrid>
                        </VStack>
                      </>
                    )}

                  {/* Student Information - Show for all users if data is available */}
                  {(user.assignedBatch ||
                    user.batchName ||
                    user.userDetails?.parentName ||
                    user.parentName ||
                    user.userDetails?.parentPhoneNumber ||
                    user.parentPhoneNumber) && (
                    <>
                      <Separator />
                      <VStack spacing="4" align="stretch">
                        <Text
                          fontSize="md"
                          fontWeight="semibold"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          Student Information
                        </Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                          <InfoItem
                            icon={<FaGraduationCap />}
                            label="Assigned Batch"
                            value={getAssignedBatch()}
                          />
                          <InfoItem
                            icon={<FaUser />}
                            label="Parent/Guardian Name"
                            value={
                              user.userDetails?.parentName || user.parentName
                            }
                          />
                          <InfoItem
                            icon={<FaPhone />}
                            label="Parent Phone Number"
                            value={
                              user.userDetails?.parentPhoneNumber ||
                              user.parentPhoneNumber
                            }
                          />
                        </SimpleGrid>
                      </VStack>
                    </>
                  )}
                </VStack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      {/* Expanded Image Modal - Full Screen with Theme Support */}

      {showExpandedImage && (
        <Dialog.Root
          open={true}
          onOpenChange={({ open }) => !open && setShowExpandedImage(false)}
        >
          <Portal>
            <Dialog.Backdrop
              bg={colorMode === "dark" ? "blackAlpha.900" : "blackAlpha.800"}
              backdropFilter="blur(4px)"
            />
            <Dialog.Positioner>
              <Dialog.Content
                bg="transparent"
                shadow="none"
                w="100vw"
                h="100vh"
                maxW="100vw"
                maxH="100vh"
                p="0"
                m="0"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Box
                  position="relative"
                  w="100vw"
                  h="100vh"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  onClick={() => setShowExpandedImage(false)}
                  cursor="pointer"
                >
                  {user.userDetails?.profileImageUrl || user.profileImageUrl ? (
                    <Image
                      src={
                        user.userDetails?.profileImageUrl ||
                        user.profileImageUrl
                      }
                      alt={`${user.userDetails?.firstName || user.firstName} ${
                        user.userDetails?.lastName || user.lastName
                      }`}
                      maxW={{ base: "90vw", md: "80vw" }}
                      maxH={{ base: "90vh", md: "80vh" }}
                      objectFit="contain"
                      rounded={{ base: "md", md: "lg" }}
                      shadow="2xl"
                      bg={colorMode === "dark" ? "gray.800" : "white"}
                      p="4"
                      onClick={(e) => e.stopPropagation()}
                      cursor="default"
                    />
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      w={{ base: "80vw", md: "400px" }}
                      h={{ base: "60vh", md: "400px" }}
                      maxW="500px"
                      maxH="500px"
                      bg={colorMode === "dark" ? "gray.700" : "gray.200"}
                      rounded="xl"
                      shadow="2xl"
                      onClick={(e) => e.stopPropagation()}
                      cursor="default"
                    >
                      <VStack spacing="6">
                        <Avatar.Root size={{ base: "2xl", md: "3xl" }}>
                          <Avatar.Fallback
                            name={`${
                              user.userDetails?.firstName || user.firstName
                            } ${user.userDetails?.lastName || user.lastName}`}
                            bg={colorMode === "dark" ? "gray.600" : "gray.300"}
                            color={colorMode === "dark" ? "white" : "gray.700"}
                            fontSize={{ base: "4xl", md: "6xl" }}
                          >
                            {`${
                              (
                                user.userDetails?.firstName || user.firstName
                              )?.charAt(0) || ""
                            }${
                              (
                                user.userDetails?.lastName || user.lastName
                              )?.charAt(0) || ""
                            }`.toUpperCase() ||
                              user.email?.charAt(0).toUpperCase() ||
                              "U"}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <VStack spacing="2">
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.600"
                            }
                            fontSize={{ base: "lg", md: "xl" }}
                            textAlign="center"
                            fontWeight="medium"
                          >
                            {user.userDetails?.firstName || user.firstName}{" "}
                            {user.userDetails?.lastName || user.lastName}
                          </Text>
                          <Text
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.500"
                            }
                            fontSize={{ base: "sm", md: "md" }}
                            textAlign="center"
                          >
                            No Profile Image
                          </Text>
                        </VStack>
                      </VStack>
                    </Box>
                  )}

                  {/* Close Button - Theme Aware */}
                  <Button
                    position="absolute"
                    top={{ base: "2", md: "4" }}
                    right={{ base: "2", md: "4" }}
                    size={{ base: "sm", md: "md" }}
                    variant="solid"
                    bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.600" : "gray.200",
                    }}
                    shadow="lg"
                    borderRadius="full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowExpandedImage(false);
                    }}
                    zIndex="10"
                  >
                    <FaTimes />
                  </Button>

                  {/* User Info Overlay - Mobile */}
                  <Box
                    position="absolute"
                    bottom={{ base: "2", md: "4" }}
                    left={{ base: "2", md: "4" }}
                    right={{ base: "2", md: "4" }}
                    bg={
                      colorMode === "dark" ? "blackAlpha.700" : "blackAlpha.600"
                    }
                    backdropFilter="blur(8px)"
                    rounded="md"
                    p="3"
                    display={{ base: "block", md: "none" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Text
                      color="white"
                      fontWeight="semibold"
                      fontSize="sm"
                      textAlign="center"
                    >
                      {user.userDetails?.firstName || user.firstName}{" "}
                      {user.userDetails?.lastName || user.lastName}
                    </Text>
                    <Text
                      color="whiteAlpha.800"
                      fontSize="xs"
                      textAlign="center"
                      mt="1"
                    >
                      {user.role || "Student"} • {user.email}
                    </Text>
                  </Box>

                  {/* Tap to close hint - Mobile */}
                  <Text
                    position="absolute"
                    top="2"
                    left="50%"
                    transform="translateX(-50%)"
                    color="whiteAlpha.700"
                    fontSize="xs"
                    display={{ base: "block", md: "none" }}
                    bg="blackAlpha.500"
                    px="2"
                    py="1"
                    rounded="full"
                    backdropFilter="blur(4px)"
                  >
                    Tap anywhere to close
                  </Text>
                </Box>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      )}
    </>
  );
};

export default ViewUserCard;
