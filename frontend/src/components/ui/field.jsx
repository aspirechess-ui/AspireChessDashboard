import { Field as ChakraField } from "@chakra-ui/react";
import * as React from "react";
import { useColorMode } from "./color-mode";

export const Field = React.forwardRef(function Field(props, ref) {
  const { label, children, helperText, errorText, optionalText, ...rest } =
    props;
  const { colorMode } = useColorMode();

  return (
    <ChakraField.Root ref={ref} {...rest}>
      {label && (
        <ChakraField.Label
          color={colorMode === "dark" ? "gray.300" : "gray.700"}
          fontWeight="medium"
        >
          {label}
          <ChakraField.RequiredIndicator
            fallback={optionalText}
            color={colorMode === "dark" ? "red.400" : "red.500"}
          />
        </ChakraField.Label>
      )}
      {children}
      {helperText && (
        <ChakraField.HelperText
          color={colorMode === "dark" ? "gray.400" : "gray.600"}
        >
          {helperText}
        </ChakraField.HelperText>
      )}
      {errorText && (
        <ChakraField.ErrorText
          color={colorMode === "dark" ? "red.400" : "red.500"}
        >
          {errorText}
        </ChakraField.ErrorText>
      )}
    </ChakraField.Root>
  );
});
