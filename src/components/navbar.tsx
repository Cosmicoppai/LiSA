import { Flex, Icon, Tooltip } from '@chakra-ui/react';
import {
    AiOutlineCompass,
    AiOutlineDownload,
    AiOutlineSearch,
    AiOutlineSetting,
} from 'react-icons/ai';
import { LuListVideo } from 'react-icons/lu';
import { Link, useLocation } from 'react-router-dom';

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
            minWidth={'70px'}
            maxWidth={'70px'}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: 40,
                }}>
                <NavBarItem label="Search" to={'/'} Icon={AiOutlineSearch} />
                <NavBarItem label="Explore" to={'/explore'} Icon={AiOutlineCompass} />
                <NavBarItem label="Downloads" to={'/download'} Icon={AiOutlineDownload} />
                <NavBarItem label="My List" to={'/mylist'} Icon={LuListVideo} />
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

function NavBarItem({ label, to, Icon: IIcon }) {
    const { pathname } = useLocation();

    return (
        <Tooltip label={label} placement="right">
            <Link to={to}>
                <Icon as={IIcon} w={8} h={8} color={pathname === to ? 'white' : '#9c9c9c'} />
            </Link>
        </Tooltip>
    );
}
