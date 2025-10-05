import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  InputGroup,
  Spinner,
  Alert,
  Flex,
  IconButton,
  SimpleGrid,
  Badge,
  Avatar,
  Table,
  Container,
  Select,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import {
  FaSearch,
  FaUsers,
  FaChartLine,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { MdApps, MdList } from "react-icons/md";
import { SiLichess } from "react-icons/si";
import { useColorMode } from "../../../components/ui/color-mode";
import { useNavigate, useLocation } from "react-router-dom";
import lichessService from "../../../services/lichess";
import batchService from "../../../services/batches";
import classService from "../../../services/classes";
import { normalizeImageUrl } from "../../../utils/imageUrl";

const TeacherLichess = () => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check URL search params for tab state
  const urlParams = new URLSearchParams(location.search);
  const initialTab = urlParams.get('tab') === 'students' ? 'students' : 'overview';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  
  // Sorting state
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("desc");

  // Create collections for Select components using useMemo to handle async data
  const batchCollection = useMemo(() => {
    return createListCollection({
      items: [
        { label: "All Batches", value: "" },
        ...(Array.isArray(batches) ? batches.map(batch => ({ label: batch.batchName, value: batch._id })) : [])
      ],
    });
  }, [batches]);

  const classCollection = useMemo(() => {
    console.log('Creating class collection with classes:', classes);
    return createListCollection({
      items: [
        { label: "All Classes", value: "" },
        ...(Array.isArray(classes) ? classes.map(cls => ({ label: cls.className, value: cls._id })) : [])
      ],
    });
  }, [classes]);

  const sortByCollection = useMemo(() => {
    return createListCollection({
      items: [
        { label: "Name", value: "name" },
        { label: "Rapid Rating", value: "rapidRating" },
        { label: "Games Played", value: "gamesPlayed" },
        { label: "Win Rate", value: "winRate" },
      ],
    });
  }, []);

  useEffect(() => {
    fetchStudentData();
    fetchBatches();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchClassesByBatch(selectedBatch);
    } else {
      setClasses([]);
      setSelectedClass("");
    }
  }, [selectedBatch]);

  const fetchBatches = async () => {
    try {
      const response = await batchService.getBatchesForTeacher({ limit: 100 });
      setBatches(response.data || []);
    } catch (err) {
      console.error('Failed to fetch batches:', err);
      setBatches([]);
    }
  };

  const fetchClassesByBatch = async (batchId) => {
    try {
      const response = await classService.getClassesByBatch(batchId);
      // Backend returns { success: true, data: { batch, classes } }
      setClasses(response.data?.classes || []);
    } catch (err) {
      console.error('Failed to fetch classes:', err);
      setClasses([]);
    }
  };

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await lichessService.getTeacherOverview();
      const students = response.data.students || [];
      
      // Debug: Check student data structure for batch/class info
      console.log('Received students data:', students.slice(0, 2).map(s => ({
        name: s.name,
        batchId: s.batchId,
        batch: s.batch,
        enrolledClasses: s.enrolledClasses,
        classes: s.classes
      })));
      
      // Normalize profile image URLs
      const normalizedStudents = students.map(student => ({
        ...student,
        profileImageUrl: normalizeImageUrl(student.profileImageUrl)
      }));
      
      setStudents(normalizedStudents);
    } catch (err) {
      console.error('Failed to fetch student Lichess data:', err);
      setError(err.message || 'Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewStudent = (student) => {
    navigate(`/teacher/lichess/student/${student.lichessUsername}`);
  };

  const filteredAndSortedStudents = students
    .filter((student) => {
      // Search filter
      const matchesSearch = (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.lichessUsername || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Batch filter
      const matchesBatch = !selectedBatch || student.batchId === selectedBatch;
      
      // Class filter
      const matchesClass = !selectedClass || (student.enrolledClasses && student.enrolledClasses.includes(selectedClass));
      
      // Debug logging for filtering
      if (selectedBatch && students.length > 0) {
        console.log('Filtering student:', {
          name: student.name,
          studentBatchId: student.batchId,
          selectedBatch,
          matchesBatch,
          enrolledClasses: student.enrolledClasses,
          selectedClass,
          matchesClass,
          finalMatch: matchesSearch && matchesBatch && matchesClass
        });
      }
      
      return matchesSearch && matchesBatch && matchesClass;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'rapidRating':
          aValue = a.rapidRating || a.rating || 0;
          bValue = b.rapidRating || b.rating || 0;
          break;
        case 'gamesPlayed':
          aValue = a.gamesPlayed || 0;
          bValue = b.gamesPlayed || 0;
          break;
        case 'winRate':
          aValue = a.winRate || 0;
          bValue = b.winRate || 0;
          break;
        default:
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

  // Debug: Log filtering results
  console.log('Filtering results:', {
    totalStudents: students.length,
    filteredStudents: filteredAndSortedStudents.length,
    selectedBatch,
    selectedClass,
    searchTerm
  });

  const StudentCard = ({ student }) => (
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
      onClick={() => handleViewStudent(student)}
    >
      <Card.Body p="4">
        <HStack spacing="3" align="start">
          <Avatar.Root size="sm">
            {student.profileImageUrl ? (
              <Avatar.Image
                src={student.profileImageUrl}
                alt={student.name || student.lichessUsername}
              />
            ) : null}
            <Avatar.Fallback>
              {student.name ? 
                student.name.split(' ').map(n => n[0]).join('') : 
                student.lichessUsername.slice(0, 2).toUpperCase()
              }
            </Avatar.Fallback>
          </Avatar.Root>
          <VStack align="start" spacing="1" flex="1" minW="0">
            <Text
              fontWeight="semibold"
              fontSize="sm"
              color={colorMode === "dark" ? "white" : "gray.900"}
              isTruncated
            >
              {student.name || 'Unknown Student'}
            </Text>
            <Badge colorPalette="teal" variant="subtle" size="xs">
              @{student.lichessUsername}
            </Badge>
            <Text
              fontSize="xs"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              Rapid: {student.rapidRating || student.rating || 'N/A'} • Games: {student.gamesPlayed || 0}
            </Text>
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );

  const StudentTable = ({ students }) => (
    <Card.Root
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderWidth="1px"
      borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      shadow={colorMode === "dark" ? "lg" : "sm"}
      borderRadius="lg"
      overflow="hidden"
    >
      <Card.Body p="0" overflowX="auto">
        <Table.Root variant="simple" size={{ base: "sm", md: "md" }}>
          <Table.Header bg={colorMode === "dark" ? "gray.750" : "gray.50"}>
            <Table.Row>
              <Table.ColumnHeader 
                color={colorMode === "dark" ? "gray.200" : "gray.700"}
                minW={{ base: "180px", md: "auto" }}
                p={{ base: "4", md: "3" }}
              >
                Student
              </Table.ColumnHeader>
              <Table.ColumnHeader 
                color={colorMode === "dark" ? "gray.200" : "gray.700"}
                display={{ base: "table-cell", sm: "table-cell" }}
                minW={{ base: "100px", md: "auto" }}
                p={{ base: "4", md: "3" }}
                textAlign="center"
              >
                Rapid Rating
              </Table.ColumnHeader>
              <Table.ColumnHeader 
                color={colorMode === "dark" ? "gray.200" : "gray.700"}
                display={{ base: "none", md: "table-cell" }}
                minW={{ base: "100px", md: "auto" }}
                p={{ base: "4", md: "3" }}
              >
                Username
              </Table.ColumnHeader>
              <Table.ColumnHeader 
                color={colorMode === "dark" ? "gray.200" : "gray.700"}
                display={{ base: "none", lg: "table-cell" }}
                minW={{ base: "60px", md: "auto" }}
                p={{ base: "4", md: "3" }}
                textAlign="center"
              >
                Games
              </Table.ColumnHeader>
              <Table.ColumnHeader 
                color={colorMode === "dark" ? "gray.200" : "gray.700"}
                display={{ base: "none", lg: "table-cell" }}
                minW={{ base: "80px", md: "auto" }}
                p={{ base: "4", md: "3" }}
                textAlign="center"
              >
                Win Rate
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {students.map((student) => (
              <Table.Row
                key={student._id || student.lichessUsername}
                _hover={{
                  bg: colorMode === "dark" ? "gray.700" : "gray.50",
                  cursor: "pointer",
                }}
                onClick={() => handleViewStudent(student)}
              >
                <Table.Cell p={{ base: "4", md: "3" }}>
                  <HStack spacing={{ base: "3", md: "3" }}>
                    <Avatar.Root size={{ base: "md", md: "sm" }}>

                      {student.profileImageUrl ? (
                        <Avatar.Image
                          src={student.profileImageUrl}
                          alt={student.name || student.lichessUsername}
                          onError={(e) => {
                            console.error('Failed to load profile image:', e.target.src);
                          }}
                        />
                      ) : null}
                      <Avatar.Fallback
                        bg={colorMode === "dark" ? "gray.600" : "gray.200"}
                        color={colorMode === "dark" ? "white" : "gray.800"}
                      >
                        {student.name ? 
                          student.name.split(' ').map(n => n[0]).join('') : 
                          student.lichessUsername.slice(0, 2).toUpperCase()
                        }
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <VStack align="start" spacing="1" minW="0" flex="1">
                      <Text
                        fontWeight="medium"
                        fontSize={{ base: "sm", md: "sm" }}
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        isTruncated
                        lineHeight="1.2"
                      >
                        {student.name || 'Unknown Student'}
                      </Text>
                      <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        isTruncated
                        display={{ base: "none", md: "block" }}
                        lineHeight="1.2"
                      >
                        {student.email || 'No email'}
                      </Text>
                      {/* Mobile-only username badge */}
                      <Badge 
                        colorPalette="teal" 
                        variant="subtle" 
                        size="xs"
                        display={{ base: "block", md: "none" }}
                        mt="1"
                      >
                        @{student.lichessUsername}
                      </Badge>
                    </VStack>
                  </HStack>
                </Table.Cell>
                <Table.Cell p={{ base: "4", md: "3" }} textAlign="center">
                  <Text 
                    fontSize={{ base: "sm", md: "sm" }} 
                    fontWeight="medium" 
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    {student.rapidRating || student.rating || 'N/A'}
                  </Text>
                </Table.Cell>
                <Table.Cell display={{ base: "none", md: "table-cell" }} p={{ base: "4", md: "3" }}>
                  <Badge colorPalette="teal" variant="subtle" size="sm">
                    @{student.lichessUsername}
                  </Badge>
                </Table.Cell>
                <Table.Cell display={{ base: "none", lg: "table-cell" }} p={{ base: "4", md: "3" }} textAlign="center">
                  <Text fontSize="sm" color={colorMode === "dark" ? "white" : "gray.900"}>
                    {student.gamesPlayed || 0}
                  </Text>
                </Table.Cell>
                <Table.Cell display={{ base: "none", lg: "table-cell" }} p={{ base: "4", md: "3" }} textAlign="center">
                  <Text fontSize="sm" color="green.500" fontWeight="medium">
                    {student.winRate !== undefined && student.winRate !== null 
                      ? `${student.winRate}%` 
                      : 'N/A'}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );

  const renderOverview = () => (
    <VStack spacing="6" align="stretch">
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="6">
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="6">
            <VStack align="start" spacing="3">
              <HStack>
                <Box
                  p="2"
                  bg="teal.100"
                  color="teal.600"
                  borderRadius="md"
                >
                  <FaUsers size="20" />
                </Box>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Total Students
                </Text>
              </HStack>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                {students.length}
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="6">
            <VStack align="start" spacing="3">
              <HStack>
                <Box
                  p="2"
                  bg="blue.100"
                  color="blue.600"
                  borderRadius="md"
                >
                  <SiLichess size="20" />
                </Box>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Average Rapid Rating
                </Text>
              </HStack>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                {students.length > 0 
                  ? Math.round(students.reduce((sum, s) => sum + (s.rapidRating || s.rating || 0), 0) / students.length)
                  : 0}
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="6">
            <VStack align="start" spacing="3">
              <HStack>
                <Box
                  p="2"
                  bg="purple.100"
                  color="purple.600"
                  borderRadius="md"
                >
                  <FaChartLine size="20" />
                </Box>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Average Win Rate
                </Text>
              </HStack>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                {students.length > 0 && students.some(s => s.winRate !== undefined && s.winRate !== null)
                  ? Math.round(students.filter(s => s.winRate !== undefined && s.winRate !== null).reduce((sum, s) => sum + s.winRate, 0) / students.filter(s => s.winRate !== undefined && s.winRate !== null).length)
                  : 0}%
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>
    </VStack>
  );

  const renderStudents = () => (
    <VStack spacing="6" align="stretch">
      {/* Search and View Toggle */}
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
      >
        <Card.Body p={{ base: 3, md: 4 }}>
          <Flex 
            gap={3}
            align="center" 
            direction="row"
            flexWrap={{ base: "wrap", sm: "nowrap" }}
          >
            <InputGroup flex="1" startElement={<FaSearch />}>
              <Input
                placeholder="Search students by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                color={colorMode === "dark" ? "white" : "gray.900"}
                size={{ base: "sm", md: "md" }}
                _placeholder={{
                  color: colorMode === "dark" ? "gray.400" : "gray.500",
                }}
              />
            </InputGroup>

            {/* View Toggle - Now beside search bar */}
            <HStack spacing="1" flexShrink="0">
              <IconButton
                size={{ base: "sm", md: "md" }}
                variant={viewMode === "card" ? "solid" : "outline"}
                colorPalette="teal"
                onClick={() => setViewMode("card")}
              >
                <MdApps />
              </IconButton>
              <IconButton
                size={{ base: "sm", md: "md" }}
                variant={viewMode === "list" ? "solid" : "outline"}
                colorPalette="teal"
                onClick={() => setViewMode("list")}
              >
                <MdList />
              </IconButton>
            </HStack>
          </Flex>
        </Card.Body>
      </Card.Root>

      {/* Sorting Options */}
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
      >
        <Card.Body p={{ base: 3, md: 4 }}>
          <VStack spacing={4} align="stretch">
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Filter & Sort Options
            </Text>
            
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 8, md: 12, lg: 16 }} gap={{ base: 6, md: 8, lg: 10 }}>
              {/* Batch Filter */}
              <VStack align="start" spacing={2} px={{ base: 2, md: 3 }} py={{ base: 2, md: 0 }}>
                <Text fontSize="xs" color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                  Batch
                </Text>
                <Select.Root
                  collection={batchCollection}
                  value={selectedBatch ? [selectedBatch] : [""]}
                  onValueChange={(details) => setSelectedBatch(details.value[0] || "")}
                  size="sm"
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      <Select.ValueText placeholder="All Batches" />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content
                        bg={colorMode === "dark" ? "gray.800" : "white"}
                        borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                        shadow="lg"
                      >
                        {batchCollection.items.map((item) => (
                          <Select.Item
                            key={item.value}
                            item={item}
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            _hover={{
                              bg: colorMode === "dark" ? "gray.700" : "gray.50",
                            }}
                          >
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </VStack>

              {/* Class Filter */}
              <VStack align="start" spacing={2} px={{ base: 2, md: 3 }} py={{ base: 2, md: 0 }}>
                <Text fontSize="xs" color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                  Class
                </Text>
                <Select.Root
                  collection={classCollection}
                  value={selectedClass ? [selectedClass] : [""]}
                  onValueChange={(details) => setSelectedClass(details.value[0] || "")}
                  size="sm"
                  disabled={!selectedBatch}
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      opacity={!selectedBatch ? 0.5 : 1}
                    >
                      <Select.ValueText placeholder="All Classes" />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content
                        bg={colorMode === "dark" ? "gray.800" : "white"}
                        borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                        shadow="lg"
                      >
                        {classCollection.items.map((item) => (
                          <Select.Item
                            key={item.value}
                            item={item}
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            _hover={{
                              bg: colorMode === "dark" ? "gray.700" : "gray.50",
                            }}
                          >
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </VStack>

              {/* Sort By */}
              <VStack align="start" spacing={2} px={{ base: 2, md: 3 }} py={{ base: 2, md: 0 }}>
                <Text fontSize="xs" color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                  Sort By
                </Text>
                <Select.Root
                  collection={sortByCollection}
                  value={[sortBy]}
                  onValueChange={(details) => setSortBy(details.value[0])}
                  size="sm"
                >
                  <Select.HiddenSelect />
                  <Select.Control>
                    <Select.Trigger
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      <Select.ValueText />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content
                        bg={colorMode === "dark" ? "gray.800" : "white"}
                        borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                        shadow="lg"
                      >
                        {sortByCollection.items.map((item) => (
                          <Select.Item
                            key={item.value}
                            item={item}
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            _hover={{
                              bg: colorMode === "dark" ? "gray.700" : "gray.50",
                            }}
                          >
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </VStack>

              {/* Sort Order */}
              <VStack align="start" spacing={2} px={{ base: 2, md: 3 }} py={{ base: 2, md: 0 }}>
                <Text fontSize="xs" color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                  Order
                </Text>
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="teal"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  fontWeight="normal"
                  _hover={{
                    borderColor: colorMode === "dark" ? "gray.500" : "gray.400",
                    bg: colorMode === "dark" ? "gray.600" : "gray.50"
                  }}
                >
                  <HStack spacing={2} align="center">
                    <Box display="flex" alignItems="center" justifyContent="center">
                      {sortOrder === "asc" ? (
                        <FaSortUp style={{ fontSize: '12px', fontWeight: '300' }} />
                      ) : (
                        <FaSortDown style={{ fontSize: '12px', fontWeight: '300' }} />
                      )}
                    </Box>
                    <Text fontWeight="normal">{sortOrder === "asc" ? "Ascending" : "Descending"}</Text>
                  </HStack>
                </Button>
              </VStack>
            </SimpleGrid>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Content */}
      {loading ? (
        <Box textAlign="center" py="8">
          <Spinner size="lg" color="teal.500" />
          <Text mt="4" color={colorMode === "dark" ? "gray.400" : "gray.600"}>
            Loading students...
          </Text>
        </Box>
      ) : error ? (
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>Error Loading Data</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Root>
      ) : filteredAndSortedStudents.length === 0 ? (
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="8" textAlign="center">
            <Box display="flex" justifyContent="center" mb="4">
              <FaUsers
                size="48"
                color={colorMode === "dark" ? "#6b7280" : "#9ca3af"}
              />
            </Box>
            <Text
              fontSize="lg"
              fontWeight="medium"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              No students found
            </Text>
            <Text color={colorMode === "dark" ? "gray.400" : "gray.500"} mt="2">
              Try adjusting your search criteria
            </Text>
          </Card.Body>
        </Card.Root>
      ) : viewMode === "card" ? (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={{ base: 3, md: 4 }}>
          {filteredAndSortedStudents.map((student) => (
            <StudentCard key={student._id || student.lichessUsername} student={student} />
          ))}
        </SimpleGrid>
      ) : (
        <StudentTable students={filteredAndSortedStudents} />
      )}
    </VStack>
  );

  if (loading) {
    return (
      <Container maxW="7xl" py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
        <Box display="flex" alignItems="center" justifyContent="center" h="50vh">
          <VStack spacing="4">
            <Spinner size={{ base: "lg", md: "xl" }} color="teal.500" />
            <Text fontSize={{ base: "sm", md: "md" }} color={colorMode === "dark" ? "gray.300" : "gray.600"}>
              Loading students...
            </Text>
          </VStack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={{ base: 4, md: 6 }} px={{ base: 4, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* Header */}
        <Box>
          <Heading
            size={{ base: "md", md: "lg" }}
            mb="2"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Lichess Dashboard
          </Heading>
          <Text
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
            fontSize={{ base: "sm", md: "md" }}
          >
            Monitor student Lichess accounts and performance
          </Text>
        </Box>

        {/* Tabs */}
        <Box
          overflowX="auto"
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
          }}
        >
          <HStack
            minW="max-content"
            bg={colorMode === "dark" ? "gray.900" : "gray.50"}
            whiteSpace="nowrap"
            px={{ base: "2", md: "0" }}
            borderBottom="1px solid"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            spacing="0"
          >
            <Button
              variant="ghost"
              color={
                activeTab === "overview"
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === "overview" ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => {
                setActiveTab("overview");
                navigate('/teacher/lichess?tab=overview', { replace: true });
              }}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === "overview"
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === "overview"
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === "overview"
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: "-1px",
                      left: "0",
                      right: "0",
                      height: "3px",
                      bg: "#0d9488",
                      borderRadius: "2px 2px 0 0",
                    }
                  : {}
              }
            >
              <FaChartLine />
              Overall Stats
            </Button>
            <Button
              variant="ghost"
              color={
                activeTab === "students"
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === "students" ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => {
                setActiveTab("students");
                navigate('/teacher/lichess?tab=students', { replace: true });
              }}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === "students"
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === "students"
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === "students"
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: "-1px",
                      left: "0",
                      right: "0",
                      height: "3px",
                      bg: "#0d9488",
                      borderRadius: "2px 2px 0 0",
                    }
                  : {}
              }
            >
              <FaUsers />
              Individual Stats
            </Button>
          </HStack>
        </Box>

        {/* Tab Content */}
        <Box mt="6">
          {activeTab === "overview" ? renderOverview() : renderStudents()}
        </Box>
      </VStack>
    </Container>
  );
};

export default TeacherLichess;
