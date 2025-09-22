import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Button,
  Spinner,
  VStack,
  HStack,
  Card,
  Table,
  Badge,
  Input,
  InputGroup,
  IconButton,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react";
import { LuSearch, LuUsers, LuEye } from "react-icons/lu";
import { MdApps, MdList } from "react-icons/md";
import { useColorMode } from "../../../components/ui/color-mode";
import { Tooltip } from "../../../components/ui/tooltip";
import batchService from "../../../services/batches.js";

const ManageClass = () => {
  const { colorMode } = useColorMode();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("card");
  const navigate = useNavigate();

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await batchService.getBatchesForTeacher({
        status: "active",
        limit: 100,
      });

      if (response.success) {
        setBatches(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch batches");
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleBatchSelect = (batch) => {
    // URL-encode the batch name to handle spaces and special characters
    const encodedBatchName = encodeURIComponent(batch.batchName);
    navigate(`/teacher/classes/batch/${encodedBatchName}`, {
      state: {
        batchName: batch.batchName,
        batchId: batch._id, // Pass the actual ID in state for API calls
      },
    });
  };

  const filteredBatches = batches.filter(
    (batch) =>
      batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (batch) => {
    if (!batch.isActive) {
      return <Badge colorPalette="gray">Inactive</Badge>;
    }
    return <Badge colorPalette="green">Active</Badge>;
  };

  const BatchCard = ({ batch }) => (
    <Card.Root
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderWidth="1px"
      borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      shadow={colorMode === "dark" ? "lg" : "sm"}
      cursor="pointer"
      onClick={() => handleBatchSelect(batch)}
      _hover={{
        shadow: colorMode === "dark" ? "xl" : "md",
        transform: "translateY(-2px)",
      }}
      transition="all 0.2s"
    >
      <Card.Body p="4">
        <VStack align="stretch" spacing="3">
          <VStack align="start" spacing="1">
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
              Academic Year: {batch.academicYear}
            </Text>
          </VStack>

          {batch.description && (
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
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

          <Button
            leftIcon={<LuEye />}
            colorPalette="teal"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleBatchSelect(batch);
            }}
          >
            Manage Classes
          </Button>
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

  return (
    <Box
      p={{ base: "4", md: "6" }}
      maxW="full"
      minH="100vh"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
    >
      <VStack spacing="6" align="stretch">
        {/* Header */}
        <Box>
          <Heading
            size="lg"
            mb="2"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Choose a Batch
          </Heading>
          <Text
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
            fontSize="md"
          >
            Select a batch to manage its classes
          </Text>
        </Box>

        {/* Search and View Toggle */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4">
            <Flex gap="4" align="center">
              <InputGroup flex="1" startElement={<LuSearch />}>
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
                <LuUsers
                  size="48"
                  color={colorMode === "dark" ? "#4A5568" : "#A0AEC0"}
                />
              </Box>
              <Text
                fontSize="lg"
                fontWeight="medium"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                {batches.length === 0
                  ? "No batches available"
                  : "No batches found"}
              </Text>
              <Text
                mt="2"
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.500"}
              >
                {batches.length === 0
                  ? "Please contact your administrator to create batches before you can manage classes."
                  : "Try adjusting your search"}
              </Text>
            </Card.Body>
          </Card.Root>
        ) : viewMode === "card" ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="6" gap="6">
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
                    Status
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    w="120px"
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
                    onClick={() => handleBatchSelect(batch)}
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
                          {getStatusBadge(batch)}
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
                      {getStatusBadge(batch)}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        size="sm"
                        colorPalette="teal"
                        leftIcon={<LuEye />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBatchSelect(batch);
                        }}
                      >
                        Manage
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default ManageClass;
