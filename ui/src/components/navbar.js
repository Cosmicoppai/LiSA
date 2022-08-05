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
import { Link } from "react-router-dom";
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
            <Link to="/ ">
              {" "}
              <MenuItem icon={<DownloadIcon />} command="⌘T">
                Search
              </MenuItem>
            </Link>

            <Link to="/download">
              {" "}
              <MenuItem icon={<DownloadIcon />} command="⌘T">
                Download
              </MenuItem>
            </Link>

            <Link to="/setting">
              {" "}
              <MenuItem icon={<SettingsIcon />} command="⌘N">
                Setting
              </MenuItem>
            </Link>
          </MenuList>
        </Menu>
      </Box>
    </Flex>
  );
};

export default Navbar;
