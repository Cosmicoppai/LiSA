import { Icon, Text } from '@chakra-ui/react';

export function Tabs({ currentValue, onChange, config = [] }) {
    return (
        <div
            style={{
                display: 'flex',
                columnGap: 10,
            }}>
            {config.map(({ Icon: IIcon, title, ...rest }, index) => (
                <div
                    key={index}
                    style={{
                        backgroundColor: currentValue === rest.value ? '#F7FAFC' : 'initial',
                        color: currentValue === rest.value ? '#1A202C' : '#CBD5E0',
                        padding: 10,
                        borderRadius: 25,
                        paddingLeft: 14,
                        paddingRight: 14,
                        display: 'flex',
                        alignItems: 'center',
                        columnGap: 10,
                        cursor: 'pointer',
                    }}
                    onClick={() => {
                        onChange(rest);
                    }}>
                    <Icon
                        as={IIcon}
                        w={4}
                        h={4}
                        color={currentValue === rest.value ? '#1A202C' : '#CBD5E0'}
                    />
                    <Text fontWeight={'bold'}>{title}</Text>
                </div>
            ))}
        </div>
    );
}
