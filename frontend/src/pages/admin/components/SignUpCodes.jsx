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
  Accordion,
  Portal,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaCode,
  FaEye,
  FaEyeSlash,
  FaSync,
  FaCopy,
  FaChevronRight,
  FaArrowLeft,
  FaChevronDown,
} from "react-icons/fa";
import { LuArrowLeft } from "react-icons/lu";
import { MdApps, MdList, MdMoreVert } from "react-icons/md";
import { useColorMode } from "../../../components/ui/color-mode";
import { Tooltip } from "../../../components/ui/tooltip";
import batchService from "../../../services/batches";
import SignUpCodesSettings from "./SignUpCodesSettings";

const SignUpCodes = ({ refreshTrigger }) => {
  const { colorMode } = useColorMode();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("card");

  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showCodeSettings, setShowCodeSettings] = useState(false);
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
        title: "Error Loading Signup Codes",
        description: "Unable to load signup codes. Please try again.",
      });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [refreshTrigger, fetchBatches]);

  const handleViewSignupCode = (batch) => {
    setSelectedBatch(batch);
    setShowCodeSettings(true);
  };

  const handleBackToSignupCodes = () => {
    setShowCodeSettings(false);
    setSelectedBatch(null);
  };

  const toggleCodeVisibility = (batchId) => {
    setVisibleCodes((prev) => ({
      ...prev,
      [batchId]: !prev[batchId],
    }));
  };

  const handleToggleSignupCode = async (batch, e) => {
    e.stopPropagation();

    try {
      const response = await batchService.toggleSignupCodeStatus(
        batch._id,
        `Status toggled by admin`
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

  const filteredBatches = batches.filter(
    (batch) =>
      batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.signupCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (batch) => {
    const status = batch.signupCodeStatus;
    if (!status) return <Badge colorPalette="gray">No Status</Badge>;

    return status.isActive ? (
      <Badge colorPalette="green">Active</Badge>
    ) : (
      <Badge colorPalette="red">Inactive</Badge>
    );
  };

  const SignupCodeCard = ({ batch }) => (
    <Card.Root
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderWidth="1px"
      borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      shadow={colorMode === "dark" ? "lg" : "sm"}
      cursor="pointer"
      onClick={() => handleViewSignupCode(batch)}
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
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                size="sm"
                variant="ghost"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
                _hover={{
                  bg: colorMode === "dark" ? "gray.700" : "gray.100",
                  color: colorMode === "dark" ? "gray.200" : "gray.700",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <MdMoreVert />
              </IconButton>
            </Menu.Trigger>
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
                onSelect={() => handleViewSignupCode(batch)}
              >
                <FaEye />
                View Details
              </Menu.Item>
              <Menu.Item
                value="toggle"
                onSelect={(e) => handleToggleSignupCode(batch, e)}
                color={
                  batch.signupCodeStatus?.isActive ? "red.500" : "green.500"
                }
                _hover={{
                  bg: batch.signupCodeStatus?.isActive
                    ? colorMode === "dark"
                      ? "red.900"
                      : "red.50"
                    : colorMode === "dark"
                    ? "green.900"
                    : "green.50",
                }}
              >
                {batch.signupCodeStatus?.isActive ? <FaEyeSlash /> : <FaEye />}
                {batch.signupCodeStatus?.isActive ? "Deactivate" : "Activate"}
              </Menu.Item>
              <Menu.Item
                value="reset"
                onSelect={(e) => handleResetSignupCode(batch, e)}
                color="orange.500"
                _hover={{
                  bg: colorMode === "dark" ? "orange.900" : "orange.50",
                }}
              >
                <FaSync />
                Reset Code
              </Menu.Item>
            </Menu.Content>
          </Menu.Root>
        </Flex>

        <VStack spacing="3" align="stretch">
          {/* Signup Code Display */}
          <Box
            p="3"
            bg={colorMode === "dark" ? "gray.700" : "gray.50"}
            borderRadius="md"
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
          >
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing="1">
                <Text
                  fontSize="xs"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  textTransform="uppercase"
                  fontWeight="medium"
                >
                  Signup Code
                </Text>
                <HStack>
                  <Text
                    fontSize="xl"
                    fontFamily="mono"
                    fontWeight="bold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    {visibleCodes[batch._id] ? batch.signupCode : "••••••••"}
                  </Text>
                  <IconButton
                    size="sm"
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
                    size="sm"
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
              </VStack>
              <VStack align="end" spacing="2">
                {getStatusBadge(batch)}
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
              </VStack>
            </HStack>
          </Box>

          {/* Usage Stats */}
          <HStack justify="space-between">
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              Usage Count:
            </Text>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              {batch.signupCodeStatus?.usageCount || 0}
            </Text>
          </HStack>

          <HStack justify="space-between">
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              Students Enrolled:
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
        </VStack>
      </Card.Body>
    </Card.Root>
  );

  // Group batches by status for accordion view
  const groupedBatches = {
    active: filteredBatches.filter((batch) => batch.signupCodeStatus?.isActive),
    inactive: filteredBatches.filter(
      (batch) => !batch.signupCodeStatus?.isActive
    ),
  };

  const AccordionView = () => (
    <Accordion.Root collapsible defaultValue={["active"]}>
      {/* Active Signup Codes */}
      <Accordion.Item value="active">
        <Accordion.ItemTrigger
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          color={colorMode === "dark" ? "white" : "gray.900"}
          _hover={{
            bg: colorMode === "dark" ? "gray.700" : "gray.50",
            color: colorMode === "dark" ? "white" : "gray.900",
          }}
        >
          <HStack>
            <Badge colorPalette="green">Active</Badge>
            <Text
              fontWeight="medium"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Active Signup Codes ({groupedBatches.active.length})
            </Text>
          </HStack>
          <Accordion.ItemIndicator
            color={colorMode === "dark" ? "white" : "gray.900"}
          />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="4" p="4">
            {groupedBatches.active.map((batch) => (
              <SignupCodeCard key={batch._id} batch={batch} />
            ))}
          </SimpleGrid>
        </Accordion.ItemContent>
      </Accordion.Item>

      {/* Inactive Signup Codes */}
      <Accordion.Item value="inactive">
        <Accordion.ItemTrigger
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          color={colorMode === "dark" ? "white" : "gray.900"}
          _hover={{
            bg: colorMode === "dark" ? "gray.700" : "gray.50",
            color: colorMode === "dark" ? "white" : "gray.900",
          }}
        >
          <HStack>
            <Badge colorPalette="red">Inactive</Badge>
            <Text
              fontWeight="medium"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Inactive Signup Codes ({groupedBatches.inactive.length})
            </Text>
          </HStack>
          <Accordion.ItemIndicator
            color={colorMode === "dark" ? "white" : "gray.900"}
          />
        </Accordion.ItemTrigger>
        <Accordion.ItemContent>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="4" p="4">
            {groupedBatches.inactive.map((batch) => (
              <SignupCodeCard key={batch._id} batch={batch} />
            ))}
          </SimpleGrid>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  );

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="50vh">
        <VStack spacing="4">
          <Spinner size="xl" color="teal.500" />
          <Text>Loading signup codes...</Text>
        </VStack>
      </Box>
    );
  }

  // If showing signup code settings, render that component instead
  if (showCodeSettings && selectedBatch) {
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
                  onClick={handleBackToSignupCodes}
                  cursor="pointer"
                  _hover={{ color: "#0d9488" }}
                >
                  Signup Codes
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
          onClick={handleBackToSignupCodes}
          mb="4"
          color={colorMode === "dark" ? "gray.300" : "gray.600"}
          _hover={{ color: "#0d9488" }}
        >
          <HStack spacing="2">
            <LuArrowLeft color="#0d9488" size="16" />
            <Text>Back to Signup Codes</Text>
          </HStack>
        </Button>

        {/* Signup Code Settings Component */}
        <SignUpCodesSettings
          batch={selectedBatch}
          onUpdate={fetchBatches}
          onBack={handleBackToSignupCodes}
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
            <Flex gap="4" align="center" w="full" wrap="wrap">
              <InputGroup flex="1" minW="200px" startElement={<FaSearch />}>
                <Input
                  placeholder="Search by batch name or signup code..."
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
                <Tooltip content="Accordion View">
                  <IconButton
                    size="sm"
                    variant={viewMode === "accordion" ? "solid" : "outline"}
                    colorPalette="teal"
                    onClick={() => setViewMode("accordion")}
                    color={
                      viewMode === "accordion"
                        ? "white"
                        : colorMode === "dark"
                        ? "gray.300"
                        : "gray.600"
                    }
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  >
                    <FaChevronDown />
                  </IconButton>
                </Tooltip>
              </HStack>
            </Flex>
          </Card.Body>
        </Card.Root>

        {/* Signup Codes Display */}
        {filteredBatches.length === 0 ? (
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Body p="8" textAlign="center">
              <Box display="flex" justifyContent="center" mb="4">
                <FaCode
                  size="48"
                  color={colorMode === "dark" ? "#4A5568" : "#A0AEC0"}
                />
              </Box>
              <Text
                fontSize="lg"
                fontWeight="medium"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                No signup codes found
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
              <SignupCodeCard key={batch._id} batch={batch} />
            ))}
          </SimpleGrid>
        ) : viewMode === "list" ? (
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
                    Status
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    display={{ base: "none", md: "table-cell" }}
                  >
                    Usage Count
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    display={{ base: "none", lg: "table-cell" }}
                  >
                    Students
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
                    onClick={() => handleViewSignupCode(batch)}
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
                        <Text
                          fontSize="xs"
                          fontFamily="mono"
                          color={colorMode === "dark" ? "gray.400" : "gray.500"}
                          isTruncated
                        >
                          Code: {batch.signupCode}
                        </Text>
                        {/* Mobile-only info */}
                        <HStack
                          spacing="2"
                          display={{ base: "flex", sm: "none" }}
                          wrap="wrap"
                        >
                          {getStatusBadge(batch)}
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.500"
                            }
                          >
                            Usage: {batch.signupCodeStatus?.usageCount || 0}
                          </Text>
                        </HStack>
                      </VStack>
                    </Table.Cell>
                    <Table.Cell display={{ base: "none", sm: "table-cell" }}>
                      {getStatusBadge(batch)}
                    </Table.Cell>
                    <Table.Cell display={{ base: "none", md: "table-cell" }}>
                      <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        {batch.signupCodeStatus?.usageCount || 0}
                      </Text>
                    </Table.Cell>
                    <Table.Cell display={{ base: "none", lg: "table-cell" }}>
                      <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        {batch.hasStudentLimit
                          ? `${batch.currentStudents}/${batch.maxStudents}`
                          : batch.currentStudents}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <IconButton
                            size="xs"
                            variant="ghost"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.500"
                            }
                            _hover={{
                              bg:
                                colorMode === "dark" ? "gray.700" : "gray.100",
                              color:
                                colorMode === "dark" ? "gray.200" : "gray.700",
                            }}
                            onClick={(e) => e.stopPropagation()}
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
                                onSelect={(e) => {
                                  e.stopPropagation();
                                  handleViewSignupCode(batch);
                                }}
                              >
                                <FaEye />
                                View Details
                              </Menu.Item>
                              <Menu.Item
                                value="toggle"
                                color={
                                  batch.signupCodeStatus?.isActive
                                    ? "red.500"
                                    : "green.500"
                                }
                                _hover={{
                                  bg: batch.signupCodeStatus?.isActive
                                    ? colorMode === "dark"
                                      ? "red.900"
                                      : "red.50"
                                    : colorMode === "dark"
                                    ? "green.900"
                                    : "green.50",
                                }}
                                onSelect={(e) => {
                                  e.stopPropagation();
                                  handleToggleSignupCode(batch, e);
                                }}
                              >
                                {batch.signupCodeStatus?.isActive ? (
                                  <FaEyeSlash />
                                ) : (
                                  <FaEye />
                                )}
                                {batch.signupCodeStatus?.isActive
                                  ? "Deactivate"
                                  : "Activate"}
                              </Menu.Item>
                              <Menu.Item
                                value="reset"
                                color="orange.500"
                                _hover={{
                                  bg:
                                    colorMode === "dark"
                                      ? "orange.900"
                                      : "orange.50",
                                }}
                                onSelect={(e) => {
                                  e.stopPropagation();
                                  handleResetSignupCode(batch, e);
                                }}
                              >
                                <FaSync />
                                Reset Code
                              </Menu.Item>
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        ) : (
          <AccordionView />
        )}
      </VStack>
    </Box>
  );
};

export default SignUpCodes;
