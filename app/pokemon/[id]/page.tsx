"use client";
import { useEffect, useState } from "react";
import { Box, Card, Flex, Group, Image, Loader, Text } from "@mantine/core";
import Link from "next/link";

type PokemonDetails = {
  name: string;
  id: number;
  flavor_text_entries: { flavor_text: string }[];
  abilities: { ability: { name: string } }[];
  sprites: { front_default: string };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
};

const Page = ({ params }: { params: { id: string } }) => {
  //   const router = useRouter();
  const [pokemonDetails, setPokemonDetails] = useState<PokemonDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetailedPokemonData = async () => {
      setIsLoading(true);
      const pokemonResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${params.id}/`,
        { cache: "force-cache" }
      );
      const pokemonData = await pokemonResponse.json();
      const dexEntryResponse = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${params.id}/`
      );
      const pokemonDexEntry = await dexEntryResponse.json();

      const pokemonDetailedData: PokemonDetails = {
        name: pokemonData.name,
        id: pokemonData.id,
        flavor_text_entries: pokemonDexEntry.flavor_text_entries,
        abilities: pokemonData.abilities,
        sprites: pokemonData.sprites,
        types: pokemonData.types,
        stats: pokemonData.stats,
      };
      setPokemonDetails(pokemonDetailedData);
      setIsLoading(false);
    };

    const fetchPokemonDexEntry = async () => {};

    if (params.id) {
      fetchDetailedPokemonData();
      fetchPokemonDexEntry();
    }
  }, [params.id]);
  const getStatColor = (statValue: number): string => {
    if (statValue <= 49) {
      return "red";
    } else if (statValue > 49 && statValue <= 85) {
      return "orange";
    } else {
      return "green";
    }
  };

  return (
    <div>
      <Group m={15}>
        <Link href="/">
          <u>Back to home page</u>
        </Link>
      </Group>
      {pokemonDetails && (
        <Group m={15}>
          <Link href={`/pokemon/${pokemonDetails.id - 1}`}>
            <u>Previous Pokemon</u>
          </Link>
          <Link href={`/pokemon/${pokemonDetails.id + 1}`}>
            <u>Next Pokemon</u>
          </Link>
        </Group>
      )}

      <Card withBorder m={25}>
        {pokemonDetails && !isLoading ? (
          <div>
            <Flex gap={15}>
              <Card withBorder m={5}>
                <Image
                  src={pokemonDetails.sprites.front_default}
                  alt={pokemonDetails.name}
                  w="auto"
                  h="auto"
                />
              </Card>
              <Box>
                <Group gap="md">
                  <h1>{pokemonDetails.name}</h1>
                  <h3>№{pokemonDetails.id}</h3>
                </Group>
                <h3>Pokedex Entry:</h3>
                <p>{pokemonDetails.flavor_text_entries[0].flavor_text}</p>
              </Box>
            </Flex>
            <Flex gap="50px" mt={15}>
              <Box>
                <h3>Abilities:</h3>
                <ul style={{ listStyleType: "none" }}>
                  {pokemonDetails.abilities.map((ability, index) => (
                    <li key={index}>{ability.ability.name}</li>
                  ))}
                </ul>
              </Box>
              <Box>
                <h3>Types:</h3>
                <ul style={{ listStyleType: "none" }}>
                  {pokemonDetails.types.map((type, index) => (
                    <li key={index}>{type.type.name}</li>
                  ))}
                </ul>
              </Box>
            </Flex>

            <div>
              <h1>Base Stats:</h1>
              <Flex gap={10} w="60%" direction="column">
                {pokemonDetails.stats.map((stat, index) => (
                  <Flex key={index} gap={15}>
                    <div
                      style={{
                        width: "30%",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text c="gray">{stat.stat.name}</Text>
                      <Text>{stat.base_stat}</Text>
                    </div>
                    <Box w="100%">
                      <Box
                        bg={getStatColor(stat.base_stat)}
                        w={`${(stat.base_stat / 255) * 100}%`}
                        h="full"
                        p={10}
                      ></Box>
                    </Box>
                  </Flex>
                ))}
              </Flex>
            </div>
          </div>
        ) : (
          <Group gap={15}>
            <Text>Loading pokemon data</Text>
            <Loader color="gray" />
          </Group>
        )}
      </Card>
    </div>
  );
};

export default Page;
