import { Badge, Box, Flex, Icon, Tooltip } from '@chakra-ui/react';
import {
    AiOutlineCompass,
    AiOutlineDownload,
    AiOutlineSearch,
    AiOutlineSetting,
} from 'react-icons/ai';
import { LuListVideo } from 'react-icons/lu';
import { Link, useLocation } from 'react-router-dom';

import { useGetDownloadingList } from './ActiveDownloads';

export function Navbar() {
    return (
        <Flex
            pt="8"
            pb="8"
            alignItems={'center'}
            justifyContent={'space-between'}
            flexDirection="column"
            gap={10}
            height={'100%'}
            minWidth={'80px'}
            maxWidth={'80px'}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: 40,
                }}>
                <NavBarItem label="Search" to={'/'} Icon={AiOutlineSearch} />
                <NavBarItem label="Explore" to={'/explore'} Icon={AiOutlineCompass} />
                <NavBarItem label="My List" to={'/mylist'} Icon={LuListVideo} />
                <NavBarDownloadItem label="Downloads" to={'/download'} Icon={AiOutlineDownload} />
            </div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: 40,
                }}>
                <NavBarItem label="Settings" to={'/setting'} Icon={AiOutlineSetting} />
            </div>
        </Flex>
    );
}

function NavBarItem({ label, to, Icon: IconAs }) {
    const { pathname } = useLocation();

    return (
        <Tooltip label={label} placement="right">
            <Link to={to}>
                <Icon as={IconAs} w={8} h={8} color={pathname === to ? 'white' : '#9c9c9c'} />
            </Link>
        </Tooltip>
    );
}

function NavBarDownloadItem({ label, to, Icon: IconAs }) {
    const { pathname } = useLocation();

    const { downloadingList } = useGetDownloadingList();

    const totalItems = downloadingList.length;

    const countText = totalItems > 9 ? '9+' : totalItems;

    return (
        <Tooltip label={label} placement="right">
            <Link to={to}>
                <Box pos="relative">
                    {totalItems > 0 ? (
                        <Badge
                            pos="absolute"
                            variant="solid"
                            borderRadius={12}
                            px={1}
                            bgColor="red"
                            right={-1}
                            bottom={-0.2}>
                            {countText}
                        </Badge>
                    ) : null}
                    <Icon as={IconAs} w={8} h={8} color={pathname === to ? 'white' : '#9c9c9c'} />
                </Box>
            </Link>
        </Tooltip>
    );
}
