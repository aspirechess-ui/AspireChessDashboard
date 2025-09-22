import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  Badge,
  Spinner,
  Alert,
  Flex,
  Table,
  Input,
  InputGroup,
  Separator,
  SimpleGrid,
  IconButton,
  Textarea,
  Switch,
} from "@chakra-ui/react";
import {
  LuUsers,
  LuCode,
  LuEye,
  LuEyeOff,
  LuRotateCcw,
  LuCopy,
  LuTrendingUp,
  LuSettings,
  LuSave,
  LuX,
} from "react-icons/lu";
import { useColorMode } from "../../../components/ui/color-mode";
import batchService from "../../../services/batches";

const BatchesSettings = ({ batch, onUpdate }) => {
  const { colorMode } = useColorMode();
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [usageLogs, setUsageLogs] = useState([]);
  const [usageStats, setUsageStats] = useState(null);
  const [alert, setAlert] = useState(null);
  const [resetReason, setResetReason] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showSignupCode, setShowSignupCode] = useState(false);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    batchName: "",
    description: "",
    academicYear: "",
    hasStudentLimit: false,
    maxStudents: "",
  });

  const fetchBatchDetails = useCallback(async () => {
    if (!batch) return;

    setLoading(true);
    try {
      const response = await batchService.getBatch(batch._id);
      if (response.success) {
        const batchInfo = response.data.batch;
        setBatchData({
          ...batchInfo,
          signupCodeStatus: response.data.signupCodeStatus,
        });
        setUsageLogs(response.data.recentUsage || []);
        setUsageStats(response.data.usageStats || {});

        // Initialize edit form
        setEditForm({
          batchName: batchInfo.batchName || "",
          description: batchInfo.description || "",
          academicYear: batchInfo.academicYear || "",
          hasStudentLimit: batchInfo.hasStudentLimit || false,
          maxStudents: batchInfo.maxStudents || "",
        });
      }
    } catch (error) {
      console.error("Error fetching batch details:", error);
      setAlert({
        type: "error",
        title: "Error Loading Batch",
        description: "Unable to load batch details. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [batch]);

  useEffect(() => {
    if (batch) {
      fetchBatchDetails();
    }
  }, [batch, fetchBatchDetails]);

  const handleToggleSignupCode = async () => {
    if (!batch || actionLoading) return;

    setActionLoading(true);
    try {
      const response = await batchService.toggleSignupCodeStatus(
        batch._id,
        "Status toggled by admin"
      );

      if (response.success) {
        // Update local state immediately for better UX
        setBatchData((prev) => ({
          ...prev,
          signupCodeStatus: response.data,
        }));

        if (onUpdate) onUpdate();

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
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetSignupCode = async () => {
    if (!batch) return;

    setActionLoading(true);
    try {
      const response = await batchService.resetSignupCode(
        batch._id,
        resetReason || "Code reset by admin"
      );

      if (response.success) {
        await fetchBatchDetails();
        onUpdate();
        setShowResetDialog(false);
        setResetReason("");

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
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateBatch = async () => {
    if (!batch || actionLoading) return;

    setActionLoading(true);
    try {
      const updateData = {
        batchName: editForm.batchName,
        description: editForm.description,
        academicYear: editForm.academicYear,
        hasStudentLimit: editForm.hasStudentLimit,
        maxStudents: editForm.hasStudentLimit
          ? parseInt(editForm.maxStudents)
          : undefined,
      };

      const response = await batchService.updateBatch(batch._id, updateData);

      if (response.success) {
        await fetchBatchDetails();
        if (onUpdate) onUpdate();
        setIsEditing(false);

        setAlert({
          type: "success",
          title: "Batch Updated",
          description: "Batch details have been updated successfully.",
        });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error("Error updating batch:", error);
      setAlert({
        type: "error",
        title: "Error",
        description: error.message || "Failed to update batch details.",
      });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (batchData) {
      setEditForm({
        batchName: batchData.batchName || "",
        description: batchData.description || "",
        academicYear: batchData.academicYear || "",
        hasStudentLimit: batchData.hasStudentLimit || false,
        maxStudents: batchData.maxStudents || "",
      });
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setAlert({
        type: "success",
        title: "Copied!",
        description: "Signup code copied to clipboard.",
      });
      setTimeout(() => setAlert(null), 2000);
    });
  };

  const getStatusBadge = (status) => {
    if (!status || status.isActive === undefined) {
      return <Badge colorPalette="gray">Inactive</Badge>;
    }

    return status.isActive ? (
      <Badge colorPalette="green">Active</Badge>
    ) : (
      <Badge colorPalette="red">Inactive</Badge>
    );
  };

  const isToggleActive = batchData?.signupCodeStatus?.isActive ?? false;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!batch) return null;

  return (
    <Box>
      {/* Page Header */}
      <Box mb="6">
        <Heading
          size="lg"
          mb="2"
          color={colorMode === "dark" ? "white" : "gray.900"}
        >
          Batch Settings - {batch?.batchName}
        </Heading>
        <Text
          color={colorMode === "dark" ? "gray.300" : "gray.600"}
          fontSize="md"
        >
          Manage batch details, signup code, and view usage statistics
        </Text>
      </Box>
      {loading ? (
        <Box display="flex" alignItems="center" justifyContent="center" py="8">
          <VStack spacing="4">
            <Spinner size="xl" color="teal.500" />
            <Text>Loading batch details...</Text>
          </VStack>
        </Box>
      ) : (
        <VStack spacing="6" align="stretch">
          {/* Alert */}
          {alert && (
            <Alert.Root status={alert.type}>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{alert.title}</Alert.Title>
                <Alert.Description>{alert.description}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Batch Details */}
          <Card.Root
            bg={colorMode === "dark" ? "gray.700" : "gray.50"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
          >
            <Card.Body p="4">
              <VStack spacing="4" align="stretch">
                <Flex justify="space-between" align="center">
                  <Heading
                    size="md"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    <HStack>
                      <LuUsers />
                      <Text>Batch Details</Text>
                    </HStack>
                  </Heading>

                  {!isEditing ? (
                    <Button
                      size="sm"
                      colorPalette="blue"
                      leftIcon={<LuSettings />}
                      onClick={() => setIsEditing(true)}
                      disabled={actionLoading}
                    >
                      Edit
                    </Button>
                  ) : (
                    <HStack spacing="2">
                      <Button
                        size="sm"
                        colorPalette="green"
                        leftIcon={<LuSave />}
                        onClick={handleUpdateBatch}
                        loading={actionLoading}
                        loadingText="Saving..."
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<LuX />}
                        onClick={handleCancelEdit}
                        disabled={actionLoading}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  )}
                </Flex>

                {!isEditing ? (
                  <>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                      <Box>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                          fontWeight="medium"
                        >
                          Batch Name:
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          {batchData?.batchName || "N/A"}
                        </Text>
                      </Box>

                      <Box>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                          fontWeight="medium"
                        >
                          Academic Year:
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          {batchData?.academicYear || "N/A"}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    {batchData?.description && (
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                          mb="2"
                        >
                          Description:
                        </Text>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {batchData.description}
                        </Text>
                      </Box>
                    )}

                    <SimpleGrid columns={{ base: 1, md: 3 }} spacing="4">
                      <Box>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        >
                          Students Enrolled
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          {batchData?.currentStudents || 0}
                          {batchData?.hasStudentLimit &&
                            `/${batchData?.maxStudents || 0}`}
                        </Text>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.500" : "gray.500"}
                        >
                          {batchData?.hasStudentLimit
                            ? `${
                                (batchData?.maxStudents || 0) -
                                (batchData?.currentStudents || 0)
                              } spots available`
                            : "Unlimited capacity"}
                        </Text>
                      </Box>

                      <Box>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        >
                          Student Limit
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          {batchData?.hasStudentLimit ? "Enabled" : "Disabled"}
                        </Text>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.500" : "gray.500"}
                        >
                          {batchData?.hasStudentLimit
                            ? `Max: ${batchData?.maxStudents || 0} students`
                            : "No enrollment limit"}
                        </Text>
                      </Box>

                      <Box>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        >
                          Created
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          {batchData?.createdAt
                            ? formatDate(batchData.createdAt)
                            : "N/A"}
                        </Text>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.500" : "gray.500"}
                        >
                          By {batchData?.createdBy?.email || "Unknown"}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </>
                ) : (
                  <VStack spacing="4" align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                          mb="2"
                        >
                          Batch Name:
                        </Text>
                        <Input
                          value={editForm.batchName}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              batchName: e.target.value,
                            }))
                          }
                          placeholder="Enter batch name"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        />
                      </Box>

                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                          mb="2"
                        >
                          Academic Year:
                        </Text>
                        <Input
                          value={editForm.academicYear}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              academicYear: e.target.value,
                            }))
                          }
                          placeholder="e.g., 2024-2025"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        />
                      </Box>
                    </SimpleGrid>

                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        mb="2"
                      >
                        Description:
                      </Text>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter batch description (optional)"
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        rows={3}
                      />
                    </Box>

                    <Box>
                      <HStack spacing="3" align="center">
                        <Switch.Root
                          checked={editForm.hasStudentLimit}
                          onCheckedChange={(details) =>
                            setEditForm((prev) => ({
                              ...prev,
                              hasStudentLimit: details.checked,
                              maxStudents: details.checked
                                ? prev.maxStudents
                                : "",
                            }))
                          }
                          colorPalette="blue"
                        >
                          <Switch.HiddenInput />
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Enable Student Limit
                        </Text>
                      </HStack>

                      {editForm.hasStudentLimit && (
                        <Box mt="3">
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                            mb="2"
                          >
                            Maximum Students:
                          </Text>
                          <Input
                            type="number"
                            value={editForm.maxStudents}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                maxStudents: e.target.value,
                              }))
                            }
                            placeholder="Enter maximum number of students"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            min="1"
                            max="1000"
                          />
                        </Box>
                      )}
                    </Box>
                  </VStack>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Signup Code Management */}
          <Card.Root
            bg={colorMode === "dark" ? "gray.700" : "gray.50"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
          >
            <Card.Body p="4">
              <VStack spacing="4" align="stretch">
                <Heading
                  size="md"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  <HStack>
                    <LuCode />
                    <Text>Signup Code Management</Text>
                  </HStack>
                </Heading>

                <VStack spacing="4" align="stretch">
                  <VStack align="start" spacing="2">
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.400" : "gray.600"}
                      fontWeight="medium"
                    >
                      Current Signup Code:
                    </Text>
                    <InputGroup
                      endElement={
                        <HStack spacing="1">
                          <IconButton
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowSignupCode(!showSignupCode)}
                            title={showSignupCode ? "Hide code" : "Show code"}
                          >
                            {showSignupCode ? <LuEyeOff /> : <LuEye />}
                          </IconButton>
                          <IconButton
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(batchData?.signupCode || "")
                            }
                            title="Copy to clipboard"
                          >
                            <LuCopy />
                          </IconButton>
                        </HStack>
                      }
                    >
                      <Input
                        value={batchData?.signupCode || ""}
                        type={showSignupCode ? "text" : "password"}
                        readOnly
                        fontFamily="mono"
                        fontWeight="bold"
                        fontSize="lg"
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        bg={colorMode === "dark" ? "gray.600" : "white"}
                        borderColor={
                          colorMode === "dark" ? "gray.500" : "gray.300"
                        }
                      />
                    </InputGroup>
                  </VStack>

                  <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "stretch", md: "center" }}
                    gap="4"
                  >
                    <HStack>
                      <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.400" : "gray.600"}
                      >
                        Status:
                      </Text>
                      {getStatusBadge(batchData?.signupCodeStatus)}
                    </HStack>
                    <HStack
                      spacing="3"
                      justify={{ base: "center", md: "flex-end" }}
                      align="center"
                    >
                      <HStack spacing="3" align="center">
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                        >
                          {isToggleActive ? "Active" : "Inactive"}
                        </Text>
                        <Switch.Root
                          checked={isToggleActive}
                          onCheckedChange={handleToggleSignupCode}
                          disabled={actionLoading}
                          colorPalette={isToggleActive ? "green" : "red"}
                        >
                          <Switch.HiddenInput />
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                      </HStack>
                      <Button
                        size="sm"
                        colorPalette="orange"
                        leftIcon={<LuRotateCcw />}
                        onClick={() => setShowResetDialog(true)}
                        loading={actionLoading}
                      >
                        Reset Code
                      </Button>
                    </HStack>
                  </Flex>
                </VStack>

                {/* Usage Statistics */}
                {usageStats && (
                  <Box>
                    <Separator my="4" />
                    <Heading
                      size="sm"
                      mb="3"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      <HStack>
                        <LuTrendingUp />
                        <Text>Usage Statistics</Text>
                      </HStack>
                    </Heading>
                    <SimpleGrid columns={{ base: 2, md: 4 }} spacing="4">
                      <Box>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        >
                          Total Uses
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          {usageStats.total || 0}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        >
                          Successful
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="green.500"
                        >
                          {usageStats.successful || 0}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        >
                          Failed
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="red.500">
                          {usageStats.failed || 0}
                        </Text>
                      </Box>
                      <Box>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        >
                          Pending
                        </Text>
                        <Text
                          fontSize="2xl"
                          fontWeight="bold"
                          color="orange.500"
                        >
                          {usageStats.pending || 0}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </Box>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Recent Usage Logs */}
          <Card.Root
            bg={colorMode === "dark" ? "gray.700" : "gray.50"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
          >
            <Card.Body p="4">
              <VStack spacing="4" align="stretch">
                <Heading
                  size="md"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Recent Usage Logs
                </Heading>

                {usageLogs.length === 0 ? (
                  <Box textAlign="center" py="8">
                    <Text
                      color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    >
                      No usage logs found
                    </Text>
                  </Box>
                ) : (
                  <Box overflowX="auto">
                    <Table.Root size="sm">
                      <Table.Header>
                        <Table.Row>
                          <Table.ColumnHeader>User</Table.ColumnHeader>
                          <Table.ColumnHeader>Email</Table.ColumnHeader>
                          <Table.ColumnHeader>Used At</Table.ColumnHeader>
                          <Table.ColumnHeader>Status</Table.ColumnHeader>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {usageLogs.slice(0, 10).map((log, index) => (
                          <Table.Row key={index}>
                            <Table.Cell>{log.userName}</Table.Cell>
                            <Table.Cell>{log.userEmail}</Table.Cell>
                            <Table.Cell>{formatDate(log.usedAt)}</Table.Cell>
                            <Table.Cell>
                              <Badge
                                colorPalette={
                                  log.registrationStatus === "successful"
                                    ? "green"
                                    : log.registrationStatus === "failed"
                                    ? "red"
                                    : "orange"
                                }
                              >
                                {log.registrationStatus}
                              </Badge>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Root>
                  </Box>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      )}

      {/* Reset Code Dialog - Temporarily disabled for debugging */}
      {showResetDialog && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="modal"
        >
          <Box
            bg={colorMode === "dark" ? "gray.800" : "white"}
            p="6"
            borderRadius="md"
            maxW="400px"
            w="90%"
          >
            <VStack spacing="4" align="stretch">
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Reset Signup Code
              </Text>

              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                This will generate a new signup code and reset the usage count.
                The old code will no longer work.
              </Text>

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={colorMode === "dark" ? "gray.200" : "gray.700"}
                  mb="2"
                >
                  Reason (Optional):
                </Text>
                <Input
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  placeholder="e.g., Security update, Code compromised"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                />
              </Box>

              <HStack spacing="3" justify="end">
                <Button
                  variant="outline"
                  onClick={() => setShowResetDialog(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  colorPalette="orange"
                  onClick={handleResetSignupCode}
                  loading={actionLoading}
                  loadingText="Resetting..."
                >
                  Reset Code
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BatchesSettings;
