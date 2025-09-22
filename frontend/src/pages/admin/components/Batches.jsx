import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Card,
  InputGroup,
  Spinner,
  Alert,
  Flex,
  IconButton,
  Badge,
  SimpleGrid,
  Table,
  Menu,
  Breadcrumb,
  Portal,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaUsers,
  FaEye,
  FaTrash,
  FaChevronRight,
  FaCopy,
  FaEyeSlash,
  FaSync,
} from "react-icons/fa";
import { LuArrowLeft } from "react-icons/lu";
import { MdApps, MdList, MdMoreVert } from "react-icons/md";
import { useColorMode } from "../../../components/ui/color-mode";
import { Tooltip } from "../../../components/ui/tooltip";
import batchService from "../../../services/batches";
import BatchesSettings from "./BatchesSettings";
import DeletePrompt from "../../../components/DeletePrompt";

const Batches = ({ refreshTrigger }) => {
  const { colorMode } = useColorMode();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("card");

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showBatchSettings, setShowBatchSettings] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [visibleCodes, setVisibleCodes] = useState({});

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await batchService.getBatches({
        limit: 50,
      });

      if (response.success) {
        setBatches(response.data);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
      setAlert({
        type: "error",
        title: "Error Loading Batches",
        description: "Unable to load batches. Please try again.",
      });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [refreshTrigger, fetchBatches]);

  const handleViewBatch = (batch) => {
    setSelectedBatch(batch);
    setShowBatchSettings(true);
  };

  const handleBackToBatches = () => {
    setShowBatchSettings(false);
    setSelectedBatch(null);
  };

  const handleDeleteBatch = (batch) => {
    console.log("handleDeleteBatch called with batch:", batch);
    console.log("Setting showDeleteModal to true");
    setSelectedBatch(batch);
    setShowDeleteModal(true);
    console.log("showDeleteModal state should now be true");
  };

  const toggleCodeVisibility = (batchId) => {
    setVisibleCodes((prev) => ({
      ...prev,
      [batchId]: !prev[batchId],
    }));
  };

  const copyToClipboard = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setAlert({
        type: "success",
        title: "Copied!",
        description: "Signup code copied to clipboard.",
      });
      setTimeout(() => setAlert(null), 2000);
    });
  };

  const handleToggleSignupCode = async (batch, e) => {
    e.stopPropagation();

    try {
      const response = await batchService.toggleSignupCodeStatus(
        batch._id,
        "Status toggled by admin"
      );

      if (response.success) {
        await fetchBatches();
        setAlert({
          type: "success",
          title: "Status Updated",
          description: `Signup code has been ${
            response.data.isActive ? "activated" : "deactivated"
          }.`,
        });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error("Error toggling signup code:", error);
      setAlert({
        type: "error",
        title: "Error",
        description: error.message || "Failed to update signup code status.",
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleResetSignupCode = async (batch, e) => {
    e.stopPropagation();

    try {
      const response = await batchService.resetSignupCode(
        batch._id,
        "Code reset by admin"
      );

      if (response.success) {
        await fetchBatches();
        setAlert({
          type: "success",
          title: "Code Reset",
          description: `New signup code generated: ${response.data.newSignupCode}`,
        });
        setTimeout(() => setAlert(null), 5000);
      }
    } catch (error) {
      console.error("Error resetting signup code:", error);
      setAlert({
        type: "error",
        title: "Error",
        description: error.message || "Failed to reset signup code.",
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const confirmDeleteBatch = async () => {
    if (!selectedBatch) return;

    console.log("confirmDeleteBatch called with selectedBatch:", selectedBatch);
    setDeleteLoading(true);
    try {
      console.log("Calling batchService.deleteBatch with:", selectedBatch._id);
      const response = await batchService.deleteBatch(
        selectedBatch._id,
        "Batch deleted by admin"
      );

      console.log("Delete response:", response);
      if (response.success) {
        await fetchBatches();
        setShowDeleteModal(false);
        setSelectedBatch(null);

        setAlert({
          type: "success",
          title: "Batch Deleted",
          description: `Batch "${selectedBatch.batchName}" has been marked for deletion.`,
        });
        setTimeout(() => setAlert(null), 4000);
      }
    } catch (error) {
      console.error("Error deleting batch:", error);
      setAlert({
        type: "error",
        title: "Failed to Delete Batch",
        description: error.message || "An unexpected error occurred.",
      });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (batch) => {
    if (batch.deletionStatus === "draft_deletion") {
      return <Badge colorPalette="orange">Marked for Deletion</Badge>;
    }
    if (batch.deletionStatus === "permanently_deleted") {
      return <Badge colorPalette="red">Permanently Deleted</Badge>;
    }
    if (!batch.isActive) {
      return <Badge colorPalette="gray">Inactive</Badge>;
    }
    return <Badge colorPalette="green">Active</Badge>;
  };

  const getSignupCodeStatus = (batch) => {
    const status = batch.signupCodeStatus;
    if (!status) return <Badge colorPalette="gray">No Status</Badge>;

    return status.isActive ? (
      <Badge colorPalette="green">Active</Badge>
    ) : (
      <Badge colorPalette="red">Inactive</Badge>
    );
  };

  const BatchCard = ({ batch }) => (
    <Card.Root
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderWidth="1px"
      borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      shadow={colorMode === "dark" ? "lg" : "sm"}
      cursor="pointer"
      onClick={() => handleViewBatch(batch)}
      _hover={{
        shadow: colorMode === "dark" ? "xl" : "md",
        transform: "translateY(-2px)",
      }}
      transition="all 0.2s"
    >
      <Card.Body p="4">
        <Flex justify="space-between" align="start" mb="3">
          <VStack align="start" spacing="1" flex="1">
            <Text
              fontWeight="semibold"
              fontSize="lg"
              color={colorMode === "dark" ? "white" : "gray.900"}
              noOfLines={1}
            >
              {batch.batchName}
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              {batch.academicYear}
            </Text>
          </VStack>
          <Box onClick={(e) => e.stopPropagation()}>
            <Menu.Root
              onSelect={(details) => {
                // Prevent card click from firing
                if (details.value === "view") {
                  handleViewBatch(batch);
                } else if (details.value === "delete") {
                  handleDeleteBatch(batch);
                }
              }}
            >
              <Menu.Trigger asChild>
                <IconButton
                  size="sm"
                  variant="ghost"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  _hover={{
                    bg: colorMode === "dark" ? "gray.700" : "gray.100",
                    color: colorMode === "dark" ? "gray.200" : "gray.700",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MdMoreVert />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                    shadow="lg"
                  >
                    <Menu.Item
                      value="view"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      _hover={{
                        bg: colorMode === "dark" ? "gray.700" : "gray.50",
                      }}
                    >
                      <FaEye />
                      View Details
                    </Menu.Item>
                    <Menu.Item
                      value="delete"
                      color="red.500"
                      _hover={{
                        bg: colorMode === "dark" ? "red.900" : "red.50",
                        color: "red.600",
                      }}
                    >
                      <FaTrash />
                      Delete
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Box>
        </Flex>

        {batch.description && (
          <Text
            fontSize="sm"
            color={colorMode === "dark" ? "gray.300" : "gray.700"}
            mb="3"
            noOfLines={2}
          >
            {batch.description}
          </Text>
        )}

        <VStack spacing="2" align="stretch">
          <HStack justify="space-between">
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              Students:
            </Text>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              {batch.hasStudentLimit
                ? `${batch.currentStudents}/${batch.maxStudents}`
                : batch.currentStudents}
            </Text>
          </HStack>

          <VStack spacing="2" align="stretch">
            <HStack justify="space-between">
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                Signup Code:
              </Text>
              {getSignupCodeStatus(batch)}
            </HStack>

            <HStack justify="space-between" align="center">
              <HStack flex="1">
                <Text
                  fontSize="sm"
                  fontFamily="mono"
                  fontWeight="bold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  {visibleCodes[batch._id] ? batch.signupCode : "••••••••"}
                </Text>
                <IconButton
                  size="xs"
                  variant="ghost"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  _hover={{
                    bg: colorMode === "dark" ? "gray.600" : "gray.100",
                    color: colorMode === "dark" ? "gray.200" : "gray.700",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCodeVisibility(batch._id);
                  }}
                >
                  {visibleCodes[batch._id] ? <FaEyeSlash /> : <FaEye />}
                </IconButton>
                <IconButton
                  size="xs"
                  variant="ghost"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  _hover={{
                    bg: colorMode === "dark" ? "gray.600" : "gray.100",
                    color: colorMode === "dark" ? "gray.200" : "gray.700",
                  }}
                  onClick={(e) => copyToClipboard(batch.signupCode, e)}
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </IconButton>
              </HStack>

              <HStack spacing="1">
                <Box
                  as="button"
                  w="8"
                  h="4"
                  bg={
                    batch.signupCodeStatus?.isActive ? "green.500" : "red.500"
                  }
                  borderRadius="full"
                  position="relative"
                  transition="all 0.2s"
                  onClick={(e) => handleToggleSignupCode(batch, e)}
                  cursor="pointer"
                  _hover={{ opacity: 0.8 }}
                >
                  <Box
                    w="3"
                    h="3"
                    bg="white"
                    borderRadius="full"
                    position="absolute"
                    top="0.5"
                    left={batch.signupCodeStatus?.isActive ? "4.5" : "0.5"}
                    transition="all 0.2s"
                  />
                </Box>
                <IconButton
                  size="xs"
                  variant="ghost"
                  onClick={(e) => handleResetSignupCode(batch, e)}
                  title="Reset code"
                  color="orange.500"
                  _hover={{
                    bg: colorMode === "dark" ? "orange.900" : "orange.50",
                    color: "orange.600",
                  }}
                >
                  <FaSync />
                </IconButton>
              </HStack>
            </HStack>
          </VStack>

          <HStack justify="space-between">
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              Status:
            </Text>
            {getStatusBadge(batch)}
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="50vh">
        <VStack spacing="4">
          <Spinner size="xl" color="teal.500" />
          <Text>Loading batches...</Text>
        </VStack>
      </Box>
    );
  }

  // If showing batch settings, render that component instead
  if (showBatchSettings && selectedBatch) {
    return (
      <Box>
        {/* Breadcrumb */}
        <Box mb="6">
          <Breadcrumb.Root
            fontSize="sm"
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
          >
            <Breadcrumb.List gap="2">
              <Breadcrumb.Item>
                <Breadcrumb.Link
                  onClick={handleBackToBatches}
                  cursor="pointer"
                  _hover={{ color: "#0d9488" }}
                >
                  Batches
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator>
                <FaChevronRight color="gray.500" />
              </Breadcrumb.Separator>
              <Breadcrumb.Item>
                <Breadcrumb.CurrentLink
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  {selectedBatch.batchName}
                </Breadcrumb.CurrentLink>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </Box>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackToBatches}
          mb="4"
          color={colorMode === "dark" ? "gray.300" : "gray.600"}
          _hover={{ color: "#0d9488" }}
        >
          <HStack spacing="2">
            <LuArrowLeft color="#0d9488" size="16" />
            <Text>Back to Batches</Text>
          </HStack>
        </Button>

        {/* Batch Settings Component */}
        <BatchesSettings
          batch={selectedBatch}
          onUpdate={fetchBatches}
          onBack={handleBackToBatches}
        />
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing="6" align="stretch">
        {/* Alert */}
        {alert && (
          <Alert.Root status={alert.type}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{alert.title}</Alert.Title>
              {alert.description && (
                <Alert.Description>{alert.description}</Alert.Description>
              )}
            </Alert.Content>
          </Alert.Root>
        )}

        {/* Search and View Toggle */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4">
            <Flex gap="4" align="center">
              <InputGroup flex="1" startElement={<FaSearch />}>
                <Input
                  placeholder="Search batches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  _placeholder={{
                    color: colorMode === "dark" ? "gray.400" : "gray.500",
                  }}
                />
              </InputGroup>

              {/* View Toggle */}
              <HStack spacing="1" flexShrink="0">
                <Tooltip content="Card View">
                  <IconButton
                    size="sm"
                    variant={viewMode === "card" ? "solid" : "outline"}
                    colorPalette="teal"
                    onClick={() => setViewMode("card")}
                    color={
                      viewMode === "card"
                        ? "white"
                        : colorMode === "dark"
                        ? "gray.300"
                        : "gray.600"
                    }
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  >
                    <MdApps />
                  </IconButton>
                </Tooltip>
                <Tooltip content="List View">
                  <IconButton
                    size="sm"
                    variant={viewMode === "list" ? "solid" : "outline"}
                    colorPalette="teal"
                    onClick={() => setViewMode("list")}
                    color={
                      viewMode === "list"
                        ? "white"
                        : colorMode === "dark"
                        ? "gray.300"
                        : "gray.600"
                    }
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  >
                    <MdList />
                  </IconButton>
                </Tooltip>
              </HStack>
            </Flex>
          </Card.Body>
        </Card.Root>

        {/* Batches Display */}
        {filteredBatches.length === 0 ? (
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Body p="8" textAlign="center">
              <Box display="flex" justifyContent="center" mb="4">
                <FaUsers
                  size="48"
                  color={colorMode === "dark" ? "#4A5568" : "#A0AEC0"}
                />
              </Box>
              <Text
                fontSize="lg"
                fontWeight="medium"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                No batches found
              </Text>
              <Text
                mt="2"
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.500"}
              >
                Try adjusting your search or filters
              </Text>
            </Card.Body>
          </Card.Root>
        ) : viewMode === "card" ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="4">
            {filteredBatches.map((batch) => (
              <BatchCard key={batch._id} batch={batch} />
            ))}
          </SimpleGrid>
        ) : (
          <Box
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            borderRadius="lg"
            overflow="hidden"
            shadow={colorMode === "dark" ? "lg" : "sm"}
          >
            <Table.Root variant="simple" size="sm">
              <Table.Header bg={colorMode === "dark" ? "gray.750" : "gray.50"}>
                <Table.Row>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                  >
                    Batch
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    display={{ base: "none", sm: "table-cell" }}
                  >
                    Students
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    display={{ base: "none", md: "table-cell" }}
                  >
                    Signup Code Status
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    display={{ base: "none", lg: "table-cell" }}
                  >
                    Status
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    w="40px"
                  >
                    Actions
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredBatches.map((batch) => (
                  <Table.Row
                    key={batch._id}
                    cursor="pointer"
                    onClick={() => handleViewBatch(batch)}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.700" : "gray.50",
                    }}
                  >
                    <Table.Cell>
                      <VStack align="start" spacing="0" minW="0" flex="1">
                        <Text
                          fontWeight="semibold"
                          fontSize="sm"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          isTruncated
                        >
                          {batch.batchName}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                          isTruncated
                        >
                          {batch.academicYear}
                        </Text>
                        {batch.description && (
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.500"
                            }
                            isTruncated
                            display={{ base: "block", md: "none" }}
                          >
                            {batch.description}
                          </Text>
                        )}
                        {/* Mobile-only info */}
                        <HStack
                          spacing="2"
                          display={{ base: "flex", sm: "none" }}
                          wrap="wrap"
                        >
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.500"
                            }
                          >
                            {batch.hasStudentLimit
                              ? `${batch.currentStudents}/${batch.maxStudents} students`
                              : `${batch.currentStudents} students`}
                          </Text>
                          {getSignupCodeStatus(batch)}
                        </HStack>
                      </VStack>
                    </Table.Cell>
                    <Table.Cell display={{ base: "none", sm: "table-cell" }}>
                      <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        {batch.hasStudentLimit
                          ? `${batch.currentStudents}/${batch.maxStudents}`
                          : batch.currentStudents}
                      </Text>
                    </Table.Cell>
                    <Table.Cell display={{ base: "none", md: "table-cell" }}>
                      {getSignupCodeStatus(batch)}
                    </Table.Cell>
                    <Table.Cell display={{ base: "none", lg: "table-cell" }}>
                      {getStatusBadge(batch)}
                    </Table.Cell>
                    <Table.Cell>
                      <Box onClick={(e) => e.stopPropagation()}>
                        <Menu.Root
                          onSelect={(details) => {
                            if (details.value === "view") {
                              handleViewBatch(batch);
                            } else if (details.value === "delete") {
                              handleDeleteBatch(batch);
                            }
                          }}
                        >
                          <Menu.Trigger asChild>
                            <IconButton
                              size="xs"
                              variant="ghost"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.500"
                              }
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "gray.700"
                                    : "gray.100",
                                color:
                                  colorMode === "dark"
                                    ? "gray.200"
                                    : "gray.700",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <MdMoreVert />
                            </IconButton>
                          </Menu.Trigger>
                          <Portal>
                            <Menu.Positioner>
                              <Menu.Content
                                bg={colorMode === "dark" ? "gray.800" : "white"}
                                borderColor={
                                  colorMode === "dark" ? "gray.700" : "gray.200"
                                }
                                shadow="lg"
                              >
                                <Menu.Item
                                  value="view"
                                  color={
                                    colorMode === "dark" ? "white" : "gray.900"
                                  }
                                  _hover={{
                                    bg:
                                      colorMode === "dark"
                                        ? "gray.700"
                                        : "gray.50",
                                  }}
                                >
                                  <FaEye />
                                  View Details
                                </Menu.Item>
                                <Menu.Item
                                  value="delete"
                                  color="red.500"
                                  _hover={{
                                    bg:
                                      colorMode === "dark"
                                        ? "red.900"
                                        : "red.50",
                                    color: "red.600",
                                  }}
                                >
                                  <FaTrash />
                                  Delete
                                </Menu.Item>
                              </Menu.Content>
                            </Menu.Positioner>
                          </Portal>
                        </Menu.Root>
                      </Box>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </VStack>

      {/* Delete Confirmation Modal */}
      <DeletePrompt
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBatch(null);
        }}
        onConfirm={confirmDeleteBatch}
        title="Delete Batch"
        description="Are you sure you want to delete this batch? This will mark it for deletion and deactivate the signup code."
        itemName={selectedBatch ? selectedBatch.batchName : ""}
        isLoading={deleteLoading}
        confirmText="Delete Batch"
      />
    </Box>
  );
};

export default Batches;
