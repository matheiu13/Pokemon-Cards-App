import { Card, Container, Grid, GridCol, Text, TextInput } from "@mantine/core";

export default async function Home() {
  const data = await getPokemonData();
  const pokemonData = await data.results;
  return (
    <Container>
      <h1>Pokemon Cards App</h1>
      <TextInput w="100%" placeholder="Search for an item" />
      <br />
      <Grid>
        {pokemonData.map(
          (pokemon: { name: string; url: string }, index: number) => {
            return (
              <GridCol span={3} key={index}>
                <Card withBorder>
                  <Text>{pokemon.name}</Text>
                </Card>
              </GridCol>
            );
          }
        )}
      </Grid>
    </Container>
  );
}

async function getPokemonData() {
  const res = await fetch(
    "https://pokeapi.co/api/v2/pokemon/?offset=20&limit=20",
    { cache: "force-cache" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
