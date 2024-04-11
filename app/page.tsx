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
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import Link from "next/link";
interface Pokemon {
  name: string;
  id: number;
}

interface PokemonAPIResponse {
  results: { name: string; url: string }[];
  next: string | null;
  previous: string | null;
}

export default function Home() {
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [filteredPokemonData, setFilteredPokemonData] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debounced] = useDebouncedValue(searchQuery, 200, { leading: true });
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(
    "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20"
  );
  const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPokemonData = async (url: string) => {
    setIsLoading(true);
    const res = await fetch(url);
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

  const handleSearch = (query: string) => {
    const filtered = pokemonData.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPokemonData(filtered);
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

  useEffect(() => {
    fetchPokemonData("https://pokeapi.co/api/v2/pokemon/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPokemonData(pokemonData);
    } else {
      handleSearch(debounced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, pokemonData]);

  return (
    <Container>
      <h1>Pokemon Cards App</h1>
      <TextInput
        w="100%"
        placeholder="Search for a Pokémon"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
      />
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
      <Grid mb="10vh">
        {filteredPokemonData.map((pokemon, index) => (
          <GridCol span={3} key={index}>
            <Link href={`/pokemon/${pokemon.id}`}>
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
      </Grid>
    </Container>
  );
}
