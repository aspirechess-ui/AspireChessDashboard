import { Box, Spinner, Text, VStack } from "@chakra-ui/react";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <Box
      minH="100vh"
      bg="black"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack gap={4}>
        <Spinner size="xl" color="#0d9488" thickness="4px" speed="0.65s" />
        <Text color="white" fontSize="lg" fontWeight="medium">
          {message}
        </Text>
      </VStack>
    </Box>
  );
};

export default LoadingSpinner;
