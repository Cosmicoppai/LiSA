import { BsBookHalf } from 'react-icons/bs';
import { RiMovieFill } from 'react-icons/ri';
import { Tabs } from 'src/components/Tabs';
import { useAppContext } from 'src/context/app';

export function AppModeSwitch() {
    const { mode, setMode } = useAppContext();

    return (
        <Tabs
            config={[
                {
                    title: 'Anime',
                    Icon: RiMovieFill,
                    value: 'anime',
                },
                {
                    title: 'Manga',
                    Icon: BsBookHalf,
                    value: 'manga',
                },
            ]}
            currentValue={mode}
            onChange={({ value }) => setMode(value)}
        />
    );
}
