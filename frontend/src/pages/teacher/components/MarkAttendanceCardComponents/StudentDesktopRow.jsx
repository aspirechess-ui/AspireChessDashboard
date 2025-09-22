import React, { useState } from "react";
import {
  Table,
  HStack,
  VStack,
  Text,
  IconButton,
  Menu,
  Portal,
  RadioCard,
  Checkbox,
  Textarea,
  Button,
  Badge,
  Box,
} from "@chakra-ui/react";
import { useColorMode } from "../../../../components/ui/color-mode";
import {
  LuEllipsisVertical,
  LuSquarePen,
  LuX,
  LuUserCheck,
  LuClock,
  LuChevronDown,
  LuChevronUp,
} from "react-icons/lu";
import { FaTrash, FaUserTimes, FaUserMinus } from "react-icons/fa";

const TruncatedNote = ({ note, colorMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!note) return null;

  const maxLines = 3;
  const lines = note.split("\n");
  const shouldTruncate = lines.length > maxLines || note.length > 150;

  const displayNote =
    shouldTruncate && !isExpanded
      ? lines.slice(0, maxLines).join("\n") +
        (note.length > 150 && lines.length <= maxLines ? "..." : "")
      : note;

  return (
    <Box
      p="2"
      bg={colorMode === "dark" ? "gray.700" : "gray.50"}
      borderRadius="md"
      borderWidth="1px"
      borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
      maxW="300px"
    >
      <Text
        fontSize="sm"
        color={colorMode === "dark" ? "gray.300" : "gray.600"}
        fontStyle="italic"
        wordBreak="break-word"
        whiteSpace="pre-wrap"
      >
        {displayNote}
      </Text>

      {shouldTruncate && (
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsExpanded(!isExpanded)}
          color={colorMode === "dark" ? "teal.300" : "teal.600"}
          leftIcon={isExpanded ? <LuChevronUp /> : <LuChevronDown />}
          mt="1"
          p="1"
          h="auto"
          fontSize="xs"
          fontWeight="normal"
        >
          {isExpanded ? "Show less" : "Show more"}
        </Button>
      )}
    </Box>
  );
};

