import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  VStack,
  Heading,
  Text,
  Button,
  Stack,
  Alert,
  Spinner,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useColorMode } from "../../../../components/ui/color-mode";
import attendanceService from "../../../../services/attendance.js";
import { LuSave } from "react-icons/lu";
import DeletePrompt from "../../../../components/DeletePrompt.jsx";
import SessionDetailsForm from "./SessionDetailsForm.jsx";
import StudentList from "./StudentList.jsx";

const MarkAttendanceCard = ({
  classData,
  onSave,
  onCancel,
  editingRecord,
  viewingRecord,
  mode = "create",
}) => {
  const { colorMode } = useColorMode();

  // Responsive breakpoints
  const isMobile = useBreakpointValue({ base: true, md: false });
  const cardPadding = useBreakpointValue({ base: 4, md: 8 });
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" });

  // States for form data
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [startHour, setStartHour] = useState("10");
  const [startMinute, setStartMinute] = useState("00");
  const [startPeriod, setStartPeriod] = useState("AM");
  const [endHour, setEndHour] = useState("01");
  const [endMinute, setEndMinute] = useState("00");
  const [endPeriod, setEndPeriod] = useState("PM");

  // States for student management
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editingNoteFor, setEditingNoteFor] = useState(null); // Track which student's note is being edited
  const [existingAttendanceRecords, setExistingAttendanceRecords] = useState(
    []
  );
  const [dateError, setDateError] = useState("");

  // Initialize students from classData and populate existing data if editing/viewing
  useEffect(() => {
    if (classData?.enrolledStudents) {
      const studentList = classData.enrolledStudents.map((student) => ({
        id: student._id,
        name: student.userDetails
          ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
          : student.email,
        email: student.email,
        profileImage: student.userDetails?.profileImageUrl,
      }));
      setStudents(studentList);

      // Initialize attendance data
      const initialAttendance = {};
      studentList.forEach((student) => {
        initialAttendance[student.id] = {
          status: null,
          notes: "",
        };
      });

      // If editing or viewing, populate existing data
      if (
        (editingRecord || viewingRecord) &&
        (editingRecord?.attendanceRecords || viewingRecord?.attendanceRecords)
      ) {
        const existingRecord = editingRecord || viewingRecord;

        // Set date and time from existing record
        if (existingRecord.sessionDate) {
          setSelectedDate(
            new Date(existingRecord.sessionDate).toISOString().split("T")[0]
          );
        }

        if (existingRecord.sessionTime) {
          // Parse session time (e.g., "10:00 AM - 01:00 PM")
          const [startTime, endTime] = existingRecord.sessionTime.split(" - ");
          if (startTime && endTime) {
            const [startHourMin, startPer] = startTime.split(" ");
            const [startH, startM] = startHourMin.split(":");
            setStartHour(startH);
            setStartMinute(startM);
            setStartPeriod(startPer);

            const [endHourMin, endPer] = endTime.split(" ");
            const [endH, endM] = endHourMin.split(":");
            setEndHour(endH);
            setEndMinute(endM);
            setEndPeriod(endPer);
          }
        }

        // Populate attendance records
        existingRecord.attendanceRecords.forEach((record) => {
          if (initialAttendance[record.studentId._id || record.studentId]) {
            initialAttendance[record.studentId._id || record.studentId] = {
              status: record.status,
              notes: record.notes || "",
            };
          }
        });
      }

      setAttendanceData(initialAttendance);
    }
  }, [classData, editingRecord, viewingRecord]);

  // Fetch existing attendance records to check for duplicate dates
  useEffect(() => {
    const fetchExistingRecords = async () => {
      if (classData?._id && mode === "create") {
        try {
          const response = await attendanceService.getClassAttendance(
            classData._id
          );
          if (response.success && response.data) {
            setExistingAttendanceRecords(response.data.attendanceRecords || []);
          }
        } catch (error) {
          console.error("Error fetching existing attendance records:", error);
          setExistingAttendanceRecords([]);
        }
      }
    };

    fetchExistingRecords();
  }, [classData, mode]);

  // Date change handler with validation
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setDateError("");

    // Check for duplicate dates only in create mode
    if (mode === "create" && existingAttendanceRecords.length > 0) {
      const isDuplicateDate = existingAttendanceRecords.some((record) => {
        const existingDate = new Date(record.sessionDate)
          .toISOString()
          .split("T")[0];
        return existingDate === newDate;
      });

      if (isDuplicateDate) {
        setDateError(
          "Attendance for this date already exists. Please choose a different date."
        );
      }
    }
  };

  // Sort students based on current sort order
  const sortedStudents = useMemo(() => {
    const sorted = [...students].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    return sorted;
  }, [students, sortOrder]);

  // Handle attendance status change
  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status: status,
      },
    }));
  };

  // Handle notes change
  const handleNotesChange = (studentId, notes) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes: notes,
      },
    }));
  };

  // Clear student data
  const clearStudentData = (studentId) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        status: null,
        notes: "",
      },
    }));
  };

  // Handle delete student data with confirmation
  const handleDeleteStudentData = (student) => {
    setSelectedStudent(student);
    setShowDeleteModal(true);
  };

  const confirmDeleteStudentData = () => {
    if (!selectedStudent) return;

    setDeleteLoading(true);
    clearStudentData(selectedStudent.id);
    setShowDeleteModal(false);
    setSelectedStudent(null);
    setDeleteLoading(false);
  };

  const cancelDeleteStudentData = () => {
    setShowDeleteModal(false);
    setSelectedStudent(null);
  };

  // Note editing functions
  const startEditingNote = (studentId) => {
    setEditingNoteFor(studentId);
  };

  const cancelEditingNote = () => {
    setEditingNoteFor(null);
  };

  const clearNote = (studentId) => {
    handleNotesChange(studentId, "");
    setEditingNoteFor(null);
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // Toggle all selection
  const toggleAllSelection = () => {
    const allStudentIds = students.map((s) => s.id);
    if (selectedStudents.length === allStudentIds.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(allStudentIds);
    }
  };

  // Clear selected students' statuses
  const clearSelectedStatuses = () => {
    const updatedAttendance = { ...attendanceData };
    selectedStudents.forEach((studentId) => {
      updatedAttendance[studentId] = {
        ...updatedAttendance[studentId],
        status: null,
      };
    });
    setAttendanceData(updatedAttendance);
    setSelectedStudents([]);
  };

  // Select all students
  const selectAllStudents = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  };

  // Toggle select mode
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedStudents([]);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Apply bulk status to selected students
  const applyBulkStatus = (status) => {
    const updatedAttendance = { ...attendanceData };
    selectedStudents.forEach((studentId) => {
      updatedAttendance[studentId] = {
        ...updatedAttendance[studentId],
        status: status,
      };
    });
    setAttendanceData(updatedAttendance);
    setSelectedStudents([]);
    setSelectMode(false);
  };

  // Format session time
  const formatSessionTime = () => {
    return `${startHour}:${startMinute} ${startPeriod} - ${endHour}:${endMinute} ${endPeriod}`;
  };

  // Validate form data
  const validateForm = () => {
    if (!selectedDate) {
      setError("Please select a date");
      return false;
    }

    // Check for date error (duplicate date)
    if (dateError) {
      setError(dateError);
      return false;
    }

    // Check if at least one student has attendance marked
    const hasAttendance = Object.values(attendanceData).some(
      (data) => data.status !== null
    );
    if (!hasAttendance) {
      setError("Please mark attendance for at least one student");
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const sessionTime = formatSessionTime();
      const attendanceRecords = Object.entries(attendanceData)
        .filter(([, data]) => data.status !== null)
        .map(([studentId, data]) => ({
          studentId,
          status: data.status,
          notes: data.notes,
        }));

      const formData = {
        classId: classData._id,
        batchId: classData.linkedBatch._id,
        sessionDate: selectedDate,
        sessionTime,
        attendanceRecords,
      };

      // Validate data before submission
      const validation = attendanceService.validateAttendanceData(formData);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return;
      }

      let response;

      if (mode === "edit" && editingRecord) {
        // Update existing attendance record
        response = await attendanceService.updateAttendance(
          editingRecord._id,
          formData
        );
      } else {
        // Check if attendance already exists for this date (only for new records)
        const existingCheck = await attendanceService.checkAttendanceExists(
          classData._id,
          selectedDate
        );

        if (existingCheck.exists) {
          setError(
            "Attendance already exists for this date. Please choose a different date or update the existing record."
          );
          return;
        }

        // Create new attendance record
        response = await attendanceService.createAttendance(formData);
      }

      if (response.success) {
        // Show success message
        alert(
          mode === "edit"
            ? "Attendance updated successfully!"
            : "Attendance marked successfully!"
        );

        // Call parent onSave callback if provided
        if (onSave) {
          onSave(response.data);
        }
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save attendance";
      setError(errorMessage);

      // Show error message
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card.Root
      p={cardPadding}
      maxW={{ base: "100%", md: "none" }}
      w="full"
      mx="auto"
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      shadow={colorMode === "dark" ? "lg" : "md"}
    >
      <VStack spacing={isMobile ? 4 : 8} align="stretch">
        {/* Header */}
        <Box>
          <Heading
            size="lg"
            mb={2}
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            {mode === "view"
              ? "View Attendance"
              : mode === "edit"
              ? "Edit Attendance"
              : "Mark Attendance"}
          </Heading>
          <Text color={colorMode === "dark" ? "gray.400" : "gray.600"}>
            {classData?.className} - {classData?.linkedBatch?.batchName}
          </Text>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}

        {/* Session Details Form */}
        <SessionDetailsForm
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          dateError={dateError}
          startHour={startHour}
          startMinute={startMinute}
          startPeriod={startPeriod}
          endHour={endHour}
          endMinute={endMinute}
          endPeriod={endPeriod}
          onStartHourChange={setStartHour}
          onStartMinuteChange={setStartMinute}
          onStartPeriodChange={setStartPeriod}
          onEndHourChange={setEndHour}
          onEndMinuteChange={setEndMinute}
          onEndPeriodChange={setEndPeriod}
          formatSessionTime={formatSessionTime}
          mode={mode}
        />

        {/* Student Attendance List */}
        <Card.Root
          p={{ base: 4, md: 6 }}
          bg={colorMode === "dark" ? "gray.700" : "gray.50"}
          borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
        >
          <StudentList
            students={sortedStudents}
            attendanceData={attendanceData}
            onStatusChange={handleStatusChange}
            onNotesChange={handleNotesChange}
            editingNoteFor={editingNoteFor}
            onStartEditingNote={startEditingNote}
            onCancelEditingNote={cancelEditingNote}
            onClearNote={clearNote}
            onDeleteStudentData={handleDeleteStudentData}
            selectedStudents={selectedStudents}
            onToggleSelection={toggleStudentSelection}
            onToggleAllSelection={toggleAllSelection}
            onClearSelectedStatuses={clearSelectedStatuses}
            onSelectAll={selectAllStudents}
            selectMode={selectMode}
            onToggleSelectMode={toggleSelectMode}
            sortOrder={sortOrder}
            onToggleSortOrder={toggleSortOrder}
            onApplyBulkStatus={applyBulkStatus}
            mode={mode}
          />
        </Card.Root>

        {/* Action Buttons */}
        <Stack
          direction={isMobile ? "column" : "row"}
          justify="flex-end"
          spacing={3}
          width="full"
          pt={2}
        >
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            size={buttonSize}
            width={isMobile ? "full" : "auto"}
            borderColor={colorMode === "dark" ? "gray.500" : "gray.300"}
            color={colorMode === "dark" ? "gray.300" : "gray.700"}
            _hover={{
              borderColor: colorMode === "dark" ? "gray.400" : "gray.400",
              color: colorMode === "dark" ? "gray.200" : "gray.800",
            }}
          >
            Cancel
          </Button>
          {mode !== "view" && (
            <Button
              colorPalette="teal"
              onClick={handleSubmit}
              disabled={isLoading}
              leftIcon={isLoading ? <Spinner size="sm" /> : <LuSave />}
              size={buttonSize}
              width={isMobile ? "full" : "auto"}
              loading={isLoading}
              loadingText={mode === "edit" ? "Updating..." : "Saving..."}
            >
              {isLoading
                ? mode === "edit"
                  ? "Updating..."
                  : "Saving..."
                : mode === "edit"
                ? "Update Attendance"
                : "Save Attendance"}
            </Button>
          )}
        </Stack>

        {/* Delete Confirmation Dialog */}
        <DeletePrompt
          isOpen={showDeleteModal}
          onClose={cancelDeleteStudentData}
          onConfirm={confirmDeleteStudentData}
          title="Clear Student Status"
          description="Are you sure you want to clear the attendance status and notes for this student?"
          itemName={selectedStudent?.name || ""}
          isLoading={deleteLoading}
          confirmText="Clear Status"
          cancelText="Cancel"
        />
      </VStack>
    </Card.Root>
  );
};

export default MarkAttendanceCard;
