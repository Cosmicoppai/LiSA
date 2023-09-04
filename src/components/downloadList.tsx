import React from "react";
import DownloadItem from "./downloadItem";

const DownloadList = (props) => {
  return (
    <>
      {" "}
      {props?.filesStatus &&
        Object.entries(props?.filesStatus).map(([key, value]) => {
          return (
            <DownloadItem
              id={key}
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
};

export default DownloadList;
