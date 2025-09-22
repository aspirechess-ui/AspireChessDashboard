import React from "react";
import {
  Card,
  Table,
  Badge,
  Avatar,
  Text,
  HStack,
  VStack,
  IconButton,
  Menu,
  Portal,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaUserCheck,
  FaUsers,
  FaGraduationCap,
  FaEllipsisV,
  FaEye,
  FaTrash,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { useColorMode } from "../../../components/ui/color-mode";

const ManageUsersTable = ({
  users,
  viewMode,
  activeTab,
  onViewUser,
  onDeleteUser,
}) => {
  const { colorMode } = useColorMode();

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "red";
      case "teacher":
        return "blue";
      case "student":
        return "green";
      default:
        return "gray";
    }
  };

  const UserCard = ({ user }) => {
    return (
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
        _hover={{
          shadow: colorMode === "dark" ? "xl" : "md",
          borderColor: colorMode === "dark" ? "gray.600" : "gray.300",
          cursor: "pointer",
        }}
        onClick={() => onViewUser(user)}
      >
        <Card.Body p="3">
          <HStack spacing="3" align="start">
            <Avatar.Root size="sm">
              {user.userDetails?.profileImageUrl ? (
                <Avatar.Image
                  src={user.userDetails.profileImageUrl}
                  alt={`${user.userDetails?.firstName} ${user.userDetails?.lastName}`}
                />
              ) : null}
              <Avatar.Fallback
                name={`${user.userDetails?.firstName} ${user.userDetails?.lastName}`}
              >
                {`${user.userDetails?.firstName?.charAt(0) || ""}${
                  user.userDetails?.lastName?.charAt(0) || ""
                }`.toUpperCase() ||
                  user.email?.charAt(0).toUpperCase() ||
                  "U"}
              </Avatar.Fallback>
            </Avatar.Root>
            <VStack align="start" spacing="1" flex="1" minW="0">
              <HStack spacing="2" w="full">
                <Text
                  fontWeight="semibold"
                  fontSize="sm"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  isTruncated
                  flex="1"
                >
                  {user.userDetails?.firstName} {user.userDetails?.lastName}
                </Text>
                <Badge
                  colorPalette={getRoleColor(user.role)}
                  variant="subtle"
                  size="xs"
                >
                  <HStack spacing="1">
                    {user.role === "admin" && <FaUserCheck size={10} />}
                    {user.role === "teacher" && <FaUsers size={10} />}
                    {user.role === "student" && <FaGraduationCap size={10} />}
                    <Text fontSize="xs">{user.role}</Text>
                  </HStack>
                </Badge>
              </HStack>
              <VStack align="start" spacing="0" w="full">
                <HStack
                  fontSize="xs"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  w="full"
                >
                  <FaEnvelope size="12" />
                  <Text isTruncated flex="1">
                    {user.email}
                  </Text>
                </HStack>
                {user.userDetails?.phoneNumber && (
                  <HStack
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  >
                    <FaPhone size="12" />
                    <Text>{user.userDetails.phoneNumber}</Text>
                  </HStack>
                )}
                {user.assignedBatch && (
                  <HStack
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  >
                    <FaGraduationCap size="12" />
                    <Text>Batch: {user.assignedBatch}</Text>
                  </HStack>
                )}
              </VStack>
              <Text
                fontSize="xs"
                color={colorMode === "dark" ? "gray.400" : "gray.500"}
              >
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </VStack>
            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton
                  size="xs"
                  variant="ghost"
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                  _hover={{
                    bg: colorMode === "dark" ? "gray.700" : "gray.100",
                    color: colorMode === "dark" ? "gray.200" : "gray.700",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <FaEllipsisV />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                    shadow="lg"
                  >
                    <Menu.Item
                      value="view"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      _hover={{
                        bg: colorMode === "dark" ? "gray.700" : "gray.50",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewUser(user);
                      }}
                    >
                      <FaEye />
                      View
                    </Menu.Item>
                    <Menu.Item
                      value="delete"
                      color="red.500"
                      _hover={{
                        bg: colorMode === "dark" ? "red.900" : "red.50",
                        color: "red.600",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteUser(user);
                      }}
                    >
                      <FaTrash />
                      Delete
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </HStack>
        </Card.Body>
      </Card.Root>
    );
  };

  const UserTable = ({ users }) => {
    return (
      <Table.Root
        variant="simple"
        size="sm"
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        borderRadius="lg"
        overflow="hidden"
      >
        <Table.Header bg={colorMode === "dark" ? "gray.750" : "gray.50"}>
          <Table.Row>
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.200" : "gray.700"}
            >
              User
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.200" : "gray.700"}
              display={{ base: "none", sm: "table-cell" }}
            >
              Role
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.200" : "gray.700"}
              display={{ base: "none", md: "table-cell" }}
            >
              Phone
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.200" : "gray.700"}
              display={{ base: "none", lg: "table-cell" }}
            >
              Joined
            </Table.ColumnHeader>
            {activeTab === "student" && (
              <Table.ColumnHeader
                color={colorMode === "dark" ? "gray.200" : "gray.700"}
                display={{ base: "none", lg: "table-cell" }}
              >
                Batch
              </Table.ColumnHeader>
            )}
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.200" : "gray.700"}
              w="40px"
            >
              Actions
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map((user) => (
            <Table.Row
              key={user._id}
              _hover={{
                bg: colorMode === "dark" ? "gray.700" : "gray.50",
                cursor: "pointer",
              }}
              onClick={() => onViewUser(user)}
            >
              <Table.Cell>
                <HStack spacing="3">
                  <Avatar.Root size="sm">
                    {user.userDetails?.profileImageUrl ? (
                      <Avatar.Image
                        src={user.userDetails.profileImageUrl}
                        alt={`${user.userDetails?.firstName} ${user.userDetails?.lastName}`}
                      />
                    ) : null}
                    <Avatar.Fallback
                      name={`${user.userDetails?.firstName} ${user.userDetails?.lastName}`}
                    >
                      {`${user.userDetails?.firstName?.charAt(0) || ""}${
                        user.userDetails?.lastName?.charAt(0) || ""
                      }`.toUpperCase() ||
                        user.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </Avatar.Fallback>
                  </Avatar.Root>
                  <VStack align="start" spacing="0" minW="0" flex="1">
                    <Text
                      fontWeight="semibold"
                      fontSize="sm"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      isTruncated
                    >
                      {user.userDetails?.firstName} {user.userDetails?.lastName}
                    </Text>
                    <Text
                      fontSize="xs"
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      isTruncated
                    >
                      {user.email}
                    </Text>
                    {/* Mobile-only role and batch info */}
                    <HStack spacing="2" display={{ base: "flex", sm: "none" }}>
                      <Badge
                        colorPalette={getRoleColor(user.role)}
                        variant="subtle"
                        size="xs"
                      >
                        <HStack spacing="1">
                          {user.role === "admin" && <FaUserCheck size={8} />}
                          {user.role === "teacher" && <FaUsers size={8} />}
                          {user.role === "student" && (
                            <FaGraduationCap size={8} />
                          )}
                          <Text fontSize="xs">{user.role}</Text>
                        </HStack>
                      </Badge>
                      {user.assignedBatch && (
                        <Text
                          fontSize="xs"
                          color={colorMode === "dark" ? "gray.400" : "gray.500"}
                        >
                          {user.assignedBatch}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                </HStack>
              </Table.Cell>
              <Table.Cell display={{ base: "none", sm: "table-cell" }}>
                <Badge
                  colorPalette={getRoleColor(user.role)}
                  variant="subtle"
                  size="xs"
                >
                  <HStack spacing="1">
                    {user.role === "admin" && <FaUserCheck size={10} />}
                    {user.role === "teacher" && <FaUsers size={10} />}
                    {user.role === "student" && <FaGraduationCap size={10} />}
                    <Text fontSize="xs">{user.role}</Text>
                  </HStack>
                </Badge>
              </Table.Cell>
              <Table.Cell display={{ base: "none", md: "table-cell" }}>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                >
                  {user.userDetails?.phoneNumber || "-"}
                </Text>
              </Table.Cell>
              <Table.Cell display={{ base: "none", lg: "table-cell" }}>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                >
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </Table.Cell>
              {activeTab === "student" && (
                <Table.Cell display={{ base: "none", lg: "table-cell" }}>
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  >
                    {user.assignedBatch || "-"}
                  </Text>
                </Table.Cell>
              )}
              <Table.Cell>
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <IconButton
                      size="xs"
                      variant="ghost"
                      color={colorMode === "dark" ? "gray.400" : "gray.500"}
                      _hover={{
                        bg: colorMode === "dark" ? "gray.700" : "gray.100",
                        color: colorMode === "dark" ? "gray.200" : "gray.700",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FaEllipsisV />
                    </IconButton>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content
                        bg={colorMode === "dark" ? "gray.800" : "white"}
                        borderColor={
                          colorMode === "dark" ? "gray.700" : "gray.200"
                        }
                        shadow="lg"
                      >
                        <Menu.Item
                          value="view"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          _hover={{
                            bg: colorMode === "dark" ? "gray.700" : "gray.50",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewUser(user);
                          }}
                        >
                          <FaEye />
                          View
                        </Menu.Item>
                        <Menu.Item
                          value="delete"
                          color="red.500"
                          _hover={{
                            bg: colorMode === "dark" ? "red.900" : "red.50",
                            color: "red.600",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteUser(user);
                          }}
                        >
                          <FaTrash />
                          Delete
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    );
  };

  // No users found state
  if (users.length === 0) {
    return (
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
      >
        <Card.Body p="8" textAlign="center">
          <FaUsers
            size="48"
            color={colorMode === "dark" ? "#6b7280" : "#9ca3af"}
          />
          <Text
            mt="4"
            fontSize="lg"
            fontWeight="medium"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            No users found
          </Text>
          <Text color={colorMode === "dark" ? "gray.400" : "gray.500"} mt="2">
            Try adjusting your search or filter criteria
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  // Render based on view mode
  return viewMode === "card" ? (
    <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
      {users.map((user) => (
        <UserCard key={user._id} user={user} />
      ))}
    </SimpleGrid>
  ) : (
    <UserTable users={users} />
  );
};

export default ManageUsersTable;
