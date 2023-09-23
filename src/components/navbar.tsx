import { Link, useLocation } from "react-router-dom";
import { Flex, Icon, Tooltip } from "@chakra-ui/react";
import { AiOutlineCompass, AiOutlineDownload, AiOutlineSearch, AiOutlineSetting } from "react-icons/ai";
import { LuListVideo } from "react-icons/lu";
export default function Navbar() {

    const { pathname } = useLocation();

    return (
        <Flex
            pt="8"
            alignItems={"center"}
            justifyContent={"flex-start"}
            flexDirection="column"
            gap={10}
            height={"100%"}
            minWidth={"70px"}
            maxWidth={"70px"}>
            <Tooltip label="Search" placement="auto-start">
                <Link to="/">
                    <Icon
                        as={AiOutlineSearch}
                        w={8}
                        h={8}
                        mb={"-3"}
                        color={pathname === "/" ? "white" : "#9c9c9c"}
                    />
                </Link>
            </Tooltip>

            <Tooltip label="Explore" placement="auto-start">
                <Link to="/explore">
                    <Icon
                        as={AiOutlineCompass}
                        w={8}
                        h={8}
                        mb={"-3"}
                        color={pathname === "/explore" ? "white" : "#9c9c9c"}
                    />
                </Link>
            </Tooltip>

            <Tooltip label="Downloads" placement="auto-start">
                <Link to="/download">
                    <Icon
                        as={AiOutlineDownload}
                        w={8}
                        h={8}
                        mb={"-3"}
                        color={pathname === "/download" ? "white" : "#9c9c9c"}
                    />
                </Link>
            </Tooltip>

            <Tooltip label="My List" placement="auto-start">
                <Link to="/mylist">
                    <Icon
                        as={LuListVideo}
                        w={8}
                        h={8}
                        mb={"-3"}
                        color={pathname === "/mylist" ? "white" : "#9c9c9c"}
                    />
                </Link>
            </Tooltip>
            {/* <Link to="/setting" >
                <Icon
                    as={AiOutlineSetting}
                    w={8} h={8} mb={"-3"}
                    color={pathname === "/setting" ? "white" : "#9c9c9c"}
                />
            </Link> */}
        </Flex>
    );
};