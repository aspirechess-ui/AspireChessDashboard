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
  Table,
  Portal,
  Tag,
  SimpleGrid,
  Combobox,
  useFilter,
  useListCollection,
  Collapsible,
} from "@chakra-ui/react";
import { LuSearch, LuFilter, LuX, LuFilterX } from "react-icons/lu";
import { FaCheck, FaTimes, FaClock } from "react-icons/fa";
import { useColorMode } from "../../../components/ui/color-mode";
import { Tooltip } from "../../../components/ui/tooltip";
import batchService from "../../../services/batches";

const ActivityLog = ({ refreshTrigger }) => {
  const { colorMode } = useColorMode();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    pending: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Applied filters (used for API calls)
  const [appliedFilters, setAppliedFilters] = useState({
    batchId: [],
    status: [],
    startDate: "",
    endDate: "",
  });

  // Temporary filters (used in UI before applying)
  const [tempFilters, setTempFilters] = useState({
    batchId: [],
    status: [],
    startDate: "",
    endDate: "",
  });

  const [batches, setBatches] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [dateValidationError, setDateValidationError] = useState("");

  // Filter collections for combobox
  const { contains } = useFilter({ sensitivity: "base" });

  const batchItems = React.useMemo(() => {
    console.log("Creating batch items from batches:", batches);
    const items = batches
      .filter((batch) => batch && batch._id && batch.batchName) // Filter out invalid batches
      .map((batch) => ({
        label: `${batch.batchName}${
          batch.academicYear ? ` (${batch.academicYear})` : ""
        }`,
        value: batch._id,
      }));

    console.log("Generated batch items:", items);
    return items;
  }, [batches]);

  const statusItems = React.useMemo(
    () => [
      { label: "Successful", value: "successful" },
      { label: "Failed", value: "failed" },
      { label: "Pending", value: "pending" },
    ],
    []
  );

  // Create batch collection that updates when batchItems change
  const batchCollectionData = useListCollection({
    initialItems: batchItems,
    filter: contains,
  });

  const batchCollection = batchCollectionData.collection;
  const filterBatches = batchCollectionData.filter;

  // Update batch collection when batches change
  React.useEffect(() => {
    console.log("Updating batch collection with items:", batchItems);
    batchCollectionData.set(batchItems);
  }, [batchItems, batchCollectionData]);

  // Debug batch collection
  React.useEffect(() => {
    console.log("Batch collection items:", batchCollection.items);
  }, [batchCollection.items]);

  const { collection: statusCollection, filter: filterStatuses } =
    useListCollection({
      initialItems: statusItems,
      filter: contains,
    });

  const fetchActivityLogs = useCallback(
    async (searchQuery = "") => {
      try {
        setLoading(true);
        const params = {
          page: pagination.page,
          limit: pagination.limit,
        };

        // Only add search if it's provided and not empty
        if (searchQuery && searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // Handle array filters
        if (appliedFilters.batchId.length > 0) {
          params.batchId = appliedFilters.batchId.join(",");
        }
        if (appliedFilters.status.length > 0) {
          params.status = appliedFilters.status.join(",");
        }
        if (appliedFilters.startDate) {
          params.startDate = appliedFilters.startDate;
        }
        if (appliedFilters.endDate) {
          params.endDate = appliedFilters.endDate;
        }

        const response = await batchService.getActivityLogs(params);

        if (response.success) {
          setLogs(response.data.logs || []);
          setStats(
            response.data.stats || {
              total: 0,
              successful: 0,
              failed: 0,
              pending: 0,
            }
          );
          setPagination(
            response.data.pagination || {
              page: 1,
              limit: 20,
              total: 0,
              pages: 0,
            }
          );
        }
      } catch (error) {
        console.error("Error fetching activity logs:", error);

        let errorMessage = "Unable to load activity logs. Please try again.";

        if (error.message.includes("Not authorized")) {
          errorMessage =
            "You don't have permission to access activity logs. Please check your login status.";
        } else if (error.message.includes("401")) {
          errorMessage = "Your session has expired. Please log in again.";
          // Redirect to login after a delay
          setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }, 3000);
        }

        setAlert({
          type: "error",
          title: "Error Loading Activity Logs",
          description: errorMessage,
        });
        setTimeout(() => setAlert(null), 8000);
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters, pagination.page, pagination.limit]
  );

  const fetchBatches = useCallback(async () => {
    try {
      setBatchesLoading(true);
      console.log("Fetching batches...");

      // Debug authentication
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      console.log("Token exists:", !!token);
      console.log("User data:", userData ? JSON.parse(userData) : null);

      const response = await batchService.getBatches({ limit: 100 });
      console.log("Batch response:", response);

      if (response.success) {
        // The backend returns batches in response.data (array)
        const batchData = Array.isArray(response.data) ? response.data : [];

        console.log("Processed batch data:", batchData);
        console.log("Sample batch:", batchData[0]);
        setBatches(batchData);
      } else {
        console.error("Batch fetch unsuccessful:", response);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);

      let errorMessage =
        "Unable to load batches for filtering. Please try again.";

      if (error.message.includes("Not authorized")) {
        errorMessage =
          "You don't have permission to access batches. Please check your login status.";
      } else if (error.message.includes("401")) {
        errorMessage = "Your session has expired. Please log in again.";
        // Redirect to login after a delay
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 3000);
      }

      setAlert({
        type: "error",
        title: "Error Loading Batches",
        description: errorMessage,
      });
      setTimeout(() => setAlert(null), 8000);
    } finally {
      setBatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  useEffect(() => {
    fetchActivityLogs();
  }, [refreshTrigger, fetchActivityLogs]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length === 0 || searchTerm.length >= 3) {
        fetchActivityLogs(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchActivityLogs]);

  // Sync tempFilters with appliedFilters when filter panel opens
  useEffect(() => {
    if (showFilters) {
      setTempFilters({ ...appliedFilters });
    }
  }, [showFilters, appliedFilters]);

  const handleTempFilterChange = (key, value) => {
    const newFilters = {
      ...tempFilters,
      [key]: value,
    };

    // Date validation
    if (key === "startDate" || key === "endDate") {
      const startDate = key === "startDate" ? value : newFilters.startDate;
      const endDate = key === "endDate" ? value : newFilters.endDate;

      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        setDateValidationError("End date cannot be earlier than start date");
      } else {
        setDateValidationError("");
      }
    }

    setTempFilters(newFilters);
  };

  const applyFilters = () => {
    // Don't apply filters if there's a date validation error
    if (dateValidationError) {
      return;
    }

    setAppliedFilters({ ...tempFilters });
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    setShowFilters(false);
  };

  const clearFilter = (key) => {
    if (key === "batchId" || key === "status") {
      const newAppliedFilters = {
        ...appliedFilters,
        [key]: [],
      };
      const newTempFilters = {
        ...tempFilters,
        [key]: [],
      };
      setAppliedFilters(newAppliedFilters);
      setTempFilters(newTempFilters);
    } else {
      const newAppliedFilters = {
        ...appliedFilters,
        [key]: "",
      };
      const newTempFilters = {
        ...tempFilters,
        [key]: "",
      };
      setAppliedFilters(newAppliedFilters);
      setTempFilters(newTempFilters);

      // Clear date validation error when clearing date filters
      if (key === "startDate" || key === "endDate") {
        setDateValidationError("");
      }
    }
  };

  const clearAllFilters = () => {
    const emptyFilters = {
      batchId: [],
      status: [],
      startDate: "",
      endDate: "",
    };
    setAppliedFilters(emptyFilters);
    setTempFilters(emptyFilters);
    setSearchTerm("");
    setDateValidationError(""); // Clear date validation error
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "successful":
        return "green";
      case "failed":
        return "red";
      case "pending":
        return "orange";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "successful":
        return <FaCheck />;
      case "failed":
        return <FaTimes />;
      case "pending":
        return <FaClock />;
      default:
        return <FaClock />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (appliedFilters.batchId.length > 0) count++;
    if (appliedFilters.status.length > 0) count++;
    if (appliedFilters.startDate) count++;
    if (appliedFilters.endDate) count++;
    return count;
  };

  const renderFilterTags = () => {
    const activeTags = [];

    // Handle multiple batch selections
    if (appliedFilters.batchId.length > 0) {
      appliedFilters.batchId.forEach((batchId) => {
        const batch = batches.find((b) => b._id === batchId);
        activeTags.push({
          key: `batchId-${batchId}`,
          filterKey: "batchId",
          filterValue: batchId,
          label: `Batch: ${batch?.batchName || "Unknown"}`,
          color: "teal",
        });
      });
    }

    // Handle multiple status selections
    if (appliedFilters.status.length > 0) {
      appliedFilters.status.forEach((status) => {
        activeTags.push({
          key: `status-${status}`,
          filterKey: "status",
          filterValue: status,
          label: `Status: ${status}`,
          color: getStatusColor(status),
        });
      });
    }

    if (appliedFilters.startDate) {
      activeTags.push({
        key: "startDate",
        filterKey: "startDate",
        label: `From: ${new Date(
          appliedFilters.startDate
        ).toLocaleDateString()}`,
        color: "blue",
      });
    }

    if (appliedFilters.endDate) {
      activeTags.push({
        key: "endDate",
        filterKey: "endDate",
        label: `To: ${new Date(appliedFilters.endDate).toLocaleDateString()}`,
        color: "blue",
      });
    }

    return activeTags;
  };

  const removeFilterTag = (tag) => {
    if (tag.filterKey === "batchId") {
      const newAppliedFilters = {
        ...appliedFilters,
        batchId: appliedFilters.batchId.filter((id) => id !== tag.filterValue),
      };
      const newTempFilters = {
        ...tempFilters,
        batchId: tempFilters.batchId.filter((id) => id !== tag.filterValue),
      };
      setAppliedFilters(newAppliedFilters);
      setTempFilters(newTempFilters);
    } else if (tag.filterKey === "status") {
      const newAppliedFilters = {
        ...appliedFilters,
        status: appliedFilters.status.filter(
          (status) => status !== tag.filterValue
        ),
      };
      const newTempFilters = {
        ...tempFilters,
        status: tempFilters.status.filter(
          (status) => status !== tag.filterValue
        ),
      };
      setAppliedFilters(newAppliedFilters);
      setTempFilters(newTempFilters);
    } else {
      clearFilter(tag.filterKey);
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="50vh">
        <VStack spacing="4">
          <Spinner size="xl" color="teal.500" />
          <Text>Loading activity logs...</Text>
        </VStack>
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

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing="4">
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Body p="4" textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                {stats.total}
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                Total Attempts
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Body p="4" textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {stats.successful}
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                Successful
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Body p="4" textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                {stats.failed}
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                Failed
              </Text>
            </Card.Body>
          </Card.Root>

          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Body p="4" textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                {stats.pending}
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                Pending
              </Text>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>

        {/* Search and Filters */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4">
            <Flex gap="4" align="center" wrap="wrap">
              <InputGroup
                flex="1"
                minW={{ base: "200px", md: "250px" }}
                startElement={<LuSearch />}
              >
                <Input
                  placeholder="Search by user name, email, or signup code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  _placeholder={{
                    color: colorMode === "dark" ? "gray.400" : "gray.500",
                  }}
                />
              </InputGroup>

              {/* Filter Button */}
              <IconButton
                variant="outline"
                size="md"
                onClick={() => setShowFilters(!showFilters)}
                colorPalette="teal"
                position="relative"
                title="Filters"
              >
                <LuFilter />
                {getActiveFiltersCount() > 0 && (
                  <Badge
                    position="absolute"
                    top="-1"
                    right="-1"
                    colorPalette="red"
                    borderRadius="full"
                    fontSize="xs"
                    minW="5"
                    h="5"
                  >
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </IconButton>

              {/* Clear All Filters Button */}
              <Tooltip content="Clear all filters">
                <IconButton
                  variant="outline"
                  size="md"
                  onClick={clearAllFilters}
                  colorPalette="red"
                  disabled={getActiveFiltersCount() === 0}
                  title="Clear all filters"
                >
                  <LuFilterX />
                </IconButton>
              </Tooltip>
            </Flex>

            {/* Active Filter Tags */}
            {renderFilterTags().length > 0 && (
              <Flex gap="2" mt="4" wrap="wrap" align="center">
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  display={{ base: "none", sm: "block" }}
                >
                  Active filters:
                </Text>
                {renderFilterTags().map((tag) => (
                  <Tag.Root
                    key={tag.key}
                    size="sm"
                    colorPalette={tag.color}
                    variant="subtle"
                  >
                    <Tag.Label>{tag.label}</Tag.Label>
                    <Tag.CloseTrigger onClick={() => removeFilterTag(tag)}>
                      <LuX />
                    </Tag.CloseTrigger>
                  </Tag.Root>
                ))}
              </Flex>
            )}
          </Card.Body>
        </Card.Root>

        {/* Filter Card */}
        <Collapsible.Root open={showFilters}>
          <Collapsible.Content>
            <Card.Root
              bg={colorMode === "dark" ? "gray.800" : "white"}
              borderWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              shadow={colorMode === "dark" ? "lg" : "sm"}
            >
              <Card.Body p="6">
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="6">
                  {/* Batch Filter */}
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      mb="3"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Batch {batchesLoading && <Spinner size="xs" ml="2" />}
                    </Text>
                    <Combobox.Root
                      collection={batchCollection}
                      value={tempFilters.batchId}
                      onValueChange={(details) =>
                        handleTempFilterChange("batchId", details.value)
                      }
                      onInputValueChange={(details) =>
                        filterBatches(details.inputValue)
                      }
                      multiple
                      openOnClick
                    >
                      <Combobox.Control>
                        <Combobox.Input
                          placeholder={
                            tempFilters.batchId.length > 0
                              ? `${tempFilters.batchId.length} batch(es) selected`
                              : "Select batches..."
                          }
                          bg={colorMode === "dark" ? "gray.700" : "white"}
                          borderColor={
                            colorMode === "dark" ? "gray.600" : "gray.300"
                          }
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          _focus={{
                            borderColor: "#0d9488",
                            boxShadow: "0 0 0 1px #0d9488",
                          }}
                        />
                        <Combobox.IndicatorGroup>
                          <Combobox.ClearTrigger />
                          <Combobox.Trigger />
                        </Combobox.IndicatorGroup>
                      </Combobox.Control>
                      <Portal>
                        <Combobox.Positioner zIndex={1500}>
                          <Combobox.Content
                            bg={colorMode === "dark" ? "gray.800" : "white"}
                            borderColor={
                              colorMode === "dark" ? "gray.700" : "gray.200"
                            }
                            shadow="lg"
                            maxH="200px"
                            overflowY="auto"
                          >
                            <Combobox.Empty>
                              {batchesLoading
                                ? "Loading batches..."
                                : "No batches found"}
                            </Combobox.Empty>
                            {batchCollection.items.map((item) => (
                              <Combobox.Item
                                key={item.value}
                                item={item}
                                _hover={{
                                  bg:
                                    colorMode === "dark"
                                      ? "gray.700"
                                      : "gray.50",
                                }}
                              >
                                <HStack spacing="3" flex="1" py="1">
                                  <Box
                                    w="4"
                                    h="4"
                                    borderWidth="2px"
                                    borderColor={
                                      tempFilters.batchId.includes(item.value)
                                        ? "#0d9488"
                                        : colorMode === "dark"
                                        ? "gray.500"
                                        : "gray.400"
                                    }
                                    borderRadius="3px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg={
                                      tempFilters.batchId.includes(item.value)
                                        ? "#0d9488"
                                        : "transparent"
                                    }
                                    transition="all 0.2s"
                                  >
                                    {tempFilters.batchId.includes(
                                      item.value
                                    ) && (
                                      <LuX
                                        size="12"
                                        color="white"
                                        style={{ transform: "rotate(45deg)" }}
                                      />
                                    )}
                                  </Box>
                                  <Text flex="1" fontSize="sm">
                                    {item.label}
                                  </Text>
                                </HStack>
                              </Combobox.Item>
                            ))}
                          </Combobox.Content>
                        </Combobox.Positioner>
                      </Portal>
                    </Combobox.Root>
                  </Box>

                  {/* Status Filter */}
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      mb="3"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Status
                    </Text>
                    <Combobox.Root
                      collection={statusCollection}
                      value={tempFilters.status}
                      onValueChange={(details) =>
                        handleTempFilterChange("status", details.value)
                      }
                      onInputValueChange={(details) =>
                        filterStatuses(details.inputValue)
                      }
                      multiple
                      openOnClick
                    >
                      <Combobox.Control>
                        <Combobox.Input
                          placeholder={
                            tempFilters.status.length > 0
                              ? `${tempFilters.status.length} status(es) selected`
                              : "Select statuses..."
                          }
                          bg={colorMode === "dark" ? "gray.700" : "white"}
                          borderColor={
                            colorMode === "dark" ? "gray.600" : "gray.300"
                          }
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          _focus={{
                            borderColor: "#0d9488",
                            boxShadow: "0 0 0 1px #0d9488",
                          }}
                        />
                        <Combobox.IndicatorGroup>
                          <Combobox.ClearTrigger />
                          <Combobox.Trigger />
                        </Combobox.IndicatorGroup>
                      </Combobox.Control>
                      <Portal>
                        <Combobox.Positioner zIndex={1500}>
                          <Combobox.Content
                            bg={colorMode === "dark" ? "gray.800" : "white"}
                            borderColor={
                              colorMode === "dark" ? "gray.700" : "gray.200"
                            }
                            shadow="lg"
                            maxH="200px"
                            overflowY="auto"
                          >
                            <Combobox.Empty>No statuses found</Combobox.Empty>
                            {statusCollection.items.map((item) => (
                              <Combobox.Item
                                key={item.value}
                                item={item}
                                _hover={{
                                  bg:
                                    colorMode === "dark"
                                      ? "gray.700"
                                      : "gray.50",
                                }}
                              >
                                <HStack spacing="3" flex="1" py="1">
                                  <Box
                                    w="4"
                                    h="4"
                                    borderWidth="2px"
                                    borderColor={
                                      tempFilters.status.includes(item.value)
                                        ? getStatusColor(item.value) === "green"
                                          ? "#10B981"
                                          : getStatusColor(item.value) === "red"
                                          ? "#EF4444"
                                          : "#F59E0B"
                                        : colorMode === "dark"
                                        ? "gray.500"
                                        : "gray.400"
                                    }
                                    borderRadius="3px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    bg={
                                      tempFilters.status.includes(item.value)
                                        ? getStatusColor(item.value) === "green"
                                          ? "#10B981"
                                          : getStatusColor(item.value) === "red"
                                          ? "#EF4444"
                                          : "#F59E0B"
                                        : "transparent"
                                    }
                                    transition="all 0.2s"
                                  >
                                    {tempFilters.status.includes(
                                      item.value
                                    ) && (
                                      <LuX
                                        size="12"
                                        color="white"
                                        style={{ transform: "rotate(45deg)" }}
                                      />
                                    )}
                                  </Box>
                                  <HStack spacing="2">
                                    {getStatusIcon(item.value)}
                                    <Text>{item.label}</Text>
                                  </HStack>
                                </HStack>
                                <Combobox.ItemIndicator />
                              </Combobox.Item>
                            ))}
                          </Combobox.Content>
                        </Combobox.Positioner>
                      </Portal>
                    </Combobox.Root>
                  </Box>

                  {/* Date Range - From */}
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      mb="3"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      From Date
                    </Text>
                    <Input
                      type="date"
                      value={tempFilters.startDate}
                      onChange={(e) =>
                        handleTempFilterChange("startDate", e.target.value)
                      }
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.300"
                      }
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      _focus={{
                        borderColor: "#0d9488",
                        boxShadow: "0 0 0 1px #0d9488",
                      }}
                    />
                  </Box>

                  {/* Date Range - To */}
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      mb="3"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      To Date
                    </Text>
                    <Input
                      type="date"
                      value={tempFilters.endDate}
                      onChange={(e) =>
                        handleTempFilterChange("endDate", e.target.value)
                      }
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.300"
                      }
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      _focus={{
                        borderColor: "#0d9488",
                        boxShadow: "0 0 0 1px #0d9488",
                      }}
                    />
                  </Box>
                </SimpleGrid>

                {/* Date Validation Error */}
                {dateValidationError && (
                  <Alert.Root status="error" mt="4">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>
                        {dateValidationError}
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}

                {/* Filter Actions */}
                <Flex justify="flex-end" mt="6" gap="3">
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    colorPalette="red"
                    disabled={getActiveFiltersCount() === 0}
                    size="sm"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={applyFilters}
                    colorPalette="teal"
                    size="sm"
                    disabled={!!dateValidationError}
                  >
                    Apply Filters
                  </Button>
                </Flex>
              </Card.Body>
            </Card.Root>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Activity Logs Table */}
        {logs.length === 0 ? (
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Body p="8" textAlign="center">
              <Box display="flex" justifyContent="center" mb="4">
                <FaClock
                  size="48"
                  color={colorMode === "dark" ? "#4A5568" : "#A0AEC0"}
                />
              </Box>
              <Text
                fontSize="lg"
                fontWeight="medium"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                No activity logs found
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
        ) : (
          <Box
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            borderRadius="lg"
            overflow="hidden"
            shadow={colorMode === "dark" ? "lg" : "sm"}
          >
            <Box overflowX="auto">
              <Table.Root variant="simple" size="sm">
                <Table.Header
                  bg={colorMode === "dark" ? "gray.750" : "gray.50"}
                >
                  <Table.Row>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      minW="120px"
                    >
                      User
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      display={{ base: "none", md: "table-cell" }}
                      minW="150px"
                    >
                      Batch
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      display={{ base: "none", lg: "table-cell" }}
                      minW="100px"
                    >
                      Signup Code
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      minW="100px"
                    >
                      Status
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      display={{ base: "none", sm: "table-cell" }}
                      minW="140px"
                    >
                      Date & Time
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      display={{ base: "none", xl: "table-cell" }}
                      minW="200px"
                    >
                      Failure Reason
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {logs.map((log) => (
                    <Table.Row
                      key={log._id}
                      _hover={{
                        bg: colorMode === "dark" ? "gray.700" : "gray.50",
                      }}
                    >
                      <Table.Cell>
                        <VStack align="start" spacing="1" minW="0">
                          <Text
                            fontWeight="medium"
                            fontSize="sm"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            isTruncated
                          >
                            {log.userName}
                          </Text>
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.500"
                            }
                            isTruncated
                          >
                            {log.userEmail}
                          </Text>
                          {/* Mobile-only info */}
                          <VStack
                            align="start"
                            spacing="1"
                            display={{ base: "flex", md: "none" }}
                          >
                            <Text
                              fontSize="xs"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.500"
                              }
                              isTruncated
                            >
                              {log.batchId?.batchName}
                            </Text>
                            <Text
                              fontSize="xs"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.500"
                              }
                              display={{ base: "block", sm: "none" }}
                            >
                              {formatDate(log.usedAt)}
                            </Text>
                          </VStack>
                        </VStack>
                      </Table.Cell>
                      <Table.Cell display={{ base: "none", md: "table-cell" }}>
                        <VStack align="start" spacing="1">
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            isTruncated
                          >
                            {log.batchId?.batchName || "Unknown"}
                          </Text>
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.500"
                            }
                            isTruncated
                          >
                            {log.batchId?.academicYear}
                          </Text>
                        </VStack>
                      </Table.Cell>
                      <Table.Cell display={{ base: "none", lg: "table-cell" }}>
                        <Text
                          fontSize="sm"
                          fontFamily="mono"
                          fontWeight="bold"
                          color={colorMode === "dark" ? "teal.300" : "teal.600"}
                        >
                          {log.signupCode}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorPalette={getStatusColor(log.registrationStatus)}
                          variant="subtle"
                          size="sm"
                        >
                          <HStack spacing="1">
                            {getStatusIcon(log.registrationStatus)}
                            <Text textTransform="capitalize">
                              {log.registrationStatus}
                            </Text>
                          </HStack>
                        </Badge>
                      </Table.Cell>
                      <Table.Cell display={{ base: "none", sm: "table-cell" }}>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                        >
                          {formatDate(log.usedAt)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell display={{ base: "none", xl: "table-cell" }}>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.500"}
                          isTruncated
                          maxW="200px"
                        >
                          {log.failureReason || "-"}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Box
                p="4"
                borderTop="1px solid"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              >
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap="4"
                >
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} results
                  </Text>
                  <HStack spacing="2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page - 1),
                        }))
                      }
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Page {pagination.page} of {pagination.pages}
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          page: Math.min(prev.pages, prev.page + 1),
                        }))
                      }
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ActivityLog;
