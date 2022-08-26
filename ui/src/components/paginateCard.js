import { Box, Button, Flex, Skeleton, Text } from "@chakra-ui/react";
import React from "react";
import { useDispatch } from "react-redux";
import {
  addCurrentEp,
  addEpisodesDetails,
  getStreamDetails,
  searchAnimeList,
} from "../actions/animeActions";
import { Link, useNavigate } from "react-router-dom";
import server from "../axios";

const PaginateCard = ({ data, loading, ep_details, redirect }) => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const episodeClickHandler = (item, ep_no) => {
    // dispatch(clearEp());
console.log(item)
    dispatch(getStreamDetails(item.stream_detail));
    dispatch(addCurrentEp({ ...item, current_ep: ep_no }));
    if (redirect) {
      navigate("/play");
    }
  };
  const pageChangeHandler = async(url) => {
    const { data } = await server.get(url);
    dispatch(addEpisodesDetails(data));
  };

  return (
    <>
      <Box mt={5}>
        {!loading ? (
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
                  p={2}
                  mr={2}
                  mt={2}
                  bg="brand.900"
                  width={"100%"}
                  maxWidth={"50px"}
                  justifyContent="center"
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
            {Array(30)
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
        <Flex
          sx={{ marginTop: "20px !important" }}
          width={"100%"}
          justifyContent={"space-between"}
        >
          {ep_details?.prev_page_url && (
            <Button
              onClick={() => pageChangeHandler(ep_details?.prev_page_url)}
              disabled={loading}
            >
              Previous Page
            </Button>
          )}

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
