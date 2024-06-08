import { DownloadItem } from './downloadItem';

export function DownloadList(props) {
    return (
        <>
            {props?.filesStatus &&
                Object.entries(props?.filesStatus).map(([key, value]) => {
                    return (
                        <DownloadItem
                            data={value}
                            key={key}
                            cancelDownloadHandler={props.cancelDownloadHandler}
                            pauseDownloadHandler={props.pauseDownloadHandler}
                            resumeDownloadHandler={props.resumeDownloadHandler}
                        />
                    );
                })}
        </>
    );
}
