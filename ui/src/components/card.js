import {
  Box,
  Center,
  useColorModeValue,
  Heading,
  Text,
  Stack,
  Image,
  Flex,
  Badge,
  Spacer,
} from "@chakra-ui/react";
import { AiFillStar } from "react-icons/ai";

export default function Card({ data }) {
  console.log(data);
  return (
    <Box sx={{ display: "flex", padding: "1rem", margin: "10px auto" }}>
      <Box
        role={"group"}
        p={6}
        maxW={"270px"}
        w={"270px"}
        bg={"gray.800"}
        boxShadow={"2xl"}
        rounded={"lg"}
        pos={"relative"}
        zIndex={1}
      >
        {/* <div class="card_image">
          <img src={data.img_url} />
        </div> */}
        <Box
          rounded={"lg"}
          mt={-12}
          pos={"relative"}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          _after={{
            transition: "all .3s ease",
            content: '""',
            w: "full",
            h: "full",
            pos: "absolute",

            top: 5,
            left: 0,
            backgroundImage: `url(${data.img_url})`,
            filter: "blur(15px)",
            zIndex: -1,
          }}
          _groupHover={{
            _after: {
              filter: "blur(20px)",
            },
          }}
        >
          <Image
            rounded={"lg"}
            // height={230}
            // width={282}
            objectFit={"fill"}
            src={data.img_url}
            minWidth={"222px"}
            minHeight={"316px"}
          />
        </Box>
        <Stack pt={5} align={"center"}>
          <Flex flex={1} width={"100%"}>
            <Text
              color={"gray.500"}
              fontSize={"sm"}
              textTransform={"uppercase"}
            >
              {data.anime_type}
            </Text>
            <Spacer />
            <Box sx={{ display: "flex" }}>
              <Text
                color={"gray.500"}
                fontSize={"sm"}
                textTransform={"uppercase"}
              >
                Rank
              </Text>
              <Text
                fontWeight={500}
                ml={1}
                // color={"gray.500"}
                fontSize={"sm"}
                textTransform={"uppercase"}
              >
                #{data.rank}
              </Text>
            </Box>
          </Flex>

          <Heading
            fontSize={"xl"}
            fontFamily={"body"}
            fontWeight={500}
            textAlign={"left"}
            alignSelf={"flex-start"}
          >
            {data.title}
          </Heading>
          <Flex
            pt={2}
            direction={"row"}
            justifyContent={"space-between"}
            flex={1}
            width={"100%"}
          >
            <Box display={"flex"} alignItems="center" justifyContent={"center"}>
              <AiFillStar color="#FDCC0D" fontSize={"20px"} />
              <Text ml={"5px"} fontWeight={800} fontSize={"sm"} mt={0}>
                {data.score}
              </Text>
            </Box>
            <Badge
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "5px",
                p: 1,
              }}
            >
              <Text color={"gray.300"}>
                {data.episodes !== "?" ? "Ep " + data.episodes : "Running"}
              </Text>
            </Badge>
          </Flex>
        </Stack>
      </Box>
    </Box>
  );
}

{
  // <Center py={12}>
  //   <Box
  //     role={"group"}
  //     p={6}
  //     // maxW={"330px"}
  //     w={"330px"}
  //     bg={"gray.800"}
  //     boxShadow={"2xl"}
  //     rounded={"lg"}
  //     pos={"relative"}
  //     zIndex={1}
  //   >
  //     <Box
  //       rounded={"lg"}
  //       mt={-12}
  //       pos={"relative"}
  //       height={"230px"}
  //       _after={{
  //         transition: "all .3s ease",
  //         content: '""',
  //         w: "full",
  //         h: "full",
  //         pos: "absolute",
  //         top: 5,
  //         left: 0,
  //         backgroundImage: `url(${data.img_url})`,
  //         filter: "blur(15px)",
  //         zIndex: -1,
  //       }}
  //       _groupHover={{
  //         _after: {
  //           filter: "blur(20px)",
  //         },
  //       }}
  //     >
  //       <Image
  //         rounded={"lg"}
  //         height={230}
  //         width={282}
  //         objectFit={"contain"}
  //         src={data.img_url}
  //       />
  //     </Box>
  //   </Box>
  // </Center>
}
