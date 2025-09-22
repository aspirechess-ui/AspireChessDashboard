import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Badge,
  useBreakpointValue,
  Flex,
  NativeSelect,
} from "@chakra-ui/react";
import { LuCalendar, LuFilter, LuClock, LuChevronDown } from "react-icons/lu";
import { useColorMode } from "../../../../../../components/ui/color-mode";

const DateRangeFilter = ({ currentFilter, onFilterChange }) => {
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Handle preset change
  const handlePresetChange = (preset) => {
    if (preset === "custom") {
      onFilterChange({
        ...currentFilter,
        preset: "custom",
      });
    } else {
      onFilterChange({
        preset,
        startDate: null,
        endDate: null,
      });
    }
  };

  // Handle custom date change
  const handleDateChange = (field, value) => {
    onFilterChange({
      ...currentFilter,
      preset: "custom",
      [field]: value,
    });
  };

  // Get preset options
  const presetOptions = [
    { value: "all", label: "All Time", icon: LuClock },
    { value: "week", label: "Last 7 Days", icon: LuCalendar },
    { value: "month", label: "Last 30 Days", icon: LuCalendar },
    { value: "custom", label: "Custom Range", icon: LuFilter },
  ];

  // Get active filter display
  const getActiveFilterDisplay = () => {
    if (currentFilter.preset === "all") return "All Time";
    if (currentFilter.preset === "week") return "Last 7 Days";
    if (currentFilter.preset === "month") return "Last 30 Days";
    if (currentFilter.preset === "custom") {
      if (currentFilter.startDate && currentFilter.endDate) {
        const start = new Date(currentFilter.startDate).toLocaleDateString();
        const end = new Date(currentFilter.endDate).toLocaleDateString();
        return `${start} - ${end}`;
      }
      return "Custom Range";
    }
    return "All Time";
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Filter Header */}
        <HStack spacing={2} align="center">
          <LuFilter
            size={16}
            color={colorMode === "dark" ? "#9CA3AF" : "#6B7280"}
          />
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={colorMode === "dark" ? "gray.300" : "gray.700"}
          >
            Filter by Date Range
          </Text>
          <Badge colorPalette="teal" variant="subtle" fontSize="xs">
            {getActiveFilterDisplay()}
          </Badge>
        </HStack>

        {isMobile ? (
          // Mobile: Vertical layout with native select
          <VStack spacing={3} align="stretch">
            {/* Preset Selection */}
            <Box>
              <Text
                fontSize="xs"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                mb={1}
              >
                Time Range
              </Text>
              <NativeSelect.Root
                size="sm"
                value={currentFilter.preset}
                colorPalette="teal"
                variant="outline"
              >
                <NativeSelect.Field
                  onChange={(e) => handlePresetChange(e.target.value)}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  _focus={{
                    borderColor: "#0d9488",
                    boxShadow: "0 0 0 1px #0d9488",
                  }}
                  _hover={{
                    borderColor: colorMode === "dark" ? "gray.500" : "gray.400",
                  }}
                >
                  <option value="all">All Time</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="custom">Custom Range</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator>
                  <LuChevronDown />
                </NativeSelect.Indicator>
              </NativeSelect.Root>
            </Box>

            {/* Custom Date Inputs */}
            {currentFilter.preset === "custom" && (
              <VStack spacing={3} align="stretch">
                <Box>
                  <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    mb={1}
                  >
                    Start Date
                  </Text>
                  <Input
                    type="date"
                    value={currentFilter.startDate || ""}
                    onChange={(e) =>
                      handleDateChange("startDate", e.target.value)
                    }
                    size="sm"
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _focus={{
                      borderColor: "#0d9488",
                      boxShadow: "0 0 0 1px #0d9488",
                    }}
                    _hover={{
                      borderColor:
                        colorMode === "dark" ? "gray.500" : "gray.400",
                    }}
                  />
                </Box>
                <Box>
                  <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    mb={1}
                  >
                    End Date
                  </Text>
                  <Input
                    type="date"
                    value={currentFilter.endDate || ""}
                    onChange={(e) =>
                      handleDateChange("endDate", e.target.value)
                    }
                    size="sm"
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _focus={{
                      borderColor: "#0d9488",
                      boxShadow: "0 0 0 1px #0d9488",
                    }}
                    _hover={{
                      borderColor:
                        colorMode === "dark" ? "gray.500" : "gray.400",
                    }}
                  />
                </Box>
              </VStack>
            )}
          </VStack>
        ) : (
          // Desktop: Horizontal layout
          <Flex direction="row" gap={4} align="end" wrap="wrap">
            {/* Preset Buttons */}
            <HStack spacing={2} flex={1} minW="250px" wrap="wrap">
              {presetOptions.map((option) => {
                const Icon = option.icon;
                const isActive = currentFilter.preset === option.value;
                return (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={isActive ? "solid" : "outline"}
                    colorPalette={isActive ? "teal" : "gray"}
                    leftIcon={<Icon size={14} />}
                    onClick={() => handlePresetChange(option.value)}
                    fontSize="xs"
                    px={3}
                    h={8}
                    bg={isActive ? "#0d9488" : "transparent"}
                    color={
                      isActive
                        ? "white"
                        : colorMode === "dark"
                        ? "gray.300"
                        : "gray.700"
                    }
                    borderColor={
                      isActive
                        ? "#0d9488"
                        : colorMode === "dark"
                        ? "gray.600"
                        : "gray.300"
                    }
                    _hover={{
                      bg: isActive
                        ? "#0b7c6f"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "gray.100",
                      borderColor: isActive ? "#0b7c6f" : "#0d9488",
                      color: isActive
                        ? "white"
                        : colorMode === "dark"
                        ? "white"
                        : "gray.900",
                    }}
                    _active={{
                      bg: isActive
                        ? "#0a6b5d"
                        : colorMode === "dark"
                        ? "gray.600"
                        : "gray.200",
                    }}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </HStack>

            {/* Custom Date Inputs */}
            {currentFilter.preset === "custom" && (
              <HStack spacing={3} align="end">
                <Box>
                  <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    mb={1}
                  >
                    Start Date
                  </Text>
                  <Input
                    type="date"
                    value={currentFilter.startDate || ""}
                    onChange={(e) =>
                      handleDateChange("startDate", e.target.value)
                    }
                    size="sm"
                    width="140px"
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _focus={{
                      borderColor: "#0d9488",
                      boxShadow: "0 0 0 1px #0d9488",
                    }}
                    _hover={{
                      borderColor:
                        colorMode === "dark" ? "gray.500" : "gray.400",
                    }}
                  />
                </Box>
                <Box>
                  <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    mb={1}
                  >
                    End Date
                  </Text>
                  <Input
                    type="date"
                    value={currentFilter.endDate || ""}
                    onChange={(e) =>
                      handleDateChange("endDate", e.target.value)
                    }
                    size="sm"
                    width="140px"
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _focus={{
                      borderColor: "#0d9488",
                      boxShadow: "0 0 0 1px #0d9488",
                    }}
                    _hover={{
                      borderColor:
                        colorMode === "dark" ? "gray.500" : "gray.400",
                    }}
                  />
                </Box>
              </HStack>
            )}
          </Flex>
        )}

        {/* Validation message for custom dates */}
        {currentFilter.preset === "custom" &&
          currentFilter.startDate &&
          currentFilter.endDate &&
          new Date(currentFilter.startDate) >
            new Date(currentFilter.endDate) && (
            <Text fontSize="xs" color="red.500" mt={1}>
              Start date must be before end date
            </Text>
          )}
      </VStack>
    </Box>
  );
};

export default DateRangeFilter;