const StudentDesktopRow = ({
  student,
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
  selectMode,
  mode,
}) => {
  const { colorMode } = useColorMode();

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "green";
      case "absent":
        return "red";
      case "late":
        return "orange";
      case "excused":
        return "blue";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "present":
        return <LuUserCheck />;
      case "absent":
        return <FaUserTimes />;
      case "late":
        return <LuClock />;
      case "excused":
        return <FaUserMinus />;
      default:
        return null;
    }
  };

  return (
    <Table.Row
      bg={colorMode === "dark" ? "gray.800" : "white"}
      _hover={{
        bg: colorMode === "dark" ? "gray.700" : "gray.50",
      }}
    >
      {mode !== "view" && selectMode && (
        <Table.Cell py="4">
          <Checkbox.Root
            checked={selectedStudents.includes(student.id)}
            onCheckedChange={() => onToggleSelection(student.id)}
            colorPalette="teal"
            size="sm"
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
          </Checkbox.Root>
        </Table.Cell>
      )}

      <Table.Cell py="4">
        <VStack align="start" spacing="1">
          <Text
            fontWeight="medium"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            {student.name}
          </Text>
          <Text
            fontSize="sm"
            color={colorMode === "dark" ? "gray.400" : "gray.600"}
          >
            {student.email}
          </Text>
        </VStack>
      </Table.Cell>

      <Table.Cell py="4">
        <RadioCard.Root
          value={attendanceData[student.id]?.status || ""}
          onValueChange={(details) => {
            onStatusChange(student.id, details.value);
          }}
          colorPalette="teal"
          disabled={mode === "view"}
        >
          <HStack spacing="2">
            <RadioCard.Item
              value="present"
              variant="solid"
              bg={colorMode === "dark" ? "gray.700" : "white"}
              borderColor="gray.300"
              _checked={{
                borderColor: "green.500",
                bg: colorMode === "dark" ? "green.800" : "green.50",
                color: "green.600",
              }}
              size="sm"
              p="2"
              minW="10"
              h="10"
            >
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemText fontWeight="bold">P</RadioCard.ItemText>
                <RadioCard.ItemIndicator />
              </RadioCard.ItemControl>
            </RadioCard.Item>

            <RadioCard.Item
              value="absent"
              variant="solid"
              bg={colorMode === "dark" ? "gray.700" : "white"}
              borderColor="gray.300"
              _checked={{
                borderColor: "red.500",
                bg: colorMode === "dark" ? "red.800" : "red.50",
                color: "red.600",
              }}
              size="sm"
              p="2"
              minW="10"
              h="10"
            >
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemText fontWeight="bold">A</RadioCard.ItemText>
                <RadioCard.ItemIndicator />
              </RadioCard.ItemControl>
            </RadioCard.Item>

            <RadioCard.Item
              value="late"
              variant="solid"
              bg={colorMode === "dark" ? "gray.700" : "white"}
              borderColor="gray.300"
              _checked={{
                borderColor: "orange.500",
                bg: colorMode === "dark" ? "orange.800" : "orange.50",
                color: "orange.600",
              }}
              size="sm"
              p="2"
              minW="10"
              h="10"
            >
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemText fontWeight="bold">L</RadioCard.ItemText>
                <RadioCard.ItemIndicator />
              </RadioCard.ItemControl>
            </RadioCard.Item>

            <RadioCard.Item
              value="excused"
              variant="solid"
              bg={colorMode === "dark" ? "gray.700" : "white"}
              borderColor="gray.300"
              _checked={{
                borderColor: "blue.500",
                bg: colorMode === "dark" ? "blue.800" : "blue.50",
                color: "blue.600",
              }}
              size="sm"
              p="2"
              minW="10"
              h="10"
            >
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemText fontWeight="bold">E</RadioCard.ItemText>
                <RadioCard.ItemIndicator />
              </RadioCard.ItemControl>
            </RadioCard.Item>
          </HStack>
        </RadioCard.Root>
      </Table.Cell>

      <Table.Cell py="4">
        {attendanceData[student.id]?.status && (
          <Badge
            colorPalette={getStatusColor(attendanceData[student.id].status)}
            size="sm"
            variant="solid"
          >
            <HStack spacing={1}>
              {getStatusIcon(attendanceData[student.id].status)}
              <Text textTransform="capitalize">
                {attendanceData[student.id].status}
              </Text>
            </HStack>
          </Badge>
        )}
      </Table.Cell>

      <Table.Cell py="4" maxW="300px">
        {editingNoteFor === student.id ? (
          <VStack align="start" spacing="2" w="full">
            <Textarea
              value={attendanceData[student.id]?.notes || ""}
              onChange={(e) => onNotesChange(student.id, e.target.value)}
              placeholder="Add a note for this student..."
              size="sm"
              rows={2}
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              _placeholder={{
                color: colorMode === "dark" ? "gray.500" : "gray.500",
              }}
              _focus={{
                borderColor: "teal.500",
                boxShadow: "0 0 0 1px teal.500",
              }}
              minW="200px"
            />
            <HStack spacing="2">
              <Button
                size="xs"
                colorPalette="teal"
                onClick={() => onCancelEditingNote()}
              >
                Done
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => onClearNote(student.id)}
                color="red.500"
                borderColor="red.500"
              >
                Clear
              </Button>
            </HStack>
          </VStack>
        ) : (
          attendanceData[student.id]?.notes && (
            <TruncatedNote
              note={attendanceData[student.id].notes}
              colorMode={colorMode}
            />
          )
        )}
      </Table.Cell>

      <Table.Cell py="4">
        {attendanceData[student.id]?.status && (
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                size="sm"
                variant="ghost"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                _hover={{
                  bg: colorMode === "dark" ? "gray.700" : "gray.100",
                  color: "teal.500",
                }}
              >
                <LuEllipsisVertical />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  shadow="lg"
                >
                  {mode !== "view" && (
                    <>
                      <Menu.Item
                        value="edit-note"
                        onClick={() => onStartEditingNote(student.id)}
                        color={colorMode === "dark" ? "gray.100" : "gray.900"}
                        _hover={{
                          bg: colorMode === "dark" ? "gray.600" : "gray.100",
                        }}
                      >
                        <HStack>
                          <LuSquarePen />
                          <Text>
                            {attendanceData[student.id]?.notes
                              ? "Edit Note"
                              : "Add Note"}
                          </Text>
                        </HStack>
                      </Menu.Item>
                      {attendanceData[student.id]?.notes && (
                        <Menu.Item
                          value="clear-note"
                          onClick={() => onClearNote(student.id)}
                          color="red.400"
                          _hover={{
                            bg: colorMode === "dark" ? "red.900" : "red.50",
                            color: "red.500",
                          }}
                        >
                          <HStack>
                            <LuX />
                            <Text>Clear Note</Text>
                          </HStack>
                        </Menu.Item>
                      )}
                      <Menu.Item
                        value="clear-status"
                        onClick={() => onDeleteStudentData(student)}
                        color="red.400"
                        _hover={{
                          bg: colorMode === "dark" ? "red.900" : "red.50",
                          color: "red.500",
                        }}
                      >
                        <HStack>
                          <FaTrash />
                          <Text>Clear Status</Text>
                        </HStack>
                      </Menu.Item>
                    </>
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        )}
      </Table.Cell>
    </Table.Row>
  );
};

export default StudentDesktopRow;
