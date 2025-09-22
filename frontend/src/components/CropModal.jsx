import React, { useState, useCallback } from "react";
import {
  Dialog,
  Button,
  Text,
  VStack,
  HStack,
  Portal,
  Box,
  Slider,
} from "@chakra-ui/react";
import { LuX, LuCheck, LuRotateCw } from "react-icons/lu";
import { useColorMode } from "./ui/color-mode";
import Cropper from "react-easy-crop";

const CropModal = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1, // Default to square (1:1)
  cropShape = "round", // "rect" or "round"
}) => {
  const { colorMode } = useColorMode();

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteHandler = useCallback(
    (croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous");
      image.src = url;
    });

  const getRadianAngle = (degreeValue) => {
    return (degreeValue * Math.PI) / 180;
  };

  const rotateSize = (width, height, rotation) => {
    const rotRad = getRadianAngle(rotation);
    return {
      width:
        Math.abs(Math.cos(rotRad) * width) +
        Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) +
        Math.abs(Math.cos(rotRad) * height),
    };
  };

  const getCroppedImg = async (
    imageSrc,
    pixelCrop,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
  ) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    const rotRad = getRadianAngle(rotation);
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    );

    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");

    if (!croppedCtx) {
      return null;
    }

    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      croppedCanvas.toBlob(
        (file) => {
          resolve(file);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedImage = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );

      if (croppedImage) {
        onCropComplete(croppedImage);
        onClose();
      }
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    onClose();
  };

  if (!imageSrc || !isOpen) {
    return null;
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => !open && handleClose()}
    >
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.800" />
        <Dialog.Positioner>
          <Dialog.Content
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            borderWidth="1px"
            maxW={{ base: "100vw", sm: "95vw", md: "5xl", lg: "6xl" }}
            maxH={{ base: "100vh", sm: "95vh", md: "95vh" }}
            w={{ base: "100vw", sm: "95vw", md: "90vw", lg: "80vw" }}
            h={{ base: "100vh", sm: "auto" }}
            mx={{ base: "0", sm: "auto" }}
            my={{ base: "0", sm: "auto" }}
            overflow="hidden"
            borderRadius={{ base: "0", sm: "lg" }}
            display="flex"
            flexDirection="column"
          >
            <Dialog.Header
              pb="4"
              px={{ base: "4", md: "6" }}
              pt={{ base: "4", md: "6" }}
              borderBottomWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack justify="space-between" align="center">
                <Dialog.Title
                  fontSize="lg"
                  fontWeight="semibold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Crop Profile Image
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    onClick={handleClose}
                  >
                    <LuX />
                  </Button>
                </Dialog.CloseTrigger>
              </HStack>
            </Dialog.Header>

            <Dialog.Body
              py={{ base: "4", md: "6" }}
              px={{ base: "4", md: "6" }}
              flex="1"
              overflow="hidden"
            >
              {/* Mobile Layout - Vertical Stack */}
              <VStack
                spacing="4"
                align="stretch"
                display={{ base: "flex", md: "none" }}
                h="full"
                overflowY="auto"
              >
                {/* Mobile Crop Area */}
                <Box
                  position="relative"
                  w="full"
                  h="280px"
                  bg={colorMode === "dark" ? "gray.900" : "gray.100"}
                  rounded="md"
                  overflow="hidden"
                  border="2px solid"
                  borderColor={colorMode === "dark" ? "gray.700" : "gray.300"}
                >
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspectRatio}
                    cropShape={cropShape}
                    onCropChange={setCrop}
                    onCropComplete={onCropCompleteHandler}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    style={{
                      containerStyle: {
                        width: "100%",
                        height: "100%",
                        backgroundColor:
                          colorMode === "dark" ? "#1a202c" : "#f7fafc",
                      },
                    }}
                  />
                </Box>

                {/* Mobile Controls */}
                <VStack spacing="4" align="stretch">
                  {/* Zoom Control */}
                  <Box>
                    <HStack justify="space-between" align="center" mb="2">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={colorMode === "dark" ? "gray.300" : "gray.700"}
                      >
                        Zoom: {Math.round(zoom * 100)}%
                      </Text>
                      <Button
                        size="xs"
                        variant="outline"
                        colorPalette="gray"
                        onClick={() => setZoom(1)}
                        title="Reset zoom"
                        disabled={zoom === 1}
                      >
                        Reset
                      </Button>
                    </HStack>
                    <Slider.Root
                      value={[zoom]}
                      onValueChange={({ value }) => setZoom(value[0])}
                      min={1}
                      max={3}
                      step={0.1}
                      colorPalette="teal"
                    >
                      <Slider.Control>
                        <Slider.Track
                          bg={colorMode === "dark" ? "gray.700" : "gray.200"}
                        >
                          <Slider.Range bg="teal.500" />
                        </Slider.Track>
                        <Slider.Thumbs />
                      </Slider.Control>
                    </Slider.Root>
                  </Box>

                  {/* Rotation Control */}
                  <Box>
                    <HStack justify="space-between" align="center" mb="2">
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={colorMode === "dark" ? "gray.300" : "gray.700"}
                      >
                        Rotation: {rotation}°
                      </Text>
                      <HStack spacing="2">
                        <Button
                          size="xs"
                          variant="outline"
                          colorPalette="teal"
                          onClick={() =>
                            setRotation((prev) => (prev + 90) % 360)
                          }
                          title="Rotate 90° clockwise"
                        >
                          <LuRotateCw />
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          colorPalette="gray"
                          onClick={() => setRotation(0)}
                          title="Reset rotation"
                          disabled={rotation === 0}
                        >
                          Reset
                        </Button>
                      </HStack>
                    </HStack>
                    <Slider.Root
                      value={[rotation]}
                      onValueChange={({ value }) => setRotation(value[0])}
                      min={-180}
                      max={180}
                      step={1}
                      colorPalette="teal"
                    >
                      <Slider.Control>
                        <Slider.Track
                          bg={colorMode === "dark" ? "gray.700" : "gray.200"}
                        >
                          <Slider.Range bg="teal.500" />
                        </Slider.Track>
                        <Slider.Thumbs />
                      </Slider.Control>
                    </Slider.Root>
                  </Box>

                  {/* Reset All Controls */}
                  <HStack justify="space-between" align="center">
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    >
                      💡 Drag to reposition, scroll to zoom
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="gray"
                      onClick={() => {
                        setZoom(1);
                        setRotation(0);
                        setCrop({ x: 0, y: 0 });
                      }}
                      disabled={zoom === 1 && rotation === 0}
                    >
                      Reset All
                    </Button>
                  </HStack>
                </VStack>
              </VStack>

              {/* Desktop Layout - Side by Side */}
              <HStack
                spacing="8"
                align="stretch"
                h="full"
                display={{ base: "none", md: "flex" }}
              >
                {/* Left Side - Crop Area */}
                <Box flex="2" minW="0">
                  <VStack spacing="4" h="full">
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      alignSelf="flex-start"
                    >
                      Crop Your Image
                    </Text>
                    <Box
                      position="relative"
                      w="full"
                      flex="1"
                      minH="400px"
                      bg={colorMode === "dark" ? "gray.900" : "gray.100"}
                      rounded="lg"
                      overflow="hidden"
                      border="2px solid"
                      borderColor={
                        colorMode === "dark" ? "gray.700" : "gray.300"
                      }
                      shadow="lg"
                    >
                      <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspectRatio}
                        cropShape={cropShape}
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        style={{
                          containerStyle: {
                            width: "100%",
                            height: "100%",
                            backgroundColor:
                              colorMode === "dark" ? "#1a202c" : "#f7fafc",
                          },
                        }}
                      />
                    </Box>
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.400" : "gray.600"}
                      textAlign="center"
                    >
                      💡 Drag to reposition • Scroll to zoom • Use controls on
                      the right
                    </Text>
                  </VStack>
                </Box>

                {/* Right Side - Controls */}
                <Box flex="1" minW="300px" maxW="350px">
                  <VStack spacing="6" h="full">
                    <Text
                      fontSize="lg"
                      fontWeight="semibold"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      alignSelf="flex-start"
                    >
                      Adjust Settings
                    </Text>

                    {/* Zoom Control */}
                    <Box w="full">
                      <HStack justify="space-between" align="center" mb="3">
                        <Text
                          fontSize="md"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Zoom: {Math.round(zoom * 100)}%
                        </Text>
                        <Button
                          size="sm"
                          variant="outline"
                          colorPalette="gray"
                          onClick={() => setZoom(1)}
                          title="Reset zoom"
                          disabled={zoom === 1}
                        >
                          Reset
                        </Button>
                      </HStack>
                      <Slider.Root
                        value={[zoom]}
                        onValueChange={({ value }) => setZoom(value[0])}
                        min={1}
                        max={3}
                        step={0.1}
                        colorPalette="teal"
                      >
                        <Slider.Control>
                          <Slider.Track
                            bg={colorMode === "dark" ? "gray.700" : "gray.200"}
                            h="3"
                          >
                            <Slider.Range bg="teal.500" />
                          </Slider.Track>
                          <Slider.Thumbs />
                        </Slider.Control>
                      </Slider.Root>
                    </Box>

                    {/* Rotation Control */}
                    <Box w="full">
                      <HStack justify="space-between" align="center" mb="3">
                        <Text
                          fontSize="md"
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Rotation: {rotation}°
                        </Text>
                        <HStack spacing="2">
                          <Button
                            size="sm"
                            variant="outline"
                            colorPalette="teal"
                            onClick={() =>
                              setRotation((prev) => (prev + 90) % 360)
                            }
                            title="Rotate 90° clockwise"
                          >
                            <LuRotateCw />
                            90°
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            colorPalette="gray"
                            onClick={() => setRotation(0)}
                            title="Reset rotation"
                            disabled={rotation === 0}
                          >
                            Reset
                          </Button>
                        </HStack>
                      </HStack>
                      <Slider.Root
                        value={[rotation]}
                        onValueChange={({ value }) => setRotation(value[0])}
                        min={-180}
                        max={180}
                        step={1}
                        colorPalette="teal"
                      >
                        <Slider.Control>
                          <Slider.Track
                            bg={colorMode === "dark" ? "gray.700" : "gray.200"}
                            h="3"
                          >
                            <Slider.Range bg="teal.500" />
                          </Slider.Track>
                          <Slider.Thumbs />
                        </Slider.Control>
                      </Slider.Root>
                    </Box>

                    {/* Reset All */}
                    <Box
                      w="full"
                      p="4"
                      bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                      rounded="lg"
                      border="1px solid"
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                    >
                      <VStack spacing="3">
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                          textAlign="center"
                        >
                          Reset all adjustments to default values
                        </Text>
                        <Button
                          size="md"
                          variant="outline"
                          colorPalette="gray"
                          onClick={() => {
                            setZoom(1);
                            setRotation(0);
                            setCrop({ x: 0, y: 0 });
                          }}
                          disabled={zoom === 1 && rotation === 0}
                          w="full"
                        >
                          Reset All Settings
                        </Button>
                      </VStack>
                    </Box>

                    {/* Spacer to push content up */}
                    <Box flex="1" />
                  </VStack>
                </Box>
              </HStack>
            </Dialog.Body>

            <Dialog.Footer
              pt="4"
              borderTopWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              px={{ base: "4", md: "6" }}
              pb={{ base: "6", md: "6" }}
              bg={colorMode === "dark" ? "gray.800" : "white"}
            >
              <VStack w="full" spacing="3">
                {/* Mobile Layout - Stacked Buttons */}
                <VStack
                  w="full"
                  spacing="3"
                  display={{ base: "flex", md: "none" }}
                >
                  <Button
                    colorPalette="teal"
                    onClick={handleSave}
                    loading={isProcessing}
                    loadingText="Processing..."
                    w="full"
                    size="lg"
                    disabled={!croppedAreaPixels}
                  >
                    <LuCheck />
                    Save Image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    w="full"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </VStack>

                {/* Desktop Layout - Side by Side Buttons */}
                <HStack
                  w="full"
                  justify="flex-end"
                  spacing="3"
                  display={{ base: "none", md: "flex" }}
                >
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    size="lg"
                    minW="120px"
                  >
                    Cancel
                  </Button>
                  <Button
                    colorPalette="teal"
                    onClick={handleSave}
                    loading={isProcessing}
                    loadingText="Processing..."
                    size="lg"
                    minW="180px"
                    disabled={!croppedAreaPixels}
                  >
                    <LuCheck />
                    Save Cropped Image
                  </Button>
                </HStack>
              </VStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CropModal;
