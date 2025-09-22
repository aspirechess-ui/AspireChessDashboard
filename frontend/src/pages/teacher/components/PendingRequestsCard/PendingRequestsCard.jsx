import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Alert,
} from "@chakra-ui/react";
import { useColorMode } from "../../../../components/ui/color-mode";
import classJoinRequestService from "../../../../services/classJoinRequests.js";

// Import refactored components
import PendingRequestsHeader from "./components/PendingRequestsHeader";
import PendingRequestsList from "./components/PendingRequestsList";
import RejectDialog from "./components/RejectDialog";
import ViewRequestDialog from "./components/ViewRequestDialog";
import PendingHistory from "./components/PendingHistory";
import BulkOperationResult from "./components/BulkOperationResult";

const PendingRequestsCard = ({ classData, onClose, onRequestProcessed }) => {
  const { colorMode } = useColorMode();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState(null);
  const [bulkOperationResult, setBulkOperationResult] = useState(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [requestToReject, setRequestToReject] = useState(null);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("pending"); // "pending" or "history"
  const [historyKey, setHistoryKey] = useState(0); // Key to force refresh history component

  // Fetch pending requests
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await classJoinRequestService.getPendingRequests(
          classData._id
        );
        setPendingRequests(response || []);
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        setError("Failed to fetch pending requests");
      } finally {
        setLoading(false);
      }
    };

    if (classData?._id) {
      fetchPendingRequests();
    }
  }, [classData._id]);

  // Filter requests based on search term
  const filteredRequests = pendingRequests.filter(
    (request) =>
      request.studentId?.email
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (request.studentId?.userDetails?.firstName &&
        `${request.studentId.userDetails.firstName} ${request.studentId.userDetails.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const handleRequestToggle = (requestId) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map((req) => req._id));
    }
  };

  const toggleMultiSelectMode = () => {
    setMultiSelectMode(!multiSelectMode);
    setSelectedRequests([]);
    setBulkOperationResult(null); // Clear previous results
    if (!multiSelectMode) {
      setSearchTerm("");
    }
  };

  const handleViewRequest = (request) => {
    setViewingRequest(request);
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setProcessing((prev) => ({ ...prev, [requestId]: "approving" }));
      await classJoinRequestService.approveRequest(requestId);

      // Remove the request from the list
      setPendingRequests((prev) => prev.filter((req) => req._id !== requestId));

      // Refresh history component
      setHistoryKey((prev) => prev + 1);

      if (onRequestProcessed) {
        onRequestProcessed();
      }
    } catch (error) {
      console.error("Error approving request:", error);
      setError("Failed to approve request");
    } finally {
      setProcessing((prev) => {
        const newProcessing = { ...prev };
        delete newProcessing[requestId];
        return newProcessing;
      });
    }
  };

  const handleSingleReject = (requestId) => {
    setRequestToReject(requestId);
    setShowRejectDialog(true);
  };

  const handleBulkApprove = async () => {
    try {
      // Set processing state for all selected requests
      const processingState = {};
      selectedRequests.forEach((requestId) => {
        processingState[requestId] = "approving";
      });
      setProcessing((prev) => ({ ...prev, ...processingState }));

      // Use the new bulk approve API
      const response = await classJoinRequestService.bulkApproveRequests(
        selectedRequests,
        ""
      );

      // Handle the response
      if (response.success) {
        // Show detailed success/warning information
        setBulkOperationResult(response);
        setError(null);

        // Show detailed information in console for debugging
        console.log("Bulk approve details:", response.data?.details);
      }

      // Remove all processed requests from the list (both approved and rejected)
      setPendingRequests((prev) =>
        prev.filter((req) => !selectedRequests.includes(req._id))
      );

      // Clear selection and exit multi-select mode
      setSelectedRequests([]);
      setMultiSelectMode(false);

      // Refresh history component
      setHistoryKey((prev) => prev + 1);

      if (onRequestProcessed) {
        onRequestProcessed();
      }
    } catch (error) {
      console.error("Error bulk approving requests:", error);
      setError(error.message || "Failed to approve requests");
    } finally {
      // Clear processing state for all selected requests
      setProcessing((prev) => {
        const newProcessing = { ...prev };
        selectedRequests.forEach((requestId) => {
          delete newProcessing[requestId];
        });
        return newProcessing;
      });
    }
  };

  const handleBulkReject = () => {
    setRequestToReject(null); // null indicates bulk operation
    setShowRejectDialog(true);
  };

  const confirmReject = async () => {
    try {
      if (requestToReject) {
        // Single request rejection
        setProcessing((prev) => ({ ...prev, [requestToReject]: "rejecting" }));

        await classJoinRequestService.rejectRequest(
          requestToReject,
          rejectReason
        );

        // Remove the request from the list
        setPendingRequests((prev) =>
          prev.filter((req) => req._id !== requestToReject)
        );
      } else {
        // Bulk request rejection
        const processingState = {};
        selectedRequests.forEach((requestId) => {
          processingState[requestId] = "rejecting";
        });
        setProcessing((prev) => ({ ...prev, ...processingState }));

        // Use the new bulk reject API
        const response = await classJoinRequestService.bulkRejectRequests(
          selectedRequests,
          rejectReason
        );

        // Handle the response
        if (response.success) {
          setBulkOperationResult(response);
          setError(null);
        }

        // Remove the requests from the list
        setPendingRequests((prev) =>
          prev.filter((req) => !selectedRequests.includes(req._id))
        );

        // Clear selection and exit multi-select mode
        setSelectedRequests([]);
        setMultiSelectMode(false);
      }

      // Refresh history component
      setHistoryKey((prev) => prev + 1);

      if (onRequestProcessed) {
        onRequestProcessed();
      }

      // Close dialog and reset state
      setShowRejectDialog(false);
      setRejectReason("");
      setRequestToReject(null);
    } catch (error) {
      console.error("Error rejecting request(s):", error);
      setError("Failed to reject request(s)");
    } finally {
      if (requestToReject) {
        // Clear single request processing state
        setProcessing((prev) => {
          const newProcessing = { ...prev };
          delete newProcessing[requestToReject];
          return newProcessing;
        });
      } else {
        // Clear bulk processing state
        setProcessing((prev) => {
          const newProcessing = { ...prev };
          selectedRequests.forEach((requestId) => {
            delete newProcessing[requestId];
          });
          return newProcessing;
        });
      }
    }
  };

  const cancelReject = () => {
    setShowRejectDialog(false);
    setRejectReason("");
    setRequestToReject(null);
    setBulkOperationResult(null); // Clear previous results
  };

  return (
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
        p="4"
        borderBottomWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      >
        <PendingRequestsHeader
          colorMode={colorMode}
          pendingRequests={pendingRequests}
          onClose={onClose}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      </Card.Header>

      <Card.Body p="0" overflow="hidden" display="flex" flexDirection="column">
        {/* Error Alert */}
        {error && (
          <Box p="4" flexShrink={0}>
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          </Box>
        )}

        {/* Bulk Operation Result */}
        {bulkOperationResult && (
          <BulkOperationResult
            result={bulkOperationResult}
            colorMode={colorMode}
          />
        )}

        {/* Conditional Content Based on Current View */}
        {currentView === "pending" ? (
          <>
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
              <PendingRequestsList
                colorMode={colorMode}
                loading={loading}
                pendingRequests={pendingRequests}
                filteredRequests={filteredRequests}
                multiSelectMode={multiSelectMode}
                selectedRequests={selectedRequests}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                toggleMultiSelectMode={toggleMultiSelectMode}
                handleRequestToggle={handleRequestToggle}
                handleSelectAll={handleSelectAll}
                handleViewRequest={handleViewRequest}
                handleApproveRequest={handleApproveRequest}
                handleSingleReject={handleSingleReject}
                handleBulkApprove={handleBulkApprove}
                handleBulkReject={handleBulkReject}
                processing={processing}
              />
            </Box>

            {/* Sticky Footer for Pending */}
            <Box
              p={{ base: "3", md: "4" }}
              borderTopWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              flexShrink={0}
              bg={colorMode === "dark" ? "gray.800" : "white"}
            >
              <HStack justify="space-between" wrap="wrap" gap={2}>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  flex="1"
                  minW="0"
                >
                  {filteredRequests.length > 0
                    ? `${filteredRequests.length} pending request${
                        filteredRequests.length !== 1 ? "s" : ""
                      }${
                        searchTerm
                          ? ` (filtered from ${pendingRequests.length})`
                          : ""
                      }`
                    : searchTerm
                    ? "No requests found"
                    : "No pending requests"}
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
          </>
        ) : (
          <>
            {/* Scrollable History Content */}
            <Box flex="1" overflow="hidden">
              <PendingHistory
                key={historyKey}
                colorMode={colorMode}
                classData={classData}
              />
            </Box>

            {/* Sticky Footer for History */}
            <Box
              p={{ base: "3", md: "4" }}
              borderTopWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              flexShrink={0}
              bg={colorMode === "dark" ? "gray.800" : "white"}
            >
              <HStack justify="space-between" wrap="wrap" gap={2}>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  flex="1"
                  minW="0"
                >
                  Request history for this class
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
          </>
        )}
      </Card.Body>

      {/* Reject Dialog */}
      <RejectDialog
        colorMode={colorMode}
        showRejectDialog={showRejectDialog}
        cancelReject={cancelReject}
        requestToReject={requestToReject}
        selectedRequests={selectedRequests}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        confirmReject={confirmReject}
        processing={processing}
      />

      {/* View Request Dialog */}
      <ViewRequestDialog
        colorMode={colorMode}
        viewingRequest={viewingRequest}
        setViewingRequest={setViewingRequest}
        handleApproveRequest={handleApproveRequest}
        handleSingleReject={handleSingleReject}
        processing={processing}
        filteredRequests={filteredRequests}
      />
    </Card.Root>
  );
};

export default PendingRequestsCard;
