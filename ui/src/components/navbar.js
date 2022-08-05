import { DownloadIcon, HamburgerIcon, SettingsIcon } from "@chakra-ui/icons";
import {
    Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import React from "react";

const Navbar = () => {
  return (
    <Flex justifyContent="flex-end">
      <Box mt={2} mr={2}>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<HamburgerIcon />}
          />
          <MenuList>
            <MenuItem icon={<DownloadIcon />} command="⌘T">
              Downloads
            </MenuItem>
            <MenuItem icon={<SettingsIcon />} command="⌘N">
              Setting
            </MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
};

export default Navbar;
