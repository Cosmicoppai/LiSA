import { Box, Button, Flex, Skeleton, Spacer, Text } from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addCurrentEp,
  addEpisodesDetails,
  getRecommendations,
  getStreamDetails,
} from "../actions/animeActions";
import { useNavigate } from "react-router-dom";
import server from "../axios";

const PaginateCard = ({ data, loading, ep_details, redirect }) => {
  const epDetails = useSelector((state) => state.animeCurrentEp);

  let currentEp = parseInt(epDetails?.details?.current_ep);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const episodeClickHandler = (item, ep_no) => {
    dispatch(getStreamDetails(item.stream_detail));
    dispatch(
      addCurrentEp({
        ...item,
        current_ep: ep_no,
      })
    );
    // dispatch(getRecommendations(ep_details.recommendation));
    if (redirect) {
      navigate("/play");
    }
  };
  const pageChangeHandler = async (url) => {
    const { data } = await server.get(url);
    dispatch(addEpisodesDetails(data));
  };
  let coloredIdx;

  if (!loading && ep_details) {
    let current_page_eps = ep_details.ep_details;
    console.log(currentEp);
    current_page_eps.map((single_ep, idx) => {
      if (Object.keys(single_ep)[0] == currentEp) {
        coloredIdx = idx;
      }
    });
  }

  return (
    <>
      <Box mt={5}>
        {!loading && ep_details ? (
          <Flex
            direction={"row"}
            flexWrap="wrap"
            width={"100%"}
            justifyContent="center"
          >
            {ep_details?.ep_details.map((item, key) => {
              return (
                <Flex
                  cursor={"pointer"}
                  key={key}
                  p={1}
                  mr={2}
                  mt={2}
                  width={"100%"}
                  maxWidth={"45px"}
                  minWidth={"45px"}
                  maxHeight={"45px"}
                  minHeight={"45px"}
                  justifyContent="center"
                  alignItems="center"
                  bg={coloredIdx == key && !redirect ? "#10495F" : "brand.900"}
                  onClick={() =>
                    episodeClickHandler(
                      Object.values(item)[0],
                      Object.keys(item)[0]
                    )
                  }
                >
                  <Text textAlign={"center"}>{Object.keys(item)[0]}</Text>
                </Flex>
              );
            })}
          </Flex>
        ) : (
          <Flex
            direction={"row"}
            flexWrap="wrap"
            width={"100%"}
            justifyContent="center"
          >
            {Array(25)
              .fill(0)
              .map((item, key) => {
                return (
                  <Skeleton
                    p={2}
                    mr={2}
                    mt={2}
                    width={"100%"}
                    maxWidth={"50px"}
                    justifyContent="center"
                    key={key}
                  >
                    <Flex
                      width={"100%"}
                      maxWidth={"50px"}
                      backgroundColor={
                        currentEp === key + 1 ? "while" : "inherit"
                      }
                      justifyContent="center"
                    >
                      <Text textAlign={"center"}>{key + 1}</Text>
                    </Flex>
                  </Skeleton>
                );
              })}
          </Flex>
        )}
        {/* <EpPopover isOpen={isOpen} onOpen={onOpen} onClose={onClose} /> */}
      </Box>
      {data && (
        <Flex sx={{ marginTop: "20px !important" }}>
          {ep_details?.prev_page_url && (
            <Button
              onClick={() => pageChangeHandler(ep_details?.prev_page_url)}
              disabled={loading}
            >
              Previous Page
            </Button>
          )}
          <Spacer />

          {ep_details?.next_page_url && (
            <Button
              onClick={() => pageChangeHandler(ep_details?.next_page_url)}
              disabled={loading}
            >
              Next Page
            </Button>
          )}
        </Flex>
      )}
    </>
  );
};

export default PaginateCard;
