import React from "react";
import {
  Box,
  Card,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Select,
  createListCollection,
  SimpleGrid,
} from "@chakra-ui/react";
import { useColorMode } from "../../../../components/ui/color-mode";
import { Field } from "../../../../components/ui/field";
import { LuCalendar, LuClock } from "react-icons/lu";

const SessionDetailsForm = ({
  selectedDate,
  onDateChange,
  dateError,
  startHour,
  startMinute,
  startPeriod,
  endHour,
  endMinute,
  endPeriod,
  onStartHourChange,
  onStartMinuteChange,
  onStartPeriodChange,
  onEndHourChange,
  onEndMinuteChange,
  onEndPeriodChange,
  formatSessionTime,
  mode,
}) => {
  const { colorMode } = useColorMode();

  // Generate hour options (1-12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = String(i + 1).padStart(2, "0");
    return { value: hour, label: hour };
  });

  // Generate minute options (00, 15, 30, 45)
  const minuteOptions = [
    { value: "00", label: "00" },
    { value: "15", label: "15" },
    { value: "30", label: "30" },
    { value: "45", label: "45" },
  ];

  // Period options
  const periodOptions = [
    { value: "AM", label: "AM" },
    { value: "PM", label: "PM" },
  ];

  // Create collections for Select components
  const hourCollection = createListCollection({ items: hourOptions });
  const minuteCollection = createListCollection({ items: minuteOptions });
  const periodCollection = createListCollection({ items: periodOptions });

  return (
    <Card.Root
      p={{ base: 4, md: 6 }}
      bg={colorMode === "dark" ? "gray.700" : "gray.50"}
      borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
    >
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        <Heading size="md" color={colorMode === "dark" ? "white" : "gray.900"}>
          Session Details
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 4, md: 6 }}>
          {/* Date Selection */}
          <Field
            label={
              <HStack>
                <LuCalendar
                  color={colorMode === "dark" ? "white" : "gray.500"}
                />
                <Text color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                  Date
                </Text>
              </HStack>
            }
            invalid={!!dateError}
            errorText={dateError}
          >
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              bg={colorMode === "dark" ? "gray.600" : "white"}
              borderColor={
                dateError
                  ? "red.500"
                  : colorMode === "dark"
                  ? "gray.500"
                  : "gray.300"
              }
              color={colorMode === "dark" ? "white" : "gray.900"}
              _focus={{
                borderColor: dateError ? "red.500" : "teal.500",
                boxShadow: `0 0 0 1px ${dateError ? "red.500" : "teal.500"}`,
              }}
              disabled={mode === "view"}
            />
          </Field>

          {/* Session Time Display */}
          <Field
            label={
              <HStack>
                <LuClock color={colorMode === "dark" ? "white" : "gray.500"} />
                <Text color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                  Session Time
                </Text>
              </HStack>
            }
          >
            <Box
              p={3}
              bg={colorMode === "dark" ? "gray.600" : "white"}
              borderWidth="1px"
              borderColor={colorMode === "dark" ? "gray.500" : "gray.300"}
              borderRadius="md"
              color={colorMode === "dark" ? "teal.300" : "teal.600"}
              fontWeight="medium"
            >
              {formatSessionTime()}
            </Box>
          </Field>
        </SimpleGrid>

        {/* Time Selection Controls */}
        <Box>
          <Text
            mb={3}
            fontWeight="medium"
            color={colorMode === "dark" ? "gray.300" : "gray.700"}
          >
            Configure Session Time
          </Text>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 4, md: 6 }}>
            {/* Start Time */}
            <Box>
              <Text
                fontSize="sm"
                mb={2}
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                Start Time
              </Text>
              <HStack spacing={2}>
                <Select.Root
                  collection={hourCollection}
                  value={[startHour]}
                  onValueChange={(details) =>
                    onStartHourChange(details.value[0])
                  }
                  size="sm"
                  width="80px"
                  disabled={mode === "view"}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger
                      bg={colorMode === "dark" ? "gray.600" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.500" : "gray.300"
                      }
                      _focus={{ borderColor: "teal.500" }}
                    >
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator color="teal.500" />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                    >
                      {hourOptions.map((option) => (
                        <Select.Item key={option.value} item={option}>
                          <Select.ItemText
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            {option.label}
                          </Select.ItemText>
                          <Select.ItemIndicator color="teal.500" />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>

                <Text color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                  :
                </Text>

                <Select.Root
                  collection={minuteCollection}
                  value={[startMinute]}
                  onValueChange={(details) =>
                    onStartMinuteChange(details.value[0])
                  }
                  size="sm"
                  width="80px"
                  disabled={mode === "view"}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger
                      bg={colorMode === "dark" ? "gray.600" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.500" : "gray.300"
                      }
                      _focus={{ borderColor: "teal.500" }}
                    >
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator color="teal.500" />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                    >
                      {minuteOptions.map((option) => (
                        <Select.Item key={option.value} item={option}>
                          <Select.ItemText
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            {option.label}
                          </Select.ItemText>
                          <Select.ItemIndicator color="teal.500" />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>

                <Select.Root
                  collection={periodCollection}
                  value={[startPeriod]}
                  onValueChange={(details) =>
                    onStartPeriodChange(details.value[0])
                  }
                  size="sm"
                  width="80px"
                  disabled={mode === "view"}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger
                      bg={colorMode === "dark" ? "gray.600" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.500" : "gray.300"
                      }
                      _focus={{ borderColor: "teal.500" }}
                    >
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator color="teal.500" />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                    >
                      {periodOptions.map((option) => (
                        <Select.Item key={option.value} item={option}>
                          <Select.ItemText
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            {option.label}
                          </Select.ItemText>
                          <Select.ItemIndicator color="teal.500" />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </HStack>
            </Box>

            {/* End Time */}
            <Box>
              <Text
                fontSize="sm"
                mb={2}
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                End Time
              </Text>
              <HStack spacing={2}>
                <Select.Root
                  collection={hourCollection}
                  value={[endHour]}
                  onValueChange={(details) => onEndHourChange(details.value[0])}
                  size="sm"
                  width="80px"
                  disabled={mode === "view"}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger
                      bg={colorMode === "dark" ? "gray.600" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.500" : "gray.300"
                      }
                      _focus={{ borderColor: "teal.500" }}
                    >
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator color="teal.500" />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                    >
                      {hourOptions.map((option) => (
                        <Select.Item key={option.value} item={option}>
                          <Select.ItemText
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            {option.label}
                          </Select.ItemText>
                          <Select.ItemIndicator color="teal.500" />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>

                <Text color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                  :
                </Text>

                <Select.Root
                  collection={minuteCollection}
                  value={[endMinute]}
                  onValueChange={(details) =>
                    onEndMinuteChange(details.value[0])
                  }
                  size="sm"
                  width="80px"
                  disabled={mode === "view"}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger
                      bg={colorMode === "dark" ? "gray.600" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.500" : "gray.300"
                      }
                      _focus={{ borderColor: "teal.500" }}
                    >
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator color="teal.500" />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                    >
                      {minuteOptions.map((option) => (
                        <Select.Item key={option.value} item={option}>
                          <Select.ItemText
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            {option.label}
                          </Select.ItemText>
                          <Select.ItemIndicator color="teal.500" />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>

                <Select.Root
                  collection={periodCollection}
                  value={[endPeriod]}
                  onValueChange={(details) =>
                    onEndPeriodChange(details.value[0])
                  }
                  size="sm"
                  width="80px"
                  disabled={mode === "view"}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger
                      bg={colorMode === "dark" ? "gray.600" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.500" : "gray.300"
                      }
                      _focus={{ borderColor: "teal.500" }}
                    >
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator color="teal.500" />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                    >
                      {periodOptions.map((option) => (
                        <Select.Item key={option.value} item={option}>
                          <Select.ItemText
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            {option.label}
                          </Select.ItemText>
                          <Select.ItemIndicator color="teal.500" />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </HStack>
            </Box>
          </SimpleGrid>
        </Box>
      </VStack>
    </Card.Root>
  );
};

export default SessionDetailsForm;
