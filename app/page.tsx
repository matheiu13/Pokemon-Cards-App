"use client";
import { useState, useEffect } from "react";
import {
  Card,
  Container,
  Grid,
  GridCol,
  Text,
  TextInput,
  Image,
  Loader,
  Button,
  Box,
  Group,
  NativeSelect,
} from "@mantine/core";
import Link from "next/link";
type Pokemon = {
  pokemon: { name: string; url: string };
  id: number;
  name: string;
};

type PokemonAPIResponse = {
  results: { name: string; url: string }[];
  next: string | null;
  previous: string | null;
};

const nativeSelectData: string[] = [
  "Filter by type",
  "Normal",
  "Fire",
  "Water",
  "Electric",
  "Grass",
  "Ice",
  "Fighting",
  "Poison",
  "Ground",
  "Flying",
  "Psychic",
  "Bug",
  "Rock",
  "Ghost",
  "Dragon",
  "Dark",
  "Steel",
  "Fairy",
];

export default function Home() {
  // const router = useRouter();
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [searchPokemonData, setSearchPokemonData] = useState<Pokemon>();
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(
    "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20"
  );
  const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchByFilter, setFetchByFilter] = useState<boolean>(false);
  const [fetchByQuery, setFetchQuery] = useState<boolean>(false);

  const fetchPokemonData = async (url: string) => {
    setIsLoading(true);
    const res = await fetch(url, { cache: "force-cache" });
    const data: PokemonAPIResponse = await res.json();
    setNextPageUrl(data.next);
    setPreviousPageUrl(data.previous);
    console.log(previousPageUrl);
    const detailedPokemonData = await getAllPokemonData(data.results);
    setPokemonData([...detailedPokemonData]);
    setIsLoading(false);
  };

  const getAllPokemonData = async (
    pokemonList: { name: string; url: string }[]
  ) => {
    const detailedPokemonData = await Promise.all(
      pokemonList.map(async (pokemon) => {
        const res = await fetch(pokemon.url);
        const details = await res.json();
        return {
          name: pokemon.name,
          id: details.id,
        } as Pokemon;
      })
    );
    return detailedPokemonData;
  };

  const handleFilterByType = async (query: string) => {
    if (query != "Filter by type") {
      const pokemonTypeResponse = await fetch(
        `https://pokeapi.co/api/v2/type/${query.toLocaleLowerCase()}`
      );
      const pokemonTypeData = await pokemonTypeResponse.json();
      // console.log(pokemonTypeData.pokemon);
      setPokemonData(pokemonTypeData.pokemon);
      setFetchByFilter(true);
      setFetchQuery(true);
    } else {
      fetchPokemonData("https://pokeapi.co/api/v2/pokemon-species/");
      setFetchByFilter(false);
      setFetchQuery(false);
    }
  };

  const handleSearchByQuery = async (query: string) => {
    const searchQueryResponse = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${query}/`
    );
    const searchQueryData = await searchQueryResponse.json();
    const pokemonBasicData: Pokemon = {
      name: searchQueryData.name,
      id: searchQueryData.id,
      pokemon: { name: "", url: "" },
    };

    setSearchPokemonData(pokemonBasicData);
    setFetchQuery(true);
  };

  const handleLoadMore = () => {
    if (nextPageUrl) {
      fetchPokemonData(nextPageUrl);
    }
  };

  const handleLoadPrevious = () => {
    if (previousPageUrl) {
      fetchPokemonData(previousPageUrl);
    }
  };

  const handlePokemonNumber = (url: string) => {
    const secondLastSlashIndex = url.lastIndexOf("/", url.lastIndexOf("/") - 1);
    const pokemonNumber = url.substring(
      secondLastSlashIndex + 1,
      url.lastIndexOf("/")
    );
    return pokemonNumber;
  };

  useEffect(() => {
    fetchPokemonData("https://pokeapi.co/api/v2/pokemon-species/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container>
      <h1>Pokemon Cards App</h1>
      <Group gap={0} p={0}>
        <TextInput
          id="search"
          w="70%"
          placeholder="Search for a Pokémon"
          radius={0}
          style={{
            borderTopLeftRadius: "5px",
            borderBottomLeftRadius: "5px",
          }}
        />
        <NativeSelect
          w="15%"
          c="gray"
          radius="0"
          data={nativeSelectData}
          onChange={(event) => {
            handleFilterByType(event.currentTarget.value);
          }}
        />
        <Button
          radius={0}
          w="15%"
          style={{
            borderTopRightRadius: "5px",
            borderBottomRightRadius: "5px",
          }}
          onClick={() => {
            const input = document.getElementById("search") as HTMLInputElement;
            handleSearchByQuery(input.value);
          }}
        >
          Search
        </Button>
      </Group>
      {!fetchByFilter && !fetchByQuery ? (
        <Group gap="xs" my="10px" justify="flex-end">
          {previousPageUrl && (
            <Button
              onClick={handleLoadPrevious}
              disabled={isLoading}
              color="rgba(26, 16, 89, 1)"
            >
              {isLoading ? "Loading..." : "Previous"}
            </Button>
          )}
          {nextPageUrl && (
            <Button
              onClick={handleLoadMore}
              disabled={isLoading}
              color="rgba(26, 16, 89, 1)"
            >
              {isLoading ? "Loading..." : "Next"}
            </Button>
          )}
        </Group>
      ) : (
        <br></br>
      )}

      <Grid mb="10vh">
        {fetchByFilter && fetchByQuery ? (
          <>
            {pokemonData.map((pokemon, index) => {
              return (
                <GridCol span={3} key={index}>
                  <Link
                    href={`/pokemon/${handlePokemonNumber(
                      pokemon.pokemon.url
                    )}`}
                  >
                    <Card w="100%" h="100%" withBorder>
                      {isLoading ? (
                        <Box m="full" h="full">
                          <Loader color="gray" />
                        </Box>
                      ) : (
                        <Box>
                          <Text>{pokemon.pokemon.name}</Text>
                          <Image
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${handlePokemonNumber(
                              pokemon.pokemon.url
                            )}.png`}
                            alt={pokemon.name}
                            style={{ width: "100%", height: "auto" }}
                          />
                        </Box>
                      )}
                    </Card>
                  </Link>
                </GridCol>
              );
            })}
          </>
        ) : (
          <>
            {fetchByQuery ? (
              <GridCol span={3}>
                <Link href={`/pokemon/${searchPokemonData?.id}`}>
                  <Card w="100%" h="100%" withBorder>
                    {isLoading ? (
                      <Box m="full" h="full">
                        <Loader color="gray" />
                      </Box>
                    ) : (
                      <Box>
                        <Text>{searchPokemonData?.name}</Text>
                        <Image
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${searchPokemonData?.id}.png`}
                          alt={searchPokemonData?.name}
                          style={{ width: "100%", height: "auto" }}
                        />
                      </Box>
                    )}
                  </Card>
                </Link>
              </GridCol>
            ) : (
              <>
                {pokemonData.map((pokemon, index) => (
                  <GridCol span={3} key={index}>
                    <Link href={`/pokemon/${pokemon.name}`}>
                      <Card w="100%" h="100%" withBorder>
                        {isLoading ? (
                          <Box m="full" h="full">
                            <Loader color="gray" />
                          </Box>
                        ) : (
                          <Box>
                            <Text>{pokemon.name}</Text>
                            <Image
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                              alt={pokemon.name}
                              style={{ width: "100%", height: "auto" }}
                            />
                          </Box>
                        )}
                      </Card>
                    </Link>
                  </GridCol>
                ))}
              </>
            )}
          </>
        )}
      </Grid>
    </Container>
  );
}
