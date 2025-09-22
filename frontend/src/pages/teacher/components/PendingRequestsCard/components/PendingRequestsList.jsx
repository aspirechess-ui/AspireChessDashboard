import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Spinner,
  Center,
  Checkbox,
  IconButton,
  Icon,
  Card,
  Badge,
  Menu,
  InputGroup,
  Input,
} from "@chakra-ui/react";
import {
  LuUsers,
  LuMail,
  LuX,
  LuCheck,
  LuClock,
  LuEllipsisVertical,
  LuSearch,
  LuSquare,
} from "react-icons/lu";

const PendingRequestsList = ({
  colorMode,
  loading,
  pendingRequests,
  filteredRequests,
  multiSelectMode,
  selectedRequests,
  searchTerm,
  setSearchTerm,
  toggleMultiSelectMode,
  handleRequestToggle,
  handleSelectAll,
  handleViewRequest,
  handleApproveRequest,
  handleSingleReject,
  handleBulkApprove,
  handleBulkReject,
  processing,
}) => {
  // Group requests by student to show multiple request count
  const getStudentRequestCount = (studentId) => {
    return filteredRequests.filter((req) => req.studentId?._id === studentId)
      .length;
  };

  const handleRequestClick = (request) => {
    if (multiSelectMode) {
      handleRequestToggle(request._id);
    } else {
      // Always open view dialog regardless of message presence
      handleViewRequest(request);
    }
  };

  if (loading) {
    return (
      <Center p="8">
        <VStack spacing={4}>
          <Spinner size="lg" color="teal.500" />
          <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
            Loading pending requests...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <Box p="8" textAlign="center">
        <VStack spacing={4}>
          <Icon
            as={LuUsers}
            size="2xl"
            color={colorMode === "dark" ? "gray.500" : "gray.400"}
          />
          <VStack spacing={2}>
            <Text
              fontWeight="medium"
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
            >
              No Pending Requests
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.500"}
            >
              There are no pending join requests for this class at the moment.
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" h="full">
      {/* Sticky Search Bar and Controls */}
      <Box
        position="sticky"
        top="0"
        zIndex="10"
        p="4"
        borderBottomWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        flexShrink={0}
        bg={colorMode === "dark" ? "gray.800" : "white"}
      >
        <VStack spacing={3}>
          <InputGroup startElement={<LuSearch />}>
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              color={colorMode === "dark" ? "white" : "gray.900"}
              _placeholder={{
                color: colorMode === "dark" ? "gray.400" : "gray.500",
              }}
              size={{ base: "sm", md: "md" }}
            />
          </InputGroup>

          {filteredRequests.length > 0 && (
            <HStack justify="space-between" w="full">
              <Text
                fontSize={{ base: "xs", md: "sm" }}
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                {filteredRequests.length} request
                {filteredRequests.length !== 1 ? "s" : ""} available
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

      {/* Scrollable Content Area */}
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
        {filteredRequests.length > 0 ? (
          <>
            {/* Select All - Only show in multi-select mode */}
            {multiSelectMode && (
              <Box
                p="4"
                borderBottomWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              >
                <VStack spacing={3}>
                  <HStack w="full">
                    <Checkbox.Root
                      checked={
                        selectedRequests.length === filteredRequests.length &&
                        filteredRequests.length > 0
                          ? true
                          : selectedRequests.length > 0 &&
                            selectedRequests.length < filteredRequests.length
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
                      Select All ({filteredRequests.length} requests)
                    </Text>
                  </HStack>

                  {/* Bulk Actions */}
                  {selectedRequests.length > 0 && (
                    <HStack
                      w="full"
                      justify="space-between"
                      wrap="wrap"
                      gap={2}
                    >
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        flex="1"
                        minW="0"
                      >
                        {selectedRequests.length} request
                        {selectedRequests.length !== 1 ? "s" : ""} selected
                      </Text>
                      <HStack spacing={2}>
                        <Button
                          size={{ base: "sm", md: "md" }}
                          colorPalette="green"
                          onClick={handleBulkApprove}
                          disabled={selectedRequests.some(
                            (id) => processing[id]
                          )}
                          loading={selectedRequests.some(
                            (id) => processing[id] === "approving"
                          )}
                          loadingText="Approving..."
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          <LuCheck />
                          Approve All
                        </Button>
                        <Button
                          size={{ base: "sm", md: "md" }}
                          colorPalette="red"
                          variant="outline"
                          onClick={handleBulkReject}
                          disabled={selectedRequests.some(
                            (id) => processing[id]
                          )}
                          loading={selectedRequests.some(
                            (id) => processing[id] === "rejecting"
                          )}
                          loadingText="Rejecting..."
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          <LuX />
                          Reject All
                        </Button>
                      </HStack>
                    </HStack>
                  )}
                </VStack>
              </Box>
            )}

            {/* Request Cards */}
            <VStack spacing={2} p="4" align="stretch">
              {filteredRequests.map((request) => (
                <Card.Root
                  key={request._id}
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  borderWidth="1px"
                  borderColor={
                    multiSelectMode && selectedRequests.includes(request._id)
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
                  onClick={() => handleRequestClick(request)}
                  size={{ base: "sm", md: "md" }}
                >
                  <Card.Body p={{ base: "3", md: "4" }}>
                    <HStack
                      justify="space-between"
                      align="start"
                      spacing={{ base: 2, md: 3 }}
                    >
                      <HStack
                        spacing={{ base: 2, md: 3 }}
                        flex="1"
                        minW="0"
                        align="start"
                      >
                        {/* Checkbox - Only show in multi-select mode */}
                        {multiSelectMode && (
                          <Box mt="1">
                            <Checkbox.Root
                              checked={selectedRequests.includes(request._id)}
                              onCheckedChange={(e) => {
                                e.stopPropagation();
                                handleRequestToggle(request._id);
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
                          </Box>
                        )}

                        <Avatar.Root
                          size={{ base: "sm", md: "md" }}
                          flexShrink={0}
                        >
                          <Avatar.Fallback
                            name={
                              request.studentId?.userDetails?.firstName &&
                              request.studentId?.userDetails?.lastName
                                ? `${request.studentId.userDetails.firstName} ${request.studentId.userDetails.lastName}`
                                : request.studentId?.email || "Student"
                            }
                          />
                          <Avatar.Image
                            src={
                              request.studentId?.userDetails?.profileImageUrl
                            }
                          />
                        </Avatar.Root>

                        <VStack
                          align="start"
                          spacing={{ base: 0.5, md: 1 }}
                          flex="1"
                          minW="0"
                        >
                          <Text
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            isTruncated
                            fontSize={{ base: "sm", md: "md" }}
                            lineHeight="shorter"
                          >
                            {request.studentId?.userDetails?.firstName &&
                            request.studentId?.userDetails?.lastName
                              ? `${request.studentId.userDetails.firstName} ${request.studentId.userDetails.lastName}`
                              : request.studentId?.email || "Unknown Student"}
                          </Text>

                          <HStack
                            spacing={{ base: 2, md: 4 }}
                            fontSize={{ base: "xs", md: "sm" }}
                            wrap="wrap"
                          >
                            <HStack spacing={1} minW="0">
                              <Icon as={LuMail} size="xs" flexShrink={0} />
                              <Text
                                color={
                                  colorMode === "dark" ? "gray.300" : "gray.600"
                                }
                                isTruncated
                                maxW={{ base: "120px", md: "200px" }}
                              >
                                {request.studentId?.email}
                              </Text>
                            </HStack>

                            <HStack
                              spacing={1}
                              display={{ base: "none", md: "flex" }}
                              flexShrink={0}
                            >
                              <Icon as={LuClock} size="xs" />
                              <Text
                                color={
                                  colorMode === "dark" ? "gray.300" : "gray.600"
                                }
                              >
                                {new Date(
                                  request.createdAt
                                ).toLocaleDateString()}
                              </Text>
                            </HStack>
                          </HStack>

                          <HStack spacing={1} wrap="wrap">
                            <Badge
                              colorPalette="orange"
                              variant="subtle"
                              size={{ base: "xs", md: "sm" }}
                            >
                              Pending
                            </Badge>
                            {request.requestMessage && (
                              <Badge
                                colorPalette="blue"
                                variant="subtle"
                                size={{ base: "xs", md: "sm" }}
                              >
                                Has Message
                              </Badge>
                            )}
                            {getStudentRequestCount(request.studentId?._id) >
                              1 && (
                              <Badge
                                colorPalette="purple"
                                variant="subtle"
                                size={{ base: "xs", md: "sm" }}
                              >
                                {getStudentRequestCount(request.studentId?._id)}{" "}
                                Requests
                              </Badge>
                            )}
                          </HStack>
                        </VStack>
                      </HStack>

                      {/* Action Buttons */}
                      <Box flexShrink={0}>
                        {!multiSelectMode && (
                          <>
                            {/* Desktop Actions */}
                            <HStack
                              spacing={2}
                              display={{ base: "none", md: "flex" }}
                            >
                              <Button
                                size="sm"
                                colorPalette="green"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveRequest(request._id);
                                }}
                                loading={
                                  processing[request._id] === "approving"
                                }
                                loadingText="Approving..."
                                disabled={processing[request._id]}
                              >
                                <LuCheck />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                colorPalette="red"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSingleReject(request._id);
                                }}
                                loading={
                                  processing[request._id] === "rejecting"
                                }
                                loadingText="Rejecting..."
                                disabled={processing[request._id]}
                              >
                                <LuX />
                                Reject
                              </Button>
                            </HStack>

                            {/* Mobile Three-Dot Menu */}
                            <Menu.Root
                              positioning={{
                                placement: "bottom-end",
                                offset: { mainAxis: 4, crossAxis: 0 },
                              }}
                            >
                              <Menu.Trigger asChild>
                                <IconButton
                                  size="sm"
                                  variant="ghost"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.300"
                                      : "gray.700"
                                  }
                                  display={{ base: "flex", md: "none" }}
                                  onClick={(e) => e.stopPropagation()}
                                  borderRadius="md"
                                  _hover={{
                                    bg:
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.100",
                                  }}
                                  h="8"
                                  w="8"
                                  minW="8"
                                >
                                  <LuEllipsisVertical />
                                </IconButton>
                              </Menu.Trigger>
                              <Menu.Positioner>
                                <Menu.Content
                                  bg={
                                    colorMode === "dark" ? "gray.700" : "white"
                                  }
                                  borderColor={
                                    colorMode === "dark"
                                      ? "gray.600"
                                      : "gray.200"
                                  }
                                  shadow="lg"
                                  minW="140px"
                                  maxH="auto"
                                  overflow="visible"
                                  borderRadius="md"
                                  py="1"
                                >
                                  {request.requestMessage && (
                                    <Menu.Item
                                      value="view"
                                      onClick={() => handleViewRequest(request)}
                                      fontSize="sm"
                                      color={
                                        colorMode === "dark"
                                          ? "gray.200"
                                          : "gray.700"
                                      }
                                      _hover={{
                                        bg:
                                          colorMode === "dark"
                                            ? "gray.600"
                                            : "gray.50",
                                      }}
                                      py="2"
                                      px="3"
                                      h="auto"
                                      minH="8"
                                      display="flex"
                                      alignItems="center"
                                      gap="2"
                                    >
                                      <Icon as={LuUsers} />
                                      View Message
                                    </Menu.Item>
                                  )}
                                  <Menu.Item
                                    value="approve"
                                    onClick={() =>
                                      handleApproveRequest(request._id)
                                    }
                                    disabled={processing[request._id]}
                                    fontSize="sm"
                                    color={
                                      colorMode === "dark"
                                        ? "gray.200"
                                        : "gray.700"
                                    }
                                    _hover={{
                                      bg:
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.50",
                                    }}
                                    py="2"
                                    px="3"
                                    h="auto"
                                    minH="8"
                                    display="flex"
                                    alignItems="center"
                                    gap="2"
                                  >
                                    <Icon as={LuCheck} />
                                    Approve
                                  </Menu.Item>
                                  <Menu.Item
                                    value="reject"
                                    onClick={() =>
                                      handleSingleReject(request._id)
                                    }
                                    disabled={processing[request._id]}
                                    fontSize="sm"
                                    color={
                                      colorMode === "dark"
                                        ? "gray.200"
                                        : "gray.700"
                                    }
                                    _hover={{
                                      bg:
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.50",
                                    }}
                                    py="2"
                                    px="3"
                                    h="auto"
                                    minH="8"
                                    display="flex"
                                    alignItems="center"
                                    gap="2"
                                  >
                                    <Icon as={LuX} />
                                    Reject
                                  </Menu.Item>
                                </Menu.Content>
                              </Menu.Positioner>
                            </Menu.Root>
                          </>
                        )}
                      </Box>
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
                  {searchTerm ? "No requests found" : "No Pending Requests"}
                </Text>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                >
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "There are no pending join requests for this class at the moment."}
                </Text>
              </VStack>
            </VStack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PendingRequestsList;
