import React, { useState, useMemo } from "react";
import {
  VStack,
  HStack,
  Table,
  InputGroup,
  Input,
  Button,
  Text,
  Checkbox,
  Box,
  Heading,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useColorMode } from "../../../../components/ui/color-mode";
import {
  LuSearch,
  LuTrash,
  LuUsers,
  LuArrowUp,
  LuArrowDown,
} from "react-icons/lu";
import StudentRow from "./StudentRow";

const StudentList = ({
  students,
  attendanceData,
  onStatusChange,
  onNotesChange,
  editingNoteFor,
  onStartEditingNote,
  onCancelEditingNote,
  onClearNote,
  onDeleteStudentData,
  selectedStudents,
  onToggleSelection,
  onToggleAllSelection,
  onClearSelectedStatuses,
  onSelectAll,
  selectMode,
  onToggleSelectMode,
  sortOrder,
  onToggleSortOrder,
  onApplyBulkStatus,
  mode,
}) => {
  const { colorMode } = useColorMode();
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useBreakpointValue({ base: true, lg: false });

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const isAllSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) => selectedStudents.includes(student.id));
  const isSomeSelected = filteredStudents.some((student) =>
    selectedStudents.includes(student.id)
  );

  if (isMobile) {
    return (
      <VStack spacing="4" align="stretch">
        {/* Controls Header */}
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
          <HStack spacing={2}>
            <LuUsers color={colorMode === "dark" ? "teal.300" : "teal.600"} />
            <Heading
              size="md"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Students ({students.length})
            </Heading>
          </HStack>

          <HStack spacing={2} flexWrap="wrap">
            {/* Sort Controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleSortOrder}
              leftIcon={sortOrder === "asc" ? <LuArrowUp /> : <LuArrowDown />}
              borderColor={colorMode === "dark" ? "gray.500" : "gray.300"}
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              _hover={{
                borderColor: "teal.500",
                color: "teal.500",
              }}
            >
              Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}
            </Button>

            {/* Select Students Toggle - Hide in view mode */}
            {mode !== "view" && (
              <Button
                variant={selectMode ? "solid" : "outline"}
                size="sm"
                colorPalette={selectMode ? "teal" : undefined}
                borderColor={
                  !selectMode
                    ? colorMode === "dark"
                      ? "gray.500"
                      : "gray.300"
                    : undefined
                }
                color={
                  !selectMode
                    ? colorMode === "dark"
                      ? "gray.300"
                      : "gray.700"
                    : undefined
                }
                _hover={
                  !selectMode
                    ? {
                        borderColor: "teal.500",
                        color: "teal.500",
                      }
                    : undefined
                }
                onClick={onToggleSelectMode}
              >
                {selectMode ? "Exit Select" : "Select Students"}
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Bulk Actions - Hide in view mode */}
        {mode !== "view" && selectMode && selectedStudents.length > 0 && (
          <Box
            p={3}
            bg={colorMode === "dark" ? "teal.900" : "teal.50"}
            borderColor={colorMode === "dark" ? "teal.700" : "teal.200"}
            borderWidth="1px"
            borderRadius="md"
          >
            <Text
              fontWeight="medium"
              mb={2}
              color={colorMode === "dark" ? "teal.200" : "teal.800"}
            >
              {selectedStudents.length} student
              {selectedStudents.length > 1 ? "s" : ""} selected:
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              <Button
                size="sm"
                colorPalette="green"
                onClick={() => onApplyBulkStatus("present")}
              >
                Mark Present
              </Button>
              <Button
                size="sm"
                colorPalette="red"
                onClick={() => onApplyBulkStatus("absent")}
              >
                Mark Absent
              </Button>
              <Button
                size="sm"
                colorPalette="orange"
                onClick={() => onApplyBulkStatus("late")}
              >
                Mark Late
              </Button>
              <Button
                size="sm"
                colorPalette="blue"
                onClick={() => onApplyBulkStatus("excused")}
              >
                Mark Excused
              </Button>
            </HStack>
          </Box>
        )}

        {/* Search Bar */}
        <Box>
          <InputGroup startElement={<LuSearch />}>
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={colorMode === "dark" ? "gray.700" : "white"}
              borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
            />
          </InputGroup>
        </Box>

        {/* Mobile Controls */}
        {mode !== "view" && selectMode && filteredStudents.length > 0 && (
          <HStack justify="space-between" flexWrap="wrap" gap="2">
            <Checkbox.Root
              checked={isAllSelected}
              indeterminate={
                isSomeSelected && !isAllSelected ? true : undefined
              }
              onCheckedChange={onToggleAllSelection}
              colorPalette="teal"
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>
                Select All ({filteredStudents.length})
              </Checkbox.Label>
            </Checkbox.Root>

            {selectedStudents.length > 0 && (
              <Button
                size="sm"
                colorPalette="red"
                variant="outline"
                leftIcon={<LuTrash />}
                onClick={onClearSelectedStatuses}
              >
                Clear Selected ({selectedStudents.length})
              </Button>
            )}
          </HStack>
        )}

        {/* Mobile Student Cards - No Table components */}
        <VStack spacing="3">
          {filteredStudents.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              attendanceData={attendanceData}
              onStatusChange={onStatusChange}
              onNotesChange={onNotesChange}
              editingNoteFor={editingNoteFor}
              onStartEditingNote={onStartEditingNote}
              onCancelEditingNote={onCancelEditingNote}
              onClearNote={onClearNote}
              onDeleteStudentData={onDeleteStudentData}
              selectedStudents={selectedStudents}
              onToggleSelection={onToggleSelection}
              selectMode={selectMode}
              mode={mode}
              isMobile={true} // Explicitly pass mobile prop
            />
          ))}
        </VStack>

        {filteredStudents.length === 0 && (
          <Text
            textAlign="center"
            color={colorMode === "dark" ? "gray.400" : "gray.500"}
            py="8"
          >
            {searchTerm
              ? "No students found matching your search."
              : "No students in this batch."}
          </Text>
        )}
      </VStack>
    );
  }

  // Desktop Table View - Only use Table components in desktop mode
  return (
    <VStack spacing="4" align="stretch">
      {/* Controls Header */}
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
        <HStack spacing={2}>
          <LuUsers color={colorMode === "dark" ? "teal.300" : "teal.600"} />
          <Heading
            size="md"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Students ({students.length})
          </Heading>
        </HStack>

        <HStack spacing={2} flexWrap="wrap">
          {/* Sort Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleSortOrder}
            leftIcon={sortOrder === "asc" ? <LuArrowUp /> : <LuArrowDown />}
            borderColor={colorMode === "dark" ? "gray.500" : "gray.300"}
            color={colorMode === "dark" ? "gray.300" : "gray.700"}
            _hover={{
              borderColor: "teal.500",
              color: "teal.500",
            }}
          >
            Sort {sortOrder === "asc" ? "A-Z" : "Z-A"}
          </Button>

          {/* Select Students Toggle - Hide in view mode */}
          {mode !== "view" && (
            <Button
              variant={selectMode ? "solid" : "outline"}
              size="sm"
              colorPalette={selectMode ? "teal" : undefined}
              borderColor={
                !selectMode
                  ? colorMode === "dark"
                    ? "gray.500"
                    : "gray.300"
                  : undefined
              }
              color={
                !selectMode
                  ? colorMode === "dark"
                    ? "gray.300"
                    : "gray.700"
                  : undefined
              }
              _hover={
                !selectMode
                  ? {
                      borderColor: "teal.500",
                      color: "teal.500",
                    }
                  : undefined
              }
              onClick={onToggleSelectMode}
            >
              {selectMode ? "Exit Select" : "Select Students"}
            </Button>
          )}
        </HStack>
      </HStack>

      {/* Bulk Actions - Hide in view mode */}
      {mode !== "view" && selectMode && selectedStudents.length > 0 && (
        <Box
          p={3}
          bg={colorMode === "dark" ? "teal.900" : "teal.50"}
          borderColor={colorMode === "dark" ? "teal.700" : "teal.200"}
          borderWidth="1px"
          borderRadius="md"
        >
          <Text
            fontWeight="medium"
            mb={2}
            color={colorMode === "dark" ? "teal.200" : "teal.800"}
          >
            {selectedStudents.length} student
            {selectedStudents.length > 1 ? "s" : ""} selected:
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            <Button
              size="sm"
              colorPalette="green"
              onClick={() => onApplyBulkStatus("present")}
            >
              Mark Present
            </Button>
            <Button
              size="sm"
              colorPalette="red"
              onClick={() => onApplyBulkStatus("absent")}
            >
              Mark Absent
            </Button>
            <Button
              size="sm"
              colorPalette="orange"
              onClick={() => onApplyBulkStatus("late")}
            >
              Mark Late
            </Button>
            <Button
              size="sm"
              colorPalette="blue"
              onClick={() => onApplyBulkStatus("excused")}
            >
              Mark Excused
            </Button>
          </HStack>
        </Box>
      )}

      {/* Search Bar */}
      <Box>
        <InputGroup startElement={<LuSearch />}>
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg={colorMode === "dark" ? "gray.700" : "white"}
            borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
          />
        </InputGroup>
      </Box>

      {/* Desktop Controls */}
      {mode !== "view" && selectMode && filteredStudents.length > 0 && (
        <HStack justify="space-between" flexWrap="wrap" gap="2">
          <Checkbox.Root
            checked={isAllSelected}
            indeterminate={isSomeSelected && !isAllSelected ? true : undefined}
            onCheckedChange={onToggleAllSelection}
            colorPalette="teal"
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label>
              Select All ({filteredStudents.length})
            </Checkbox.Label>
          </Checkbox.Root>

          {selectedStudents.length > 0 && (
            <Button
              size="sm"
              colorPalette="red"
              variant="outline"
              leftIcon={<LuTrash />}
              onClick={onClearSelectedStatuses}
            >
              Clear Selected ({selectedStudents.length})
            </Button>
          )}
        </HStack>
      )}

      {/* Desktop Table */}
      <Table.Root
        variant="outline"
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderRadius="lg"
        overflow="hidden"
        shadow="sm"
      >
        <Table.Header>
          <Table.Row bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
            {mode !== "view" && selectMode && <Table.ColumnHeader w="50px" />}
            <Table.ColumnHeader>
              <Text fontWeight="semibold">Student</Text>
            </Table.ColumnHeader>
            <Table.ColumnHeader>
              <Text fontWeight="semibold">Status</Text>
            </Table.ColumnHeader>
            {mode !== "view" && <Table.ColumnHeader w="80px" />}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filteredStudents.map((student) => (
            <StudentRow
              key={student.id}
              student={student}
              attendanceData={attendanceData}
              onStatusChange={onStatusChange}
              onNotesChange={onNotesChange}
              editingNoteFor={editingNoteFor}
              onStartEditingNote={onStartEditingNote}
              onCancelEditingNote={onCancelEditingNote}
              onClearNote={onClearNote}
              onDeleteStudentData={onDeleteStudentData}
              selectedStudents={selectedStudents}
              onToggleSelection={onToggleSelection}
              selectMode={selectMode}
              mode={mode}
              isMobile={false} // Explicitly pass desktop prop
            />
          ))}
        </Table.Body>
      </Table.Root>

      {filteredStudents.length === 0 && (
        <Text
          textAlign="center"
          color={colorMode === "dark" ? "gray.400" : "gray.500"}
          py="8"
        >
          {searchTerm
            ? "No students found matching your search."
            : "No students in this batch."}
        </Text>
      )}
    </VStack>
  );
};

export default StudentList;
