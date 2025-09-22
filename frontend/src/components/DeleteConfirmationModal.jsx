import React from "react";
import {
  Box,
  Button,
  Text,
  Heading,
  VStack,
  HStack,
  Dialog,
  Portal,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaExclamationTriangle, FaTrash } from "react-icons/fa";
import { useColorMode } from "./ui/color-mode";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  description = "Are you sure you want to delete this item?",
  itemName = "",
  confirmText = "Delete",
  isLoading = false,
}) => {
  const { colorMode } = useColorMode();

  // Responsive breakpoints
  const iconSize = useBreakpointValue({ base: "40", md: "48" });
  const padding = useBreakpointValue({ base: 6, md: 8 });
  const buttonSize = useBreakpointValue({ base: "md", md: "lg" });

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            shadow={colorMode === "dark" ? "2xl" : "xl"}
            mx="auto"
            my={8}
            maxW={{ base: "90vw", sm: "400px", md: "450px" }}
            w="full"
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
          >
            <Dialog.Header p={0}>
              <VStack spacing={padding} align="center" p={padding} pb={4}>
                {/* Warning Icon */}
                <Box
                  p={4}
                  borderRadius="full"
                  bg={colorMode === "dark" ? "red.900" : "red.50"}
                  border="2px solid"
                  borderColor={colorMode === "dark" ? "red.700" : "red.200"}
                >
                  <FaExclamationTriangle
                    size={iconSize}
                    color={colorMode === "dark" ? "#FCA5A5" : "#DC2626"}
                  />
                </Box>

                {/* Title */}
                <Heading
                  size={{ base: "md", md: "lg" }}
                  textAlign="center"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  fontWeight="semibold"
                >
                  {title}
                </Heading>
              </VStack>
            </Dialog.Header>

            <Dialog.Body p={0}>
              <VStack spacing={4} align="center" px={padding} pb={2}>
                {/* Description */}
                <Text
                  textAlign="center"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  fontSize={{ base: "sm", md: "md" }}
                  lineHeight="relaxed"
                  maxW="350px"
                >
                  {description}
                </Text>

                {/* Item Name (if provided) */}
                {itemName && (
                  <Box
                    p={3}
                    bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    w="full"
                    maxW="300px"
                  >
                    <Text
                      textAlign="center"
                      fontWeight="medium"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      fontSize={{ base: "sm", md: "md" }}
                      noOfLines={2}
                    >
                      "{itemName}"
                    </Text>
                  </Box>
                )}

                {/* Warning Text */}
                <Text
                  textAlign="center"
                  fontSize={{ base: "xs", md: "sm" }}
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                  fontStyle="italic"
                >
                  This action cannot be undone.
                </Text>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer p={0}>
              <VStack spacing={3} w="full" p={padding} pt={4}>
                {/* Action Buttons */}
                <HStack
                  spacing={3}
                  w="full"
                  justify="center"
                  flexDirection={{ base: "column", sm: "row" }}
                >
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    size={buttonSize}
                    w={{ base: "full", sm: "auto" }}
                    minW={{ sm: "100px" }}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    _hover={{
                      borderColor:
                        colorMode === "dark" ? "gray.500" : "gray.400",
                      bg: colorMode === "dark" ? "gray.700" : "gray.50",
                    }}
                    _focus={{
                      borderColor: "teal.500",
                      boxShadow: "0 0 0 1px teal.500",
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    colorScheme="red"
                    onClick={onConfirm}
                    disabled={isLoading}
                    loading={isLoading}
                    loadingText="Deleting..."
                    leftIcon={!isLoading ? <FaTrash /> : undefined}
                    size={buttonSize}
                    w={{ base: "full", sm: "auto" }}
                    minW={{ sm: "140px" }}
                    bg="red.500"
                    _hover={{
                      bg: "red.600",
                    }}
                    _active={{
                      bg: "red.700",
                    }}
                    _focus={{
                      boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    {isLoading ? "Deleting..." : confirmText}
                  </Button>
                </HStack>
              </VStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default DeleteConfirmationModal;
