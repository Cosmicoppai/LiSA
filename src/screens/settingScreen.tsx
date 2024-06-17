import { Flex, Icon, Image, Text, Tooltip } from '@chakra-ui/react';
import { RxGithubLogo } from 'react-icons/rx';
import { localImagesPath } from 'src/constants/images';
import { openExternalUrl } from 'src/utils/fn';

import pkg from '../../package.json';

export function SettingScreen() {
    return (
        <Flex w="100%" h="100%" direction="column" bg={'gray.900'}>
            <Flex align="center" justify="center" direction="column" w="100%" h="100%" rowGap={8}>
                <Image objectFit="cover" src={localImagesPath.homeScreenLogo} alt="logo" />
                <Text color={'gray.500'}>Version {pkg.version}</Text>
                <Tooltip label={'Github'} placement="bottom">
                    <div
                        style={{
                            cursor: 'pointer',
                        }}
                        onClick={() => openExternalUrl(pkg.repository.url)}>
                        <Icon as={RxGithubLogo} w={8} h={8} color={'white'} />
                    </div>
                </Tooltip>
            </Flex>
        </Flex>
    );
}
