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
  // Loader,
} from "@mantine/core";
// import { debounce } from "lodash";
import { useDebouncedValue } from "@mantine/hooks";
interface Pokemon {
  name: string;
  id: number;
}

interface PokemonAPIResponse {
  results: { name: string; url: string }[];
  next: string | null;
}

export default function Home() {
  const [pokemonData, setPokemonData] = useState<Pokemon[]>([]);
  const [filteredPokemonData, setFilteredPokemonData] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debounced] = useDebouncedValue(searchQuery, 200, { leading: true });

  const fetchPokemonData = async (url: string) => {
    const res = await fetch(url);
    const data: PokemonAPIResponse = await res.json();
    const detailedPokemonData = await getAllPokemonData(data.results);
    setPokemonData([...pokemonData, ...detailedPokemonData]);
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

      <br />
      <Grid>
        {filteredPokemonData.map((pokemon, index) => (
          <GridCol span={3} key={index}>
            <Card withBorder>
              <Text>{pokemon.name}</Text>
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                alt={pokemon.name}
                style={{ width: "100%", height: "auto" }}
              />
            </Card>
          </GridCol>
        ))}
      </Grid>
    </Container>
  );
}
