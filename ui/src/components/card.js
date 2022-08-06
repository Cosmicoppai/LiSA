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
} from "@chakra-ui/react";

export default function Card({ data }) {
  console.log(data.img_url);
  return (
    <Center py={12}>
      <Box
        role={"group"}
        p={6}
        maxW={"330px"}
        w={"full"}
        bg={"gray.800"}
        boxShadow={"2xl"}
        rounded={"lg"}
        pos={"relative"}
        zIndex={1}
      >
        <Box
          rounded={"lg"}
          mt={-12}
          pos={"relative"}
          height={"230px"}
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
            height={230}
            width={282}
            objectFit={"cover"}
            src={data.img_url}
          />
        </Box>
        <Stack pt={10} align={"center"}>
          <Text color={"gray.500"} fontSize={"sm"} textTransform={"uppercase"}>
            {data.anime_type}
          </Text>
          <Heading fontSize={"2xl"} fontFamily={"body"} fontWeight={500}>
            {data.title}
          </Heading>
          <Flex
            direction={"row"}
            justifyContent={"space-between"}
            flex={1}
            width={"100%"}
          >
            <Text fontWeight={800} fontSize={"xl"}>
              {data.score}
            </Text>
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
                {data.episodes !== "?eps" ? data.episodes : "Running"}
              </Text>
            </Badge>
          </Flex>
        </Stack>
      </Box>
    </Center>
  );
}
