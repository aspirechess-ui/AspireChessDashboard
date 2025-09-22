import React from "react";
import {
  Dialog,
  Button,
  Text,
  VStack,
  HStack,
  Portal,
  Alert,
} from "@chakra-ui/react";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { useColorMode } from "./ui/color-mode";

const DeletePrompt = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName = "",
  isLoading = false,
  confirmText = "Delete",
  cancelText = "Cancel",
}) => {
  const { colorMode } = useColorMode();

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            maxW={{ base: "90vw", sm: "md" }}
            mx="auto"
            position="fixed"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            textAlign="center"
          >
            <Dialog.Header pb="4">
              <VStack spacing="3" align="center" w="full" textAlign="center">
                <Alert.Root
                  status="error"
                  variant="subtle"
                  rounded="full"
                  w="16"
                  h="16"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={colorMode === "dark" ? "red.900" : "red.50"}
                  borderColor={colorMode === "dark" ? "red.700" : "red.200"}
                  mx="auto"
                >
                  <FaExclamationTriangle
                    size="24"
                    color={colorMode === "dark" ? "#f87171" : "#dc2626"}
                  />
                </Alert.Root>
                <Dialog.Title
                  fontSize="lg"
                  fontWeight="semibold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  textAlign="center"
                  w="full"
                >
                  {title}
                </Dialog.Title>
              </VStack>
            </Dialog.Header>

            <Dialog.Body py="4">
              <VStack spacing="3" align="center" w="full" textAlign="center">
                <Text
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  fontSize="sm"
                  lineHeight="1.6"
                  textAlign="center"
                  w="full"
                >
                  {description}
                </Text>
                {itemName && (
                  <Text
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    fontSize="sm"
                    bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                    px="3"
                    py="1"
                    rounded="md"
                    textAlign="center"
                    mx="auto"
                  >
                    "{itemName}"
                  </Text>
                )}
                <Text
                  fontSize="xs"
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                  fontStyle="italic"
                  textAlign="center"
                  w="full"
                >
                  This action cannot be undone.
                </Text>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer pt="4">
              <HStack
                spacing="3"
                w="full"
                justify="center"
                flexDirection={{ base: "column-reverse", sm: "row" }}
              >
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                    w={{ base: "full", sm: "auto" }}
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.700" : "gray.50",
                    }}
                  >
                    {cancelText}
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  onClick={onConfirm}
                  loading={isLoading}
                  loadingText="Deleting..."
                  w={{ base: "full", sm: "auto" }}
                  leftIcon={<FaTrash />}
                >
                  {confirmText}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default DeletePrompt;
