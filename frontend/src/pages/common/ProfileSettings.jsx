import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Card,
  Avatar,
  Alert,
  Spinner,
  Dialog,
  Portal,
  Image,
} from "@chakra-ui/react";
import { LuImagePlus, LuTrash, LuSave, LuX } from "react-icons/lu";
import { useColorMode } from "../../components/ui/color-mode";
import CropModal from "../../components/CropModal";
import ProfileSettingsTable from "./ProfileSettingsTable";
import userService from "../../services/users";

const ProfileSettings = ({ userRole }) => {
  const { colorMode } = useColorMode();
  const fileInputRef = useRef(null);

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showExpandedImage, setShowExpandedImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileData, setProfileData] = useState({
    // Common fields
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    alternatePhoneNumber: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    gender: "",
    nationality: "",
    profileImageUrl: "",

    // Role-specific fields
    // Student fields
    dateOfBirth: "",
    parentName: "",
    parentPhoneNumber: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phoneNumber: "",
    },

    // Teacher fields
    qualification: "",
    experience: "",
    specialization: "",
    bio: "",

    // Admin fields
    designation: "",
    department: "",
  });

  // Validation function based on UserDetails model
  const validateProfile = () => {
    const newErrors = {};

    // Common required fields
    if (!profileData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!profileData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!profileData.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[\d\s\-()]+$/.test(profileData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    // Role-specific validation
    if (userRole === "student") {
      if (!profileData.dateOfBirth) {
        newErrors.dateOfBirth = "Date of birth is required";
      }
      if (!profileData.parentName?.trim()) {
        newErrors.parentName = "Parent/Guardian name is required";
      }
      if (!profileData.parentPhoneNumber?.trim()) {
        newErrors.parentPhoneNumber = "Parent phone number is required";
      } else if (!/^\+?[\d\s\-()]+$/.test(profileData.parentPhoneNumber)) {
        newErrors.parentPhoneNumber = "Please enter a valid phone number";
      }
    }

    if (userRole === "teacher") {
      if (!profileData.qualification?.trim()) {
        newErrors.qualification = "Qualification is required";
      }
      if (!profileData.experience && profileData.experience !== 0) {
        newErrors.experience = "Experience is required";
      } else if (profileData.experience < 0) {
        newErrors.experience = "Experience cannot be negative";
      }
      if (!profileData.specialization?.trim()) {
        newErrors.specialization = "Specialization is required";
      }
    }

    if (userRole === "admin") {
      if (!profileData.designation?.trim()) {
        newErrors.designation = "Designation is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch profile data from database
  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        console.log("Fetching profile data from API...");

        // Try to fetch from API first
        try {
          const response = await userService.getProfile();
          console.log("API Response:", response);

          if (response && response.success && isMounted) {
            const userData = response.user || {};
            const userDetails = response.userDetails || {};

            setProfileData({
              // Common fields
              firstName: userData.firstName || userDetails.firstName || "",
              lastName: userData.lastName || userDetails.lastName || "",
              email: userData.email || "",
              phoneNumber: userDetails.phoneNumber || "",
              alternatePhoneNumber: userDetails.alternatePhoneNumber || "",
              address: userDetails.address || {
                street: "",
                city: "",
                state: "",
                country: "",
                zipCode: "",
              },
              gender: userDetails.gender || "",
              nationality: userDetails.nationality || "",
              profileImageUrl:
                userDetails.profileImageUrl || userData.profileImageUrl || "",

              // Role-specific fields
              // Student fields
              dateOfBirth: userDetails.dateOfBirth
                ? userDetails.dateOfBirth.split("T")[0]
                : "",
              parentName: userDetails.parentName || "",
              parentPhoneNumber: userDetails.parentPhoneNumber || "",
              emergencyContact: userDetails.emergencyContact || {
                name: "",
                relationship: "",
                phoneNumber: "",
              },

              // Teacher fields
              qualification: userDetails.qualification || "",
              experience: userDetails.experience || "",
              specialization: userDetails.specialization || "",
              bio: userDetails.bio || "",

              // Admin fields
              designation: userDetails.designation || "",
              department: userDetails.department || "",
            });
            console.log("Profile data set from API");
            return;
          }
        } catch (apiError) {
          console.log(
            "API call failed, falling back to localStorage:",
            apiError
          );
        }

        // Fallback to localStorage if API fails
        if (isMounted) {
          const userData = localStorage.getItem("user");
          console.log("Raw localStorage data:", userData);

          if (userData) {
            try {
              const user = JSON.parse(userData);
              console.log("Parsed user data from localStorage:", user);

              setProfileData((prev) => ({
                ...prev,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                email: user.email || "",
                profileImageUrl: user.profileImageUrl || "",
                // Add some basic data so form isn't completely empty
                phoneNumber: user.phoneNumber || "",
              }));

              console.log("Profile data updated with localStorage data");
            } catch (parseError) {
              console.error("Error parsing user data:", parseError);
            }
          } else {
            console.log("No user data found in localStorage");
          }
        }
      } catch (error) {
        console.error("Error in fetchProfileData:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfileData();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    console.log("File selected:", file);

    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setAlert({
          type: "error",
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        console.log(
          "Image loaded, setting selected image and showing crop modal"
        );
        setSelectedImage(reader.result);
        setShowCropModal(true);
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setAlert({
          type: "error",
          title: "File Read Error",
          description: "Failed to read the selected image file.",
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value so the same file can be selected again
    event.target.value = "";
  };

  // Handle image removal
  const handleRemoveImage = async () => {
    try {
      // Try API call first
      try {
        const response = await userService.deleteProfileImage();
        console.log("Delete response:", response);

        if (response && response.success) {
          setProfileData((prev) => ({
            ...prev,
            profileImageUrl: "",
          }));

          // Update localStorage
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...currentUser,
              profileImageUrl: "",
            })
          );

          setAlert({
            type: "success",
            title: "Image Removed",
            description: "Your profile image has been removed successfully.",
          });
          return;
        }
      } catch (apiError) {
        console.error("API delete failed:", apiError);
        setAlert({
          type: "error",
          title: "Remove Failed",
          description: `Failed to remove profile image: ${apiError.message}`,
        });
      }
    } catch (error) {
      console.error("Error removing image:", error);
      setAlert({
        type: "error",
        title: "Remove Failed",
        description: "Failed to remove profile image. Please try again.",
      });
    }
  };

  const handleInputChange = (field, value, nested = null) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    if (nested) {
      setProfileData((prev) => ({
        ...prev,
        [nested]: {
          ...prev[nested],
          [field]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleCropComplete = async (croppedImageBlob) => {
    try {
      console.log("Starting image upload...", croppedImageBlob);

      // Convert blob to File object with proper name and type
      const timestamp = Date.now();
      const fileName = `profile-${timestamp}.jpeg`;
      const croppedImageFile = new File([croppedImageBlob], fileName, {
        type: "image/jpeg",
        lastModified: timestamp,
      });

      console.log("Created file object:", {
        name: croppedImageFile.name,
        type: croppedImageFile.type,
        size: croppedImageFile.size,
      });

      // Try to upload to server first
      try {
        const response = await userService.uploadProfileImage(croppedImageFile);
        console.log("Upload response:", response);

        if (response && response.success) {
          setProfileData((prev) => ({
            ...prev,
            profileImageUrl: response.profileImageUrl,
          }));

          // Update localStorage
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...currentUser,
              profileImageUrl: response.profileImageUrl,
            })
          );

          setAlert({
            type: "success",
            title: "Profile Image Updated",
            description: "Your profile image has been updated successfully.",
          });

          // Close the crop modal
          setShowCropModal(false);
          setSelectedImage(null);
          return;
        }
      } catch (apiError) {
        console.error("API upload failed:", apiError);
        setAlert({
          type: "error",
          title: "Upload Failed",
          description: `Failed to upload profile image: ${apiError.message}`,
        });
      }

      // Close the crop modal even if upload failed
      setShowCropModal(false);
      setSelectedImage(null);
    } catch (error) {
      console.error("Error processing image:", error);
      setAlert({
        type: "error",
        title: "Upload Failed",
        description: "Failed to process profile image. Please try again.",
      });

      // Close the crop modal
      setShowCropModal(false);
      setSelectedImage(null);
    }
  };

  const handleSave = async () => {
    // Validate before saving
    if (!validateProfile()) {
      setAlert({
        type: "error",
        title: "Validation Error",
        description: "Please fix the errors below before saving.",
      });
      return;
    }

    try {
      setSaving(true);
      console.log("Saving profile data:", profileData);

      try {
        const response = await userService.updateProfile(profileData);

        if (response && response.success) {
          setAlert({
            type: "success",
            title: "Profile Updated",
            description: "Your profile has been updated successfully.",
          });

          // Update localStorage user data
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...currentUser,
              firstName: profileData.firstName,
              lastName: profileData.lastName,
              profileImageUrl: profileData.profileImageUrl,
            })
          );
          return;
        }
      } catch (apiError) {
        console.log("API update failed, saving locally:", apiError);
      }

      // Fallback: save to localStorage for demo
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...currentUser,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          profileImageUrl: profileData.profileImageUrl,
        })
      );

      setAlert({
        type: "success",
        title: "Profile Updated",
        description: "Your profile has been saved locally.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      setAlert({
        type: "error",
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="50vh">
        <VStack spacing="4">
          <Spinner size="xl" color="teal.500" />
          <Text>Loading profile...</Text>
        </VStack>
      </Box>
    );
  }

  // Debug: Log current profile data
  console.log("Current profileData state:", profileData);

  return (
    <>
      <VStack spacing="6" align="stretch">
        {/* Alert */}
        {alert && (
          <Alert.Root
            status={alert.type}
            rounded="md"
            bg={
              alert.type === "success"
                ? colorMode === "dark"
                  ? "green.900"
                  : "green.50"
                : colorMode === "dark"
                ? "red.900"
                : "red.50"
            }
            borderColor={
              alert.type === "success"
                ? colorMode === "dark"
                  ? "green.700"
                  : "green.200"
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

        {/* Profile Image Section */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <Card.Body p="6">
            <VStack spacing="4" align="center">
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Profile Picture
              </Text>

              <Box
                cursor="pointer"
                onClick={() => setShowExpandedImage(true)}
                _hover={{
                  transform: "scale(1.05)",
                }}
                transition="all 0.2s"
                title="Click to view full size"
              >
                <Avatar.Root size="2xl">
                  {profileData.profileImageUrl ? (
                    <Avatar.Image
                      src={profileData.profileImageUrl}
                      alt={`${profileData.firstName} ${profileData.lastName}`}
                    />
                  ) : null}
                  <Avatar.Fallback
                    name={`${profileData.firstName} ${profileData.lastName}`}
                    bg={colorMode === "dark" ? "gray.600" : "gray.200"}
                    color={colorMode === "dark" ? "white" : "gray.700"}
                  >
                    {`${profileData.firstName?.charAt(0) || ""}${
                      profileData.lastName?.charAt(0) || ""
                    }`.toUpperCase() || "U"}
                  </Avatar.Fallback>
                </Avatar.Root>
              </Box>

              <HStack spacing="3">
                <Button
                  size="sm"
                  variant="solid"
                  bg="#0d9488"
                  color="white"
                  _hover={{
                    bg: "#0f766e",
                    transform: "translateY(-1px)",
                  }}
                  _active={{
                    bg: "#134e4a",
                    transform: "translateY(0)",
                  }}
                  shadow="md"
                  onClick={() => {
                    console.log("Change image button clicked");
                    fileInputRef.current?.click();
                  }}
                >
                  <LuImagePlus />
                  Change Image
                </Button>
                {profileData.profileImageUrl && (
                  <Button
                    size="sm"
                    variant="solid"
                    bg="#dc2626"
                    color="white"
                    _hover={{
                      bg: "#b91c1c",
                      transform: "translateY(-1px)",
                    }}
                    _active={{
                      bg: "#991b1b",
                      transform: "translateY(0)",
                    }}
                    shadow="md"
                    onClick={handleRemoveImage}
                  >
                    <LuTrash />
                    Remove Image
                  </Button>
                )}
              </HStack>

              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.500"}
                textAlign="center"
              >
                Click on the image to view full size, or use the buttons to
                manage your profile picture
              </Text>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: "none" }}
              />
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Profile Settings Table */}
        <ProfileSettingsTable
          userRole={userRole}
          profileData={profileData}
          handleInputChange={handleInputChange}
          errors={errors}
        />

        {/* Save Button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            size="lg"
            bg="#0d9488"
            color="white"
            _hover={{
              bg: "#0f766e",
              transform: "translateY(-1px)",
            }}
            _active={{
              bg: "#134e4a",
              transform: "translateY(0)",
            }}
            shadow="lg"
            onClick={handleSave}
            loading={saving}
            loadingText="Saving..."
            px="8"
          >
            <LuSave />
            Save Profile
          </Button>
        </Box>
      </VStack>

      {/* Crop Modal */}
      <CropModal
        isOpen={showCropModal}
        onClose={() => {
          console.log("Closing crop modal");
          setShowCropModal(false);
          setSelectedImage(null);
        }}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
        cropShape="round"
      />

      {/* Expanded Image Modal */}
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
                  {profileData.profileImageUrl ? (
                    <Image
                      src={profileData.profileImageUrl}
                      alt={`${profileData.firstName} ${profileData.lastName}`}
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
                            name={`${profileData.firstName} ${profileData.lastName}`}
                            bg={colorMode === "dark" ? "gray.600" : "gray.300"}
                            color={colorMode === "dark" ? "white" : "gray.700"}
                            fontSize={{ base: "4xl", md: "6xl" }}
                          >
                            {`${profileData.firstName?.charAt(0) || ""}${
                              profileData.lastName?.charAt(0) || ""
                            }`.toUpperCase() || "U"}
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
                            {profileData.firstName} {profileData.lastName}
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

                  {/* Close Button */}
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
                    <LuX />
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
                      {profileData.firstName} {profileData.lastName}
                    </Text>
                    <Text
                      color="whiteAlpha.800"
                      fontSize="xs"
                      textAlign="center"
                      mt="1"
                    >
                      {userRole} • {profileData.email}
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

export default ProfileSettings;
