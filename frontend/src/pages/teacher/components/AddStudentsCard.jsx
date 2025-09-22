import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Avatar,
  Alert,
  InputGroup,
  Input,
  Spinner,
  Center,
  Checkbox,
  IconButton,
  Badge,
} from "@chakra-ui/react";
import {
  LuUsers,
  LuPhone,
  LuMail,
  LuSearch,
  LuUserPlus,
  LuX,
  LuEye,
  LuCheck,
  LuSquare,
} from "react-icons/lu";
import { useColorMode } from "../../../components/ui/color-mode";
import classService from "../../../services/classes.js";
import ViewUserCard from "../../../components/ViewUserCard.jsx";

const AddStudentsCard = ({ classData, onClose, onStudentsAdded }) => {
  const { colorMode } = useColorMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [addingIndividual, setAddingIndividual] = useState(null);

  // Fetch available students
  useEffect(() => {
    const fetchAvailableStudents = async () => {
      try {
        setLoading(true);
        const response = await classService.getAvailableStudents(classData._id);
        console.log("API Response:", response);
        if (response.success && response.data && response.data.data) {
          setAvailableStudents(response.data.data.students || []);
        } else {
          setError(response.message || "Failed to fetch available students");
        }
      } catch (error) {
        console.error("Error fetching available students:", error);
        setError("Failed to fetch available students");
      } finally {
        setLoading(false);
      }
    };

    if (classData?._id) {
      fetchAvailableStudents();
    }
  }, [classData._id]);

  // Filter students based on search term
  const filteredStudents = availableStudents.filter(
    (student) =>
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.userDetails?.firstName &&
        `${student.userDetails.firstName} ${student.userDetails.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const handleStudentToggle = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((student) => student._id));
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      setError("Please select at least one student to add");
      return;
    }

    try {
      setAdding(true);
      const response = await classService.addStudentsToClass(
        classData._id,
        selectedStudents
      );
      if (response.success) {
        if (onStudentsAdded) {
          onStudentsAdded(selectedStudents.length);
        }
        onClose();
      } else {
        setError(response.message || "Failed to add students");
      }
    } catch (error) {
      console.error("Error adding students:", error);
      setError("Failed to add students to class");
    } finally {
      setAdding(false);
    }
  };

  const handleAddIndividualStudent = async (studentId) => {
    try {
      setAddingIndividual(studentId);
      const response = await classService.addStudentsToClass(classData._id, [
        studentId,
      ]);
      if (response.success) {
        // Remove the added student from available students list
        setAvailableStudents((prev) =>
          prev.filter((student) => student._id !== studentId)
        );
        if (onStudentsAdded) {
          onStudentsAdded(1);
        }
      } else {
        setError(response.message || "Failed to add student");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      setError("Failed to add student to class");
    } finally {
      setAddingIndividual(null);
    }
  };

  const handleStudentClick = (student) => {
    if (multiSelectMode) {
      handleStudentToggle(student._id);
    } else {
      setViewingStudent(student);
    }
  };

  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    if (!multiSelectMode) {
      setSelectedStudents([]);
    }
  };

  return (
    <>
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
        maxH={{ base: "85vh", md: "80vh" }}
        overflow="hidden"
        w={{ base: "95vw", md: "100%" }}
        maxW={{ base: "95vw", md: "none" }}
        mx={{ base: "auto", md: "0" }}
        position={{ base: "relative", md: "static" }}
        left={{ base: "50%", md: "auto" }}
        transform={{ base: "translateX(-50%)", md: "none" }}
      >
        <Card.Header
          p={{ base: "3", md: "4" }}
          borderBottomWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          flexShrink={0}
        >
          <HStack justify="space-between" wrap="wrap" gap={2}>
            <VStack align="start" spacing={1} flex="1" minW="0">
              <Text
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
                fontSize={{ base: "md", md: "lg" }}
              >
                Add Students to Class
              </Text>
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                Select students from {classData?.linkedBatch?.batchName} batch
                to add to this class
              </Text>
            </VStack>
            <Button
              size={{ base: "sm", md: "md" }}
              variant="ghost"
              onClick={onClose}
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
              flexShrink={0}
            >
              <LuX />
            </Button>
          </HStack>
        </Card.Header>

        <Card.Body
          p="0"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          {/* Sticky Search Bar and Controls */}
          <Box
            position="sticky"
            top="0"
            zIndex="10"
            p={{ base: "3", md: "4" }}
            borderBottomWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            flexShrink={0}
            bg={colorMode === "dark" ? "gray.800" : "white"}
          >
            <VStack spacing={{ base: 2, md: 3 }}>
              <InputGroup startElement={<LuSearch />}>
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  _placeholder={{
                    color: colorMode === "dark" ? "gray.400" : "gray.500",
                  }}
                  size={{ base: "sm", md: "md" }}
                />
              </InputGroup>

              {filteredStudents.length > 0 && (
                <HStack justify="space-between" w="full">
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    {filteredStudents.length} student
                    {filteredStudents.length !== 1 ? "s" : ""} available
                  </Text>
                  <Button
                    size="sm"
                    variant={multiSelectMode ? "solid" : "outline"}
                    bg={
                      multiSelectMode
                        ? colorMode === "dark"
                          ? "#0d9488"
                          : "#0d9488"
                        : "transparent"
                    }
                    color={
                      multiSelectMode
                        ? "white"
                        : colorMode === "dark"
                        ? "gray.300"
                        : "teal.600"
                    }
                    borderColor={colorMode === "dark" ? "#0d9488" : "#0d9488"}
                    _hover={{
                      bg: multiSelectMode
                        ? colorMode === "dark"
                          ? "#0f766e"
                          : "#0f766e"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "teal.50",
                      borderColor: colorMode === "dark" ? "#0f766e" : "#0f766e",
                    }}
                    onClick={toggleMultiSelectMode}
                    leftIcon={multiSelectMode ? <LuCheck /> : <LuSquare />}
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    {multiSelectMode ? "Exit Multi-Select" : "Multi-Select"}
                  </Button>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Error Alert */}
          {error && (
            <Box p={{ base: "3", md: "4" }} flexShrink={0}>
              <Alert.Root status="error">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title fontSize={{ base: "sm", md: "md" }}>
                    Error
                  </Alert.Title>
                  <Alert.Description fontSize={{ base: "xs", md: "sm" }}>
                    {error}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            </Box>
          )}

          {/* Scrollable Students List */}
          <Box
            flex="1"
            overflow="auto"
            css={{
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: colorMode === "dark" ? "#4A5568" : "#CBD5E0",
                borderRadius: "24px",
              },
            }}
          >
            {loading ? (
              <Center p="8">
                <VStack spacing={4}>
                  <Spinner size="lg" color="teal.500" />
                  <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
                    Loading available students...
                  </Text>
                </VStack>
              </Center>
            ) : filteredStudents.length > 0 ? (
              <>
                {/* Select All - Only show in multi-select mode */}
                {multiSelectMode && (
                  <Box
                    p={{ base: "3", md: "4" }}
                    borderBottomWidth="1px"
                    borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                  >
                    <HStack>
                      <Checkbox.Root
                        checked={
                          selectedStudents.length === filteredStudents.length &&
                          filteredStudents.length > 0
                            ? true
                            : selectedStudents.length > 0 &&
                              selectedStudents.length < filteredStudents.length
                            ? "indeterminate"
                            : false
                        }
                        onCheckedChange={handleSelectAll}
                        colorPalette="teal"
                        size={{ base: "sm", md: "md" }}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                      </Checkbox.Root>
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        fontWeight="medium"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        Select All ({filteredStudents.length} students)
                      </Text>
                    </HStack>
                  </Box>
                )}

                {/* Student Cards */}
                <VStack
                  spacing={{ base: 1, md: 2 }}
                  p={{ base: "3", md: "4" }}
                  align="stretch"
                >
                  {filteredStudents.map((student) => (
                    <Card.Root
                      key={student._id}
                      bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                      borderWidth="1px"
                      borderColor={
                        multiSelectMode &&
                        selectedStudents.includes(student._id)
                          ? "teal.500"
                          : colorMode === "dark"
                          ? "gray.600"
                          : "gray.200"
                      }
                      cursor="pointer"
                      _hover={{
                        borderColor: "teal.400",
                        shadow: "sm",
                      }}
                      transition="all 0.2s"
                      onClick={() => handleStudentClick(student)}
                      size={{ base: "sm", md: "md" }}
                    >
                      <Card.Body p={{ base: "3", md: "4" }}>
                        <HStack justify="space-between" align="center">
                          <HStack
                            spacing={{ base: 2, md: 3 }}
                            flex="1"
                            minW="0"
                          >
                            {/* Checkbox - Only show in multi-select mode */}
                            {multiSelectMode && (
                              <Checkbox.Root
                                checked={selectedStudents.includes(student._id)}
                                onCheckedChange={(e) => {
                                  e.stopPropagation();
                                  handleStudentToggle(student._id);
                                }}
                                colorPalette="teal"
                                onClick={(e) => e.stopPropagation()}
                                size={{ base: "sm", md: "md" }}
                              >
                                <Checkbox.HiddenInput />
                                <Checkbox.Control>
                                  <Checkbox.Indicator />
                                </Checkbox.Control>
                              </Checkbox.Root>
                            )}

                            <Avatar.Root size={{ base: "sm", md: "md" }}>
                              {student.userDetails?.profileImageUrl && (
                                <Avatar.Image
                                  src={student.userDetails.profileImageUrl}
                                  alt={
                                    student.userDetails
                                      ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                                      : student.email
                                  }
                                />
                              )}
                              <Avatar.Fallback
                                name={
                                  student.userDetails
                                    ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                                    : student.email
                                }
                              >
                                {student.userDetails
                                  ? `${
                                      student.userDetails.firstName?.charAt(
                                        0
                                      ) || ""
                                    }${
                                      student.userDetails.lastName?.charAt(0) ||
                                      ""
                                    }`
                                  : student.email?.charAt(0).toUpperCase()}
                              </Avatar.Fallback>
                            </Avatar.Root>

                            <VStack
                              align="start"
                              spacing={{ base: 0.5, md: 1 }}
                              flex="1"
                              minW="0"
                            >
                              <Text
                                fontWeight="semibold"
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                                isTruncated
                                fontSize={{ base: "sm", md: "md" }}
                              >
                                {student.userDetails
                                  ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                                  : "Name not set"}
                              </Text>

                              <HStack
                                spacing={{ base: 2, md: 4 }}
                                fontSize={{ base: "xs", md: "sm" }}
                              >
                                <HStack spacing={1}>
                                  <LuMail
                                    size={12}
                                    color={
                                      colorMode === "dark"
                                        ? "#D1D5DB"
                                        : "#6B7280"
                                    }
                                  />
                                  <Text
                                    color={
                                      colorMode === "dark"
                                        ? "gray.300"
                                        : "gray.600"
                                    }
                                    isTruncated
                                    maxW={{ base: "120px", md: "200px" }}
                                  >
                                    {student.email}
                                  </Text>
                                </HStack>

                                {student.userDetails?.phoneNumber && (
                                  <HStack
                                    spacing={1}
                                    display={{ base: "none", md: "flex" }}
                                  >
                                    <LuPhone
                                      size={12}
                                      color={
                                        colorMode === "dark"
                                          ? "#D1D5DB"
                                          : "#6B7280"
                                      }
                                    />
                                    <Text
                                      color={
                                        colorMode === "dark"
                                          ? "gray.300"
                                          : "gray.600"
                                      }
                                    >
                                      {student.userDetails.phoneNumber}
                                    </Text>
                                  </HStack>
                                )}
                              </HStack>

                              <Badge
                                colorPalette="green"
                                variant="subtle"
                                size={{ base: "xs", md: "sm" }}
                              >
                                Student
                              </Badge>
                            </VStack>
                          </HStack>

                          {/* Action Buttons */}
                          <HStack spacing={{ base: 1, md: 2 }}>
                            {!multiSelectMode && (
                              <>
                                {/* Desktop Actions */}
                                <HStack
                                  spacing={2}
                                  display={{ base: "none", md: "flex" }}
                                >
                                  <IconButton
                                    size="sm"
                                    variant="ghost"
                                    color={
                                      colorMode === "dark"
                                        ? "gray.300"
                                        : "gray.700"
                                    }
                                    _hover={{
                                      bg:
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.100",
                                      color:
                                        colorMode === "dark"
                                          ? "white"
                                          : "gray.900",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingStudent(student);
                                    }}
                                    title="View Details"
                                  >
                                    <LuEye />
                                  </IconButton>

                                  <Button
                                    size="sm"
                                    colorPalette="teal"
                                    leftIcon={<LuUserPlus />}
                                    loading={addingIndividual === student._id}
                                    loadingText="Adding..."
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddIndividualStudent(student._id);
                                    }}
                                  >
                                    Add
                                  </Button>
                                </HStack>

                                {/* Mobile Actions */}
                                <VStack
                                  spacing={1}
                                  display={{ base: "flex", md: "none" }}
                                >
                                  <IconButton
                                    size="xs"
                                    variant="ghost"
                                    color={
                                      colorMode === "dark"
                                        ? "gray.300"
                                        : "gray.700"
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingStudent(student);
                                    }}
                                    title="View Details"
                                  >
                                    <LuEye />
                                  </IconButton>

                                  <Button
                                    size="xs"
                                    colorPalette="teal"
                                    loading={addingIndividual === student._id}
                                    loadingText="..."
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddIndividualStudent(student._id);
                                    }}
                                    fontSize="xs"
                                  >
                                    Add
                                  </Button>
                                </VStack>
                              </>
                            )}
                          </HStack>
                        </HStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </VStack>
              </>
            ) : (
              <Box p="8" textAlign="center">
                <VStack spacing={4}>
                  <LuUsers
                    size={48}
                    color={colorMode === "dark" ? "#6B7280" : "#9CA3AF"}
                  />
                  <VStack spacing={2}>
                    <Text
                      fontWeight="medium"
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                    >
                      {searchTerm
                        ? "No students found"
                        : "No Available Students"}
                    </Text>
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    >
                      {searchTerm
                        ? "Try adjusting your search terms."
                        : "All students from this batch are already enrolled in the class."}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            )}
          </Box>

          {/* Sticky Footer */}
          {multiSelectMode && filteredStudents.length > 0 ? (
            /* Multi-select Footer */
            <Box
              p={{ base: "3", md: "4" }}
              borderTopWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              flexShrink={0}
              bg={colorMode === "dark" ? "gray.800" : "white"}
            >
              <HStack justify="space-between">
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  {selectedStudents.length} student
                  {selectedStudents.length !== 1 ? "s" : ""} selected
                </Text>
                <HStack spacing={{ base: 2, md: 3 }}>
                  <Button
                    variant="outline"
                    onClick={() => setMultiSelectMode(false)}
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    size={{ base: "sm", md: "md" }}
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftIcon={<LuUserPlus />}
                    colorPalette="teal"
                    onClick={handleAddStudents}
                    loading={adding}
                    loadingText="Adding..."
                    disabled={selectedStudents.length === 0}
                    size={{ base: "sm", md: "md" }}
                    fontSize={{ base: "xs", md: "sm" }}
                  >
                    Add {selectedStudents.length} Student
                    {selectedStudents.length !== 1 ? "s" : ""}
                  </Button>
                </HStack>
              </HStack>
            </Box>
          ) : (
            /* Normal Footer */
            <Box
              p={{ base: "3", md: "4" }}
              borderTopWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              flexShrink={0}
              bg={colorMode === "dark" ? "gray.800" : "white"}
            >
              <HStack justify="space-between">
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  {filteredStudents.length > 0
                    ? `${filteredStudents.length} student${
                        filteredStudents.length !== 1 ? "s" : ""
                      } available${
                        searchTerm
                          ? ` (filtered from ${availableStudents.length})`
                          : ""
                      }`
                    : searchTerm
                    ? "No students found"
                    : "No available students"}
                </Text>
                <Button
                  variant="outline"
                  size={{ base: "sm", md: "md" }}
                  onClick={onClose}
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  fontSize={{ base: "xs", md: "sm" }}
                  flexShrink={0}
                >
                  Close
                </Button>
              </HStack>
            </Box>
          )}
        </Card.Body>
      </Card.Root>

      {/* View Student Details Modal */}
      <ViewUserCard
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        user={viewingStudent}
      />
    </>
  );
};

export default AddStudentsCard;
