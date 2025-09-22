import React, { useState } from "react";
import {
  Box,
  Card,
  VStack,
  HStack,
  Text,
  IconButton,
  Menu,
  Portal,
  RadioCard,
  Checkbox,
  Textarea,
  Button,
  Badge,
  SimpleGrid,
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
      maxW={{ base: "full", md: "300px" }}
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

const StudentMobileCard = ({
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
    <Card.Root
      w="full"
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderWidth="1px"
      borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
      shadow="sm"
      _hover={{
        shadow: "md",
        borderColor: colorMode === "dark" ? "gray.500" : "gray.300",
      }}
    >
      <Card.Body p="4">
        <VStack spacing="3" align="stretch">
          {/* Student Info Header with Checkbox */}
          <HStack justify="space-between" align="start">
            <HStack spacing="3" flex="1">
              {mode !== "view" && selectMode && (
                <Checkbox.Root
                  checked={selectedStudents.includes(student.id)}
                  onCheckedChange={() => onToggleSelection(student.id)}
                  colorPalette="teal"
                  size="sm"
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              )}

              <VStack align="start" spacing="1" flex="1">
                <Text
                  fontWeight="semibold"
                  fontSize="md"
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
            </HStack>

            {/* Action Menu */}
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
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                      shadow="lg"
                    >
                      {mode !== "view" && (
                        <>
                          <Menu.Item
                            value="edit-note"
                            onClick={() => onStartEditingNote(student.id)}
                            color={
                              colorMode === "dark" ? "gray.100" : "gray.900"
                            }
                            _hover={{
                              bg:
                                colorMode === "dark" ? "gray.600" : "gray.100",
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
          </HStack>

          {/* Notes Section - Block element below name */}
          <Box>
            {editingNoteFor === student.id ? (
              <Box w="full">
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
                />
                <HStack spacing="2" mt="2">
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
              </Box>
            ) : (
              attendanceData[student.id]?.notes && (
                <TruncatedNote
                  note={attendanceData[student.id].notes}
                  colorMode={colorMode}
                />
              )
            )}
          </Box>

          {/* Status Selection */}
          <Box>
            <Text
              fontSize="sm"
              fontWeight="medium"
              mb="3"
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
            >
              Attendance Status
            </Text>
            <RadioCard.Root
              value={attendanceData[student.id]?.status || ""}
              onValueChange={(details) => {
                onStatusChange(student.id, details.value);
              }}
              colorPalette="teal"
              disabled={mode === "view"}
            >
              <SimpleGrid columns={2} gap="2">
                <RadioCard.Item
                  value="present"
                  bg={
                    attendanceData[student.id]?.status === "present"
                      ? colorMode === "dark"
                        ? "green.900"
                        : "green.50"
                      : colorMode === "dark"
                      ? "gray.700"
                      : "white"
                  }
                  borderColor={
                    attendanceData[student.id]?.status === "present"
                      ? "green.500"
                      : colorMode === "dark"
                      ? "gray.600"
                      : "gray.200"
                  }
                  borderWidth="2px"
                  p="2"
                  minH="12"
                  _hover={{
                    borderColor: "green.400",
                    bg: colorMode === "dark" ? "green.800" : "green.25",
                  }}
                >
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h="full"
                  >
                    <RadioCard.ItemText
                      fontSize="sm"
                      fontWeight="bold"
                      color={
                        attendanceData[student.id]?.status === "present"
                          ? "green.500"
                          : colorMode === "dark"
                          ? "gray.200"
                          : "gray.700"
                      }
                    >
                      P
                    </RadioCard.ItemText>
                    <RadioCard.ItemIndicator />
                  </RadioCard.ItemControl>
                </RadioCard.Item>

                <RadioCard.Item
                  value="absent"
                  bg={
                    attendanceData[student.id]?.status === "absent"
                      ? colorMode === "dark"
                        ? "red.900"
                        : "red.50"
                      : colorMode === "dark"
                      ? "gray.700"
                      : "white"
                  }
                  borderColor={
                    attendanceData[student.id]?.status === "absent"
                      ? "red.500"
                      : colorMode === "dark"
                      ? "gray.600"
                      : "gray.200"
                  }
                  borderWidth="2px"
                  p="2"
                  minH="12"
                  _hover={{
                    borderColor: "red.400",
                    bg: colorMode === "dark" ? "red.800" : "red.25",
                  }}
                >
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h="full"
                  >
                    <RadioCard.ItemText
                      fontSize="sm"
                      fontWeight="bold"
                      color={
                        attendanceData[student.id]?.status === "absent"
                          ? "red.500"
                          : colorMode === "dark"
                          ? "gray.200"
                          : "gray.700"
                      }
                    >
                      A
                    </RadioCard.ItemText>
                    <RadioCard.ItemIndicator />
                  </RadioCard.ItemControl>
                </RadioCard.Item>

                <RadioCard.Item
                  value="late"
                  bg={
                    attendanceData[student.id]?.status === "late"
                      ? colorMode === "dark"
                        ? "orange.900"
                        : "orange.50"
                      : colorMode === "dark"
                      ? "gray.700"
                      : "white"
                  }
                  borderColor={
                    attendanceData[student.id]?.status === "late"
                      ? "orange.500"
                      : colorMode === "dark"
                      ? "gray.600"
                      : "gray.200"
                  }
                  borderWidth="2px"
                  p="2"
                  minH="12"
                  _hover={{
                    borderColor: "orange.400",
                    bg: colorMode === "dark" ? "orange.800" : "orange.25",
                  }}
                >
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h="full"
                  >
                    <RadioCard.ItemText
                      fontSize="sm"
                      fontWeight="bold"
                      color={
                        attendanceData[student.id]?.status === "late"
                          ? "orange.500"
                          : colorMode === "dark"
                          ? "gray.200"
                          : "gray.700"
                      }
                    >
                      L
                    </RadioCard.ItemText>
                    <RadioCard.ItemIndicator />
                  </RadioCard.ItemControl>
                </RadioCard.Item>

                <RadioCard.Item
                  value="excused"
                  bg={
                    attendanceData[student.id]?.status === "excused"
                      ? colorMode === "dark"
                        ? "blue.900"
                        : "blue.50"
                      : colorMode === "dark"
                      ? "gray.700"
                      : "white"
                  }
                  borderColor={
                    attendanceData[student.id]?.status === "excused"
                      ? "blue.500"
                      : colorMode === "dark"
                      ? "gray.600"
                      : "gray.200"
                  }
                  borderWidth="2px"
                  p="2"
                  minH="12"
                  _hover={{
                    borderColor: "blue.400",
                    bg: colorMode === "dark" ? "blue.800" : "blue.25",
                  }}
                >
                  <RadioCard.ItemHiddenInput />
                  <RadioCard.ItemControl
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h="full"
                  >
                    <RadioCard.ItemText
                      fontSize="sm"
                      fontWeight="bold"
                      color={
                        attendanceData[student.id]?.status === "excused"
                          ? "blue.500"
                          : colorMode === "dark"
                          ? "gray.200"
                          : "gray.700"
                      }
                    >
                      E
                    </RadioCard.ItemText>
                    <RadioCard.ItemIndicator />
                  </RadioCard.ItemControl>
                </RadioCard.Item>
              </SimpleGrid>
            </RadioCard.Root>
          </Box>

          {/* Status Badge */}
          {attendanceData[student.id]?.status && (
            <HStack>
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
            </HStack>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

export default StudentMobileCard;
